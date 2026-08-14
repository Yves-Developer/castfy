import { api } from "@castfy/backend/api";
import { getConvexClient } from "@/lib/convex";
import type { AgentStep, SseEventData, SseHandlers } from "@/types";

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

interface JobEvent {
  data?: unknown;
  message?: string;
  seq: number;
  type: string;
}

/** Flattens a stored event back into the payload shape the handlers expect. */
function toSseData(event: JobEvent): SseEventData {
  const base =
    typeof event.data === "object" && event.data !== null
      ? (event.data as Record<string, unknown>)
      : {};
  return {
    ...base,
    ...(event.message ? { message: event.message } : {}),
  } as SseEventData;
}

/**
 * The query returns the job's whole log every time, so dispatch only what's
 * past the cursor — that way a reconnect replays silently instead of
 * re-emitting every step the UI has already rendered.
 */
function drainEvents(
  events: JobEvent[],
  cursor: { dispatched: number },
  handlers: SseHandlers,
  finish: () => void
): void {
  for (const event of events) {
    if (event.seq <= cursor.dispatched) {
      continue;
    }
    cursor.dispatched = event.seq;
    dispatchSseEvent(event.type, toSseData(event), handlers);
    if (event.type === "completed" || event.type === "error") {
      finish();
    }
  }
}

/**
 * Enqueue a recording and follow it.
 *
 * The job runs in a worker, not in this request, so closing the tab no longer
 * kills it — Convex pushes progress reactively and replays anything missed
 * while disconnected, which is what the SSE stream and its Last-Event-ID
 * bookkeeping used to do by hand.
 *
 * `onJobId` hands the caller the durable id. Nothing stores it yet, so a
 * refresh still loses sight of a running job; the job itself survives, and
 * reattaching is now just a matter of holding onto this value.
 */
export function generateDemo(
  params: URLSearchParams,
  handlers: SseHandlers & { onJobId?: (jobId: string) => void }
): Promise<void> {
  return new Promise((resolve) => {
    const cursor = { dispatched: 0 };
    let unsubscribe: (() => void) | undefined;
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      unsubscribe?.();
      resolve();
    };

    const fail = (message: string) => {
      handlers.onError(message);
      finish();
    };

    let client: ReturnType<typeof getConvexClient>;
    try {
      client = getConvexClient();
    } catch (err) {
      fail(err instanceof Error ? err.message : "Convex is not configured.");
      return;
    }

    client
      .mutation(api.jobs.enqueue, {
        headless: params.get("headless") !== "false",
        promptGoal: params.get("promptGoal") ?? "",
        url: params.get("url") ?? "",
      })
      .then((jobId: string) => {
        handlers.onJobId?.(jobId);
        unsubscribe = client.onUpdate(
          api.jobs.events,
          { jobId: jobId as never },
          (events: JobEvent[]) => {
            drainEvents(events, cursor, handlers, finish);
          }
        );
      })
      .catch((err: unknown) => {
        fail(err instanceof Error ? err.message : "Failed to generate demo.");
      });
  });
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
