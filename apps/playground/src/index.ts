import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import { runAgent } from "./core/agent.js";
import { assertPublicUrl } from "./core/url-guard.js";

const app = express();
const PORT = process.env.PORT || 4000;
// Public origin used to build returned asset URLs. Must match how clients reach
// this server (behind a proxy/domain, set BASE_URL explicitly).
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
// Simple in-process cap so a burst of requests can't spawn unbounded browsers /
// ffmpeg renders. A real queue (Redis/BullMQ) is the production answer.
const MAX_CONCURRENT_JOBS = Number(process.env.MAX_CONCURRENT_JOBS || 2);
let activeJobs = 0;

app.use(cors());
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

// Full E2E Live Video Generation (SSE Streaming)
app.all("/api/generate", async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const isGet = req.method === "GET";
  const url = isGet ? (req.query.url as string) : req.body.url;
  const promptGoal = isGet
    ? (req.query.promptGoal as string)
    : req.body.promptGoal;
  const headlessRaw = isGet ? req.query.headless : req.body.headless;
  const headless =
    headlessRaw === undefined
      ? true
      : headlessRaw === "true" || headlessRaw === true;

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

  const keepAliveInterval = setInterval(() => {
    res.write(":\n\n");
  }, 2000);

  req.on("close", () => {
    clearInterval(keepAliveInterval);
  });

  const sendEvent = (event: string, data: unknown) => {
    console.log(`[SSE Server] Sending event: ${event}`);
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const resWithFlush = res as unknown as { flush?: () => void };
    if (typeof resWithFlush.flush === "function") {
      resWithFlush.flush();
    }
  };

  try {
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
      }
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

    clearInterval(keepAliveInterval);
    sendEvent("completed", {
      videoUrl,
      videos,
      goalConfirmed: result.goalConfirmed,
      deliverables: result.deliverables,
      steps: result.steps,
    });
    res.end();
  } catch (error: unknown) {
    clearInterval(keepAliveInterval);
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error in /api/generate:", err);
    sendEvent("error", { message: err.message || "Internal Server Error" });
    res.end();
  } finally {
    activeJobs -= 1;
  }
});

app.listen(PORT, () => {
  console.log(`Playground API listening on http://localhost:${PORT}`);
});
