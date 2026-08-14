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
 * The id of the run this browser is watching. A job outlives the page now, so
 * without somewhere to write this down a refresh loses sight of a recording
 * that is still going — the events stay in Convex, but nothing asks for them.
 */
const ACTIVE_JOB_KEY = "castfy.activeJobId";

export function readActiveJobId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_JOB_KEY);
  } catch {
    // Private mode or storage disabled; resuming is a nicety, not a
    // requirement, so fall back to behaving like a fresh page.
    return null;
  }
}

function rememberActiveJob(jobId: string): void {
  try {
    localStorage.setItem(ACTIVE_JOB_KEY, jobId);
  } catch {
    // See readActiveJobId.
  }
}

export function forgetActiveJob(): void {
  try {
    localStorage.removeItem(ACTIVE_JOB_KEY);
  } catch {
    // See readActiveJobId.
  }
}

/**
 * Subscribe to a job that already exists and replay its whole log.
 *
 * Because the events query returns every row from seq 0, reattaching after a
 * refresh rebuilds the timeline from the start — the steps that happened while
 * the page was gone included. This is the payoff for making jobs durable.
 */
export function followJob(
  jobId: string,
  handlers: SseHandlers
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
      forgetActiveJob();
      resolve();
    };

    let client: ReturnType<typeof getConvexClient>;
    try {
      client = getConvexClient();
    } catch (err) {
      handlers.onError(
        err instanceof Error ? err.message : "Convex is not configured."
      );
      finish();
      return;
    }

    unsubscribe = client.onUpdate(
      api.jobs.events,
      { jobId: jobId as never },
      (events: JobEvent[]) => {
        drainEvents(events, cursor, handlers, finish);
      }
    );
  });
}

/**
 * Look up a remembered job and decide whether it is still worth watching.
 * Returns its status, or null if there is nothing to resume.
 */
export async function inspectActiveJob(
  jobId: string
): Promise<{ status: string; videos?: Record<string, string> } | null> {
  try {
    const job = await getConvexClient().query(api.jobs.get, {
      jobId: jobId as never,
    });
    return job ?? null;
  } catch {
    // A stale id from an older deployment, or Convex unreachable.
    return null;
  }
}

/** Enqueue a recording and follow it. */
export function generateDemo(
  params: URLSearchParams,
  handlers: SseHandlers & { onJobId?: (jobId: string) => void }
): Promise<void> {
  let client: ReturnType<typeof getConvexClient>;
  try {
    client = getConvexClient();
  } catch (err) {
    handlers.onError(
      err instanceof Error ? err.message : "Convex is not configured."
    );
    return Promise.resolve();
  }

  return client
    .mutation(api.jobs.enqueue, {
      headless: params.get("headless") !== "false",
      promptGoal: params.get("promptGoal") ?? "",
      url: params.get("url") ?? "",
    })
    .then((jobId: string) => {
      rememberActiveJob(jobId);
      handlers.onJobId?.(jobId);
      return followJob(jobId, handlers);
    })
    .catch((err: unknown) => {
      handlers.onError(
        err instanceof Error ? err.message : "Failed to generate demo."
      );
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
