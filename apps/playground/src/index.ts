import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { runAgent } from "./core/agent.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve output files statically under /output
app.use("/output", express.static(path.join(process.cwd(), "output")));

app.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "Playground Backend is running!" });
});

// Full E2E Live Video Generation (SSE Streaming)
app.post("/api/generate", async (req, res) => {
  const { url, promptGoal, headless } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  if (!promptGoal) {
    return res
      .status(400)
      .json({ error: "Goal/Instructions are required for the recording" });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Content-Encoding", "none");
  res.flushHeaders();

  // Disable Nagle's algorithm to write chunks immediately
  req.socket.setNoDelay(true);

  // Send an initial comment to flush buffer and establish connection
  res.write(":\n\n");

  const sendEvent = (event: string, data: any) => {
    console.log(`[SSE Server] Sending event: ${event}`);
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as any).flush === "function") {
      (res as any).flush();
    }
  };

  try {
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), "output", `${timestamp}`);

    sendEvent("status", { message: "Starting agent..." });

    const isHeadless = headless === undefined ? false : !!headless;

    const result = await runAgent(
      url,
      promptGoal,
      outputDir,
      isHeadless,
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

    const videoUrl = `http://localhost:4000/output/${timestamp}/demo.webm`;

    sendEvent("completed", {
      videoUrl,
      deliverables: result.deliverables,
      steps: result.steps,
    });
    res.end();
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    sendEvent("error", { message: error.message || "Internal Server Error" });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Playground API listening on http://localhost:${PORT}`);
});
