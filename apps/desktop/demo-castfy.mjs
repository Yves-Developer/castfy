import { mkdirSync, writeFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromePath) {
  throw new Error("Could not find Chrome or Edge executable");
}

const port = 9222;
const userDataDir = join(tmpdir(), `castfy-demo-profile-${Date.now()}`);
const captureDir = join(tmpdir(), `castfy-demo-capture-${Date.now()}`);
mkdirSync(captureDir, { recursive: true });

const chromeArgs = [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  "--new-window",
  "--window-size=1440,900",
  "--disable-features=Translate,OptimizationHints",
  "https://castfy.app",
];

const chrome = spawn(chromePath, chromeArgs, {
  detached: true,
  stdio: "ignore",
});

chrome.unref();

const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitFor = async (check, timeoutMs = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await check();
      if (value) {
        return value;
      }
    } catch {}
    await sleep(250);
  }
  throw new Error("Timed out waiting for condition");
};

const version = await waitFor(async () => {
  const response = await fetch(`http://127.0.0.1:${port}/json/version`);
  if (!response.ok) {
    return null;
  }
  return response.json();
});

const pageSocket = new WebSocket(version.webSocketDebuggerUrl);

const pending = new Map();
let nextId = 1;

pageSocket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const pendingEntry = pending.get(message.id);
    if (!pendingEntry) {
      return;
    }
    pending.delete(message.id);
    if (message.error) {
      pendingEntry.reject(new Error(message.error.message || "CDP command failed"));
      return;
    }
    pendingEntry.resolve(message.result);
  }
});

const send = (method, params = {}) => {
  const id = nextId++;
  pageSocket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
};

await new Promise((resolve, reject) => {
  pageSocket.addEventListener("open", resolve, { once: true });
  pageSocket.addEventListener("error", reject, { once: true });
});

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

await send("Page.navigate", { url: "https://castfy.app" });
await waitFor(async () => {
  const result = await send("Runtime.evaluate", {
    expression: "document.readyState",
    returnByValue: true,
  });
  return result?.result?.value === "complete" ? result : null;
});

const textResult = await send("Runtime.evaluate", {
  expression: "document.body ? document.body.innerText.slice(0, 6000) : ''",
  returnByValue: true,
});

const fullText = textResult.result.value || "";
writeFileSync(join(captureDir, "page-text.txt"), fullText, "utf8");

const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
writeFileSync(join(captureDir, "home.png"), Buffer.from(shot.data, "base64"));

await send("Runtime.evaluate", {
  expression: `window.scrollTo({ top: Math.max(0, document.body.scrollHeight * 0.45), behavior: 'instant' })`,
});
await sleep(1200);

const shot2 = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
writeFileSync(join(captureDir, "mid.png"), Buffer.from(shot2.data, "base64"));

await send("Runtime.evaluate", {
  expression: `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`,
});
await sleep(1200);

const shot3 = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
writeFileSync(join(captureDir, "bottom.png"), Buffer.from(shot3.data, "base64"));

writeFileSync(join(captureDir, "capture-dir.txt"), captureDir, "utf8");

pageSocket.close();

console.log(JSON.stringify({ captureDir, chromePath, title: fullText.split("\n")[0] || "" }, null, 2));
