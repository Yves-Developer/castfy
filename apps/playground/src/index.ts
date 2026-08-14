import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import { runAgent } from "./core/agent.js";
import {
  assertAuthConfigured,
  isAuthConfigured,
  parseAllowedOrigins,
  requireApiToken,
} from "./core/auth.js";
import { assertPublicUrl } from "./core/url-guard.js";

const app = express();
const PORT = process.env.PORT || 3001;
// Public origin used to build returned asset URLs. Must match how clients reach
// this server (behind a proxy/domain, set BASE_URL explicitly).
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// Simple in-process cap so a burst of requests can't spawn unbounded browsers /
// ffmpeg renders. A real queue (Redis/BullMQ) is the production answer.
const MAX_CONCURRENT_JOBS = Number(process.env.MAX_CONCURRENT_JOBS || 2);
// Wall-clock ceiling for one run. Without it a wedged browser holds a slot
// forever, and with MAX_CONCURRENT_JOBS=2 two of those wedge the whole server.
const JOB_TIMEOUT_MS = Number(process.env.JOB_TIMEOUT_MS || 2_400_000);
// How long SIGTERM waits for in-flight runs before aborting them outright.
const SHUTDOWN_GRACE_MS = Number(process.env.SHUTDOWN_GRACE_MS || 60_000);

let activeJobs = 0;
let acceptingJobs = true;
const inFlight = new Set<AbortController>();

assertAuthConfigured();

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

// Serve output files statically under /output
app.use("/output", express.static(path.join(process.cwd(), "output")));

app.get("/ping", (_req, res) => {
  res.json({ status: "ok", message: "Playground Backend is running!" });
});

function resolveVideoFile(
  files: Record<string, unknown> | undefined | null
): string {
  if (!files) {
    return "demo.webm";
  }
  if (files.videoWithAudioClean) {
    return "demo-with-audio-clean.mp4";
  }
  if (files.videoWithAudio) {
    return "demo-with-audio.mp4";
  }
  if (files.videoClean) {
    return "demo-clean.webm";
  }
  return "demo.webm";
}

function buildVideosMap(
  files: Record<string, unknown> | undefined | null,
  baseUrl: string
): Record<string, string> {
  const videos: Record<string, string> = {};
  if (!files) {
    return videos;
  }
  if (files.video) {
    videos.raw = `${baseUrl}/demo.webm`;
  }
  if (files.videoClean) {
    videos.clean = `${baseUrl}/demo-clean.webm`;
  }
  if (files.videoWithAudio) {
    videos.audio = `${baseUrl}/demo-with-audio.mp4`;
  }
  if (files.videoWithAudioClean) {
    videos.audioClean = `${baseUrl}/demo-with-audio-clean.mp4`;
  }
  return videos;
}

interface GenerateParams {
  url: string | undefined;
  promptGoal: string | undefined;
  headless: boolean;
}

/** Accepts the same fields via query string (GET) or JSON body (POST). */
function readGenerateParams(req: express.Request): GenerateParams {
  const isGet = req.method === "GET";
  const headlessRaw = isGet ? req.query.headless : req.body.headless;

  return {
    url: isGet ? (req.query.url as string) : req.body.url,
    promptGoal: isGet ? (req.query.promptGoal as string) : req.body.promptGoal,
    headless:
      headlessRaw === undefined
        ? true
        : headlessRaw === "true" || headlessRaw === true,
  };
}

// Full E2E Live Video Generation (SSE Streaming)
app.all("/api/generate", requireApiToken, async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Draining for shutdown: reject new work but let in-flight runs finish.
  if (!acceptingJobs) {
    return res
      .status(503)
      .json({ error: "Server is shutting down. Please retry shortly." });
  }

  const { url, promptGoal, headless } = readGenerateParams(req);

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!promptGoal) {
    return res
      .status(400)
      .json({ error: "Goal/Instructions are required for the recording" });
  }

  // SSRF guard: never let a user-supplied URL drive the browser to an internal
  // host (loopback, private ranges, cloud metadata). Runs before we open SSE.
  try {
    await assertPublicUrl(url);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid URL";
    return res.status(400).json({ error: message });
  }

  // Backpressure: reject at capacity rather than spawning unbounded browsers.
  if (activeJobs >= MAX_CONCURRENT_JOBS) {
    return res
      .status(429)
      .json({ error: "Server is at capacity. Please retry shortly." });
  }
  activeJobs += 1;

  // Everything from here on lives inside try/finally. The increment above used
  // to sit ~35 lines before the try, so a client vanishing mid-handshake threw
  // on socket write and stranded the slot for the process lifetime.
  const controller = new AbortController();
  inFlight.add(controller);
  let keepAliveInterval: NodeJS.Timeout | undefined;
  let jobTimeout: NodeJS.Timeout | undefined;
  let finished = false;

  try {
    jobTimeout = setTimeout(() => {
      controller.abort(new Error(`Job exceeded ${JOB_TIMEOUT_MS}ms`));
    }, JOB_TIMEOUT_MS);

    // Set headers for Server-Sent Events (SSE) and send status code immediately
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    });
    res.flushHeaders();

    // Disable Nagle's algorithm to write chunks immediately
    req.socket.setNoDelay(true);

    // Send 4KB padding of comment lines to flush intermediate proxy and browser buffers
    res.write(`:${" ".repeat(4096)}\n\n`);

    keepAliveInterval = setInterval(() => {
      res.write(":\n\n");
    }, 2000);

    req.on("close", () => {
      // `close` also fires on normal completion, so only treat it as a
      // cancellation while work is still outstanding. Until jobs are durable
      // (Phase 1) a dropped connection makes the result unrecoverable, so
      // continuing would only burn credits and hold a slot.
      if (!finished) {
        controller.abort(new Error("Client disconnected"));
      }
    });

    await runGeneration({ req, res, url, promptGoal, headless, controller });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error in /api/generate:", err);
    // Headers may not have been sent if writeHead itself threw.
    if (res.headersSent) {
      res.write(
        `event: error\ndata: ${JSON.stringify({
          message: err.message || "Internal Server Error",
        })}\n\n`
      );
      res.end();
    } else if (!res.writableEnded) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } finally {
    finished = true;
    clearInterval(keepAliveInterval);
    clearTimeout(jobTimeout);
    inFlight.delete(controller);
    activeJobs -= 1;
  }
});

interface GenerationArgs {
  req: express.Request;
  res: express.Response;
  url: string;
  promptGoal: string;
  headless: boolean;
  controller: AbortController;
}

async function runGeneration({
  res,
  url,
  promptGoal,
  headless,
  controller,
}: GenerationArgs): Promise<void> {
  const sendEvent = (event: string, data: unknown) => {
    console.log(`[SSE Server] Sending event: ${event}`);
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const resWithFlush = res as unknown as { flush?: () => void };
    if (typeof resWithFlush.flush === "function") {
      resWithFlush.flush();
    }
  };

  const timestamp = Date.now();
  const outputDir = path.join(process.cwd(), "output", `${timestamp}`);

  sendEvent("status", { message: "Starting agent..." });

  const result = await runAgent(
    url,
    promptGoal,
    outputDir,
    headless,
    (step) => {
      sendEvent("step", step);
    },
    (status) => {
      sendEvent("status", { message: status });
    },
    { signal: controller.signal }
  );

  if (result.error) {
    throw new Error(result.error);
  }

  const files = (
    result.deliverables as
      | { deliverables?: { files?: Record<string, unknown> } }
      | null
      | undefined
  )?.deliverables?.files;
  const baseUrl = `${BASE_URL}/output/${timestamp}`;
  const videos = buildVideosMap(files, baseUrl);
  const videoFile = resolveVideoFile(files);
  const videoUrl = `${baseUrl}/${videoFile}`;

  sendEvent("completed", {
    videoUrl,
    videos,
    goalConfirmed: result.goalConfirmed,
    deliverables: result.deliverables,
    steps: result.steps,
  });
  res.end();
}

const server = app.listen(PORT, () => {
  console.log(`Playground API listening on http://localhost:${PORT}`);
  if (!isAuthConfigured()) {
    console.warn(
      "[auth] PLAYGROUND_API_TOKEN is not set — /api/generate is OPEN. " +
        "Acceptable for local development only."
    );
  }
  if (allowedOrigins.length === 0) {
    console.warn(
      "[cors] ALLOWED_ORIGINS is not set — browser requests will be blocked. " +
        "Set it to your dashboard origin(s) to allow them."
    );
  }
});

/**
 * Drain on SIGTERM so a deploy doesn't kill recordings mid-take: stop accepting
 * new work, let in-flight runs finish, and only abort them (which closes each
 * MCP client and its browser) once the grace period is spent.
 */
function shutdown(signalName: string): void {
  if (!acceptingJobs) {
    return;
  }
  acceptingJobs = false;
  console.log(
    `[shutdown] ${signalName} received; draining ${activeJobs} job(s).`
  );

  server.close(() => {
    console.log("[shutdown] HTTP server closed.");
  });

  const startedAt = Date.now();
  const poll = setInterval(() => {
    if (activeJobs === 0) {
      clearInterval(poll);
      console.log("[shutdown] All jobs finished. Exiting.");
      process.exit(0);
    }
    if (Date.now() - startedAt >= SHUTDOWN_GRACE_MS) {
      clearInterval(poll);
      console.warn(
        `[shutdown] Grace period elapsed with ${activeJobs} job(s) still running; aborting them.`
      );
      for (const controller of inFlight) {
        controller.abort(new Error("Server shutting down"));
      }
      // Give the abort a moment to close MCP clients before the process dies.
      setTimeout(() => process.exit(1), 5000);
    }
  }, 500);
  // Don't let the drain timer itself keep the process alive.
  poll.unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
