import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import { runAgent, runMap, runScrape } from "./core/agent.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve output files statically under /output
app.use("/output", express.static(path.join(process.cwd(), "output")));

app.get("/ping", (_req, res) => {
  res.json({ status: "ok", message: "Playground Backend is running!" });
});

// Modular Test: Scrape Only
app.post("/api/test/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    console.log(`[Phase 1 Test] Extracting snapshot for ${url}...`);
    const result = await runScrape(url);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
});

// Modular Test: Map Only
app.post("/api/test/map", async (req, res) => {
  try {
    const { url, provider, promptGoal } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    if (!promptGoal) {
      return res
        .status(400)
        .json({ error: "promptGoal is required for the agentic loop" });
    }

    console.log(
      `[Phase 1 Test] Generating map with provider: ${provider || "anthropic"}...`
    );
    const result = await runMap(url, promptGoal, provider);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
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

  const sendEvent = (event: string, data: unknown) => {
    console.log(`[SSE Server] Sending event: ${event}`);
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const expressRes = res as unknown as { flush?: () => void };
    if (typeof expressRes.flush === "function") {
      expressRes.flush();
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
  } catch (error) {
    console.error("Error in /api/generate:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    sendEvent("error", { message });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Playground API listening on http://localhost:${PORT}`);
});
