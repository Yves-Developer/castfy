import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import { parseAllowedOrigins } from "./core/auth.js";
import { activeJobCount, startWorker, stopWorker } from "./core/worker.js";

/**
 * The playground no longer executes recordings in a request.
 *
 * Jobs are enqueued into Convex by the dashboard and picked up by the worker
 * below, so a restart or a closed tab can't destroy a run. What remains here is
 * the artifact server: the videos the worker writes to local disk, plus health.
 *
 * The worker runs in this same process on purpose — artifacts are still on
 * local disk, so whichever machine renders a video must also be the one serving
 * it. Splitting them into separate deployments is safe only after Phase 2 moves
 * artifacts to object storage.
 */

const app = express();
const PORT = process.env.PORT || 3001;
const SHUTDOWN_GRACE_MS = Number(process.env.SHUTDOWN_GRACE_MS || 60_000);
const RUN_WORKER = process.env.RUN_WORKER !== "false";

const allowedOrigins = parseAllowedOrigins();
app.use(
  cors(
    allowedOrigins.length > 0
      ? { origin: allowedOrigins, credentials: true }
      : // No allowlist configured: permit non-browser callers only. `origin:
        // false` omits the CORS headers entirely rather than echoing back
        // whatever Origin was sent.
        { origin: false }
  )
);
app.use(express.json());

// Rendered demos, served straight off disk until Phase 2.
app.use("/output", express.static(path.join(process.cwd(), "output")));

app.get("/ping", (_req, res) => {
  res.json({
    status: "ok",
    message: "Playground Backend is running!",
    worker: RUN_WORKER ? "enabled" : "disabled",
    activeJobs: activeJobCount(),
  });
});

const server = app.listen(PORT, () => {
  console.log(
    `Playground artifact server listening on http://localhost:${PORT}`
  );
  if (allowedOrigins.length === 0) {
    console.warn(
      "[cors] ALLOWED_ORIGINS is not set — browser requests will be blocked. " +
        "Set it to your dashboard origin(s) to allow them."
    );
  }
  if (RUN_WORKER) {
    startWorker();
  } else {
    console.warn(
      "[worker] RUN_WORKER=false — this process serves artifacts only."
    );
  }
});

/**
 * Drain on SIGTERM so a deploy doesn't kill recordings mid-take. Jobs are
 * durable now, so an aborted run returns to the queue via its expired lease
 * rather than being lost — but finishing cleanly still beats re-billing the
 * agent loop from scratch.
 */
let shuttingDown = false;

function shutdown(signalName: string): void {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(
    `[shutdown] ${signalName} received; draining ${activeJobCount()} job(s).`
  );

  server.close(() => {
    console.log("[shutdown] HTTP server closed.");
  });

  const startedAt = Date.now();
  const poll = setInterval(() => {
    if (activeJobCount() === 0) {
      clearInterval(poll);
      stopWorker()
        .catch((error: unknown) => {
          console.error("[shutdown] worker stop failed:", error);
        })
        .finally(() => {
          console.log("[shutdown] All jobs finished. Exiting.");
          process.exit(0);
        });
      return;
    }
    if (Date.now() - startedAt >= SHUTDOWN_GRACE_MS) {
      clearInterval(poll);
      console.warn(
        `[shutdown] Grace period elapsed with ${activeJobCount()} job(s) still running; aborting them.`
      );
      stopWorker().catch((error: unknown) => {
        console.error("[shutdown] worker stop failed:", error);
      });
      // Give the abort a moment to close MCP clients before the process dies.
      setTimeout(() => process.exit(1), 5000);
    }
  }, 500);
  // Don't let the drain timer itself keep the process alive.
  poll.unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
