import { randomUUID } from "node:crypto";
import path from "node:path";
import { api } from "@castfy/backend/api";
import { ConvexClient } from "convex/browser";
import { type AgentStep, runAgent } from "./agent.js";
import {
  buildVideosMap,
  extractDeliverableFiles,
  resolveVideoFile,
} from "./artifacts.js";
import { assertPublicUrl } from "./url-guard.js";

/**
 * Pulls jobs from Convex and runs them. This is the only place a recording
 * actually happens now — the HTTP layer no longer executes work, so a restart
 * or a closed tab can't destroy a run.
 *
 * The job cannot run inside Convex itself: Node actions cap at 10 minutes and
 * the V8 runtime can't spawn a process, while a render alone may take 30 and
 * needs Chromium plus ffmpeg. So Convex coordinates and this worker executes.
 */

const MAX_CONCURRENT_JOBS = Number(process.env.MAX_CONCURRENT_JOBS || 2);
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS || 2_400_000);

/** Well under the 90s lease, so a slow tick doesn't cost us the job. */
const HEARTBEAT_MS = 25_000;

/** Fallback poll, in case a reactive update is missed. */
const IDLE_POLL_MS = 5000;

/**
 * Convex caps a document at 1 MiB and agent snapshots can dwarf that. Events
 * are progress signals, not archives, so oversized fields get clipped rather
 * than failing the whole mutation.
 */
const EVENT_FIELD_LIMIT = 4000;

const WORKER_ID = `${process.env.HOSTNAME || "worker"}-${randomUUID().slice(0, 8)}`;

interface ClaimedJob {
  headless: boolean;
  jobId: string;
  promptGoal: string;
  url: string;
}

let client: ConvexClient | undefined;
let workerSecret = "";
let baseUrl = "";
let running = 0;
let draining = false;
let idleTimer: NodeJS.Timeout | undefined;
let unsubscribe: (() => void) | undefined;
const activeControllers = new Set<AbortController>();

/**
 * Run a promise we don't await. Logging the rejection matters: a bare `void`
 * would discard it, and a failed progress write would vanish silently.
 */
function detach(promise: Promise<unknown>, context: string): void {
  promise.catch((error: unknown) => {
    console.error(`[worker] ${context}:`, error);
  });
}

function clip(value: string | undefined): string | undefined {
  if (value === undefined) {
    return;
  }
  return value.length > EVENT_FIELD_LIMIT
    ? `${value.slice(0, EVENT_FIELD_LIMIT)}… [truncated]`
    : value;
}

function clipStep(step: AgentStep): AgentStep {
  return {
    ...step,
    description: clip(step.description) ?? "",
    error: clip(step.error),
    value: clip(step.value),
  };
}

async function publish(
  jobId: string,
  type: "status" | "step" | "completed" | "error",
  message?: string,
  data?: unknown
): Promise<void> {
  if (!client) {
    return;
  }
  try {
    await client.mutation(api.jobs.appendEvent, {
      data,
      jobId: jobId as never,
      message: clip(message),
      type,
      workerSecret,
    });
  } catch (error) {
    // A dropped progress event must never kill a running recording; the job
    // row still carries the terminal outcome.
    console.error(`[worker] failed to publish ${type} event:`, error);
  }
}

function startHeartbeat(
  jobId: string,
  controller: AbortController
): NodeJS.Timeout {
  return setInterval(() => {
    if (!client) {
      return;
    }
    detach(
      client
        .mutation(api.jobs.heartbeat, {
          jobId: jobId as never,
          workerId: WORKER_ID,
          workerSecret,
        })
        .then((result: { keepGoing: boolean; reason: string }) => {
          if (!result.keepGoing) {
            // Cancelled by the user, or the lease was reaped out from under
            // us. Aborting closes the MCP client, which kills the browser.
            console.log(`[worker] stopping job ${jobId}: ${result.reason}`);
            controller.abort(new Error(`Job ${result.reason}`));
          }
        }),
      "heartbeat failed"
    );
  }, HEARTBEAT_MS);
}

async function runJob(job: ClaimedJob): Promise<void> {
  const controller = new AbortController();
  activeControllers.add(controller);
  const heartbeat = startHeartbeat(job.jobId, controller);
  const jobTimeout = setTimeout(() => {
    controller.abort(new Error(`Job exceeded ${JOB_TIMEOUT_MS}ms`));
  }, JOB_TIMEOUT_MS);

  try {
    // Re-resolve here, not just at enqueue. Convex can't do DNS, and a name
    // that was public when submitted can point at 169.254.169.254 by now —
    // this is the only check that runs immediately before navigation.
    await assertPublicUrl(job.url);

    await publish(job.jobId, "status", "Starting agent...");

    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), "output", `${timestamp}`);

    const result = await runAgent(
      job.url,
      job.promptGoal,
      outputDir,
      job.headless,
      (step) => {
        detach(
          publish(job.jobId, "step", undefined, clipStep(step)),
          "step publish"
        );
      },
      (status) => {
        detach(publish(job.jobId, "status", status), "status publish");
      },
      { signal: controller.signal }
    );

    if (result.error) {
      throw new Error(result.error);
    }

    const files = extractDeliverableFiles(result.deliverables);
    const artifactBase = `${baseUrl}/output/${timestamp}`;
    const videos = buildVideosMap(files, artifactBase);

    await publish(job.jobId, "completed", undefined, {
      goalConfirmed: result.goalConfirmed,
      videoUrl: `${artifactBase}/${resolveVideoFile(files)}`,
      videos,
    });

    await client?.mutation(api.jobs.complete, {
      jobId: job.jobId as never,
      videos,
      workerSecret,
    });
    console.log(`[worker] job ${job.jobId} completed`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[worker] job ${job.jobId} failed:`, message);
    await publish(job.jobId, "error", message);
    await client?.mutation(api.jobs.fail, {
      error: message,
      jobId: job.jobId as never,
      // Agent failures repeat and re-bill the whole loop, so they stay
      // terminal. Only a lost lease is worth another attempt.
      retryable: message.includes("lost-lease"),
      workerSecret,
    });
  } finally {
    clearInterval(heartbeat);
    clearTimeout(jobTimeout);
    activeControllers.delete(controller);
  }
}

async function tryClaim(): Promise<void> {
  if (draining || !client || running >= MAX_CONCURRENT_JOBS) {
    return;
  }

  let claim: ClaimedJob | null = null;
  try {
    claim = (await client.mutation(api.jobs.claimNext, {
      workerId: WORKER_ID,
      workerSecret,
    })) as ClaimedJob | null;
  } catch (error) {
    console.error("[worker] claim failed:", error);
    return;
  }

  if (!claim) {
    return;
  }

  running += 1;
  console.log(`[worker] claimed job ${claim.jobId} (${running} running)`);
  detach(
    runJob(claim).finally(() => {
      running -= 1;
      detach(tryClaim(), "claim after completion");
    }),
    "job run"
  );

  // Fill any remaining capacity in the same pass.
  detach(tryClaim(), "claim for remaining capacity");
}

export function startWorker(): void {
  const url = process.env.CONVEX_URL;
  const secret = process.env.PLAYGROUND_WORKER_SECRET;

  if (!url) {
    throw new Error("CONVEX_URL must be set to run the worker.");
  }
  if (!secret) {
    throw new Error(
      "PLAYGROUND_WORKER_SECRET must be set, and must match the value on the " +
        "Convex deployment."
    );
  }

  workerSecret = secret;
  baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
  client = new ConvexClient(url);

  // Reactive: Convex pushes when the queue becomes non-empty, so a job starts
  // promptly instead of waiting out a poll interval.
  unsubscribe = client.onUpdate(api.jobs.pendingCount, {}, (pending) => {
    if (pending > 0) {
      detach(tryClaim(), "claim on queue update");
    }
  });

  idleTimer = setInterval(() => {
    detach(tryClaim(), "claim on idle poll");
  }, IDLE_POLL_MS);

  console.log(
    `[worker] ${WORKER_ID} started; concurrency ${MAX_CONCURRENT_JOBS}`
  );
  detach(tryClaim(), "initial claim");
}

/** Stops taking work and aborts anything still running. */
export async function stopWorker(): Promise<void> {
  draining = true;
  unsubscribe?.();
  clearInterval(idleTimer);
  for (const controller of activeControllers) {
    controller.abort(new Error("Worker shutting down"));
  }
  await client?.close();
}

export function activeJobCount(): number {
  return running;
}
