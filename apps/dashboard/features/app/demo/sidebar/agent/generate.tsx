import type { AgentStep, SseEventData, SseHandlers } from "@/types";

// Same-origin proxy at app/api/generate/route.ts, which attaches the
// playground's bearer token server-side. The browser never sees that token, so
// the playground origin is no longer configured here.
const GENERATE_ENDPOINT = "/api/generate";

// Choose which recorded variant to show first: clean audio > audio > clean > raw.
export function pickInitialVideo(
  videos: Record<string, string>,
  fallbackUrl?: string
): { tab: string; url: string } {
  if (videos.audioClean) {
    return { tab: "audioClean", url: videos.audioClean };
  }
  if (videos.audio) {
    return { tab: "audio", url: videos.audio };
  }
  if (videos.clean) {
    return { tab: "clean", url: videos.clean };
  }
  return { tab: "raw", url: videos.raw ?? fallbackUrl ?? "" };
}

async function readErrorMessage(response: Response): Promise<string> {
  // Non-SSE failures (SSRF-block 400, at-capacity 429, 405) return a JSON
  // { error } body — surface that instead of a bare status line.
  try {
    const body = (await response.json()) as { error?: string };
    if (body?.error) {
      return body.error;
    }
  } catch {
    // Non-JSON body; fall through to the status-line fallback.
  }
  return `Server error: ${response.statusText}`;
}

function dispatchSseEvent(
  event: string,
  data: SseEventData,
  handlers: SseHandlers
): void {
  switch (event) {
    case "status":
      if (data.message) {
        handlers.onStatus(data.message);
      }
      break;
    case "step":
      handlers.onStep(data as AgentStep);
      break;
    case "completed":
      handlers.onCompleted(data);
      break;
    case "error":
      handlers.onError(
        data.message ?? "An error occurred during demo generation."
      );
      break;
    default:
      break;
  }
}

function parseAndDispatch(
  event: string,
  dataStr: string,
  handlers: SseHandlers
): void {
  if (!dataStr) {
    return;
  }
  try {
    dispatchSseEvent(event, JSON.parse(dataStr) as SseEventData, handlers);
  } catch (e) {
    console.error("Failed to parse SSE event data:", dataStr, e);
  }
}

async function readSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  handlers: SseHandlers
): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { value: chunk, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("event: ")) {
        currentEvent = trimmed.slice(7).trim();
      } else if (trimmed.startsWith("data: ")) {
        parseAndDispatch(currentEvent, trimmed.slice(6).trim(), handlers);
      }
    }
  }
}

export async function generateDemo(
  params: URLSearchParams,
  handlers: SseHandlers
): Promise<void> {
  try {
    const response = await fetch(
      `${GENERATE_ENDPOINT}?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("ReadableStream is not supported by your browser.");
    }
    await readSseStream(reader, handlers);
  } catch (err) {
    handlers.onError(
      err instanceof Error ? err.message : "Failed to generate demo."
    );
  }
}

const VIDEO_TABS: { key: string; label: string }[] = [
  { key: "audioClean", label: " Clean" },
  { key: "audio", label: " Raw" },
  { key: "clean", label: "Clean" },
  { key: "raw", label: "Raw" },
];

export function VideoResult({
  videos,
  activeVideoTab,
  videoUrl,
  onSelect,
}: {
  videos: Record<string, string>;
  activeVideoTab: string;
  videoUrl: string;
  onSelect: (tab: string, url: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
          Recorded Video
        </h3>
        {Object.keys(videos).length > 1 && (
          <div className="inline-flex rounded-xl border border-slate-200/50 bg-slate-100 p-1">
            {VIDEO_TABS.filter((tab) => videos[tab.key]).map((tab) => (
              <button
                className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                  activeVideoTab === tab.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                key={tab.key}
                onClick={() => onSelect(tab.key, videos[tab.key])}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border bg-black shadow-lg">
        {/* biome-ignore lint/a11y/useMediaCaption: no captions for recorded demo video */}
        <video
          autoPlay
          className="aspect-video w-full object-contain"
          controls
          key={videoUrl}
          src={videoUrl}
        />
      </div>
    </div>
  );
}
