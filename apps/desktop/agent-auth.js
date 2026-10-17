import { execFile, spawn } from "node:child_process";

/**
 * Signing in to the agent a recording runs on.
 *
 * A recording runs the agent headless (`claude -p`), and a headless agent that
 * is not signed in fails a minute in with a message the user cannot act on.
 * So Castfy asks the agent before starting, and when it is not signed in,
 * opens the agent's own login in a terminal: the user signs in with the
 * agent's flow, in their browser, and Castfy never sees their credentials.
 */

/** Each agent's own login subcommand. */
const LOGIN_ARGS = {
  "claude-code": ["auth", "login"],
  codex: ["login"],
  cursor: ["login"],
};

/**
 * Whether the agent is signed in: true, false, or null when it cannot be told.
 *
 * Only Claude Code has a documented status check (`claude auth status`, exit 0
 * when signed in). The others return null and fall back to explaining the
 * failure after the run.
 */
export function signedIn(agentId, binary, env) {
  if (agentId !== "claude-code") {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    execFile(binary, ["auth", "status"], { env, timeout: 15_000 }, (error) => {
      if (!error) {
        return resolve(true);
      }
      // A non-zero exit is "not signed in"; anything else (timeout, an old CLI
      // without the subcommand) is not knowing, which must not block a run.
      resolve(typeof error.code === "number" ? false : null);
    });
  });
}

/** Quotes one argument for the shell a terminal runs it in. */
function shellQuote(arg, windows) {
  if (windows) {
    return /[\s"]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
  }
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

/**
 * Opens a terminal running the agent's login. Resolves once it has launched;
 * signing in happens there, in the agent's own flow.
 */
export function openLogin(agentId, binary) {
  const args = LOGIN_ARGS[agentId];
  if (!args) {
    return Promise.resolve({
      ok: false,
      error: `Castfy cannot sign in to ${agentId}.`,
    });
  }

  const windows = process.platform === "win32";
  const command = [binary, ...args]
    .map((a) => shellQuote(a, windows))
    .join(" ");

  let launch;
  if (process.platform === "darwin") {
    // Terminal runs the login; activate brings it to the front.
    const script = `tell application "Terminal"\nactivate\ndo script ${JSON.stringify(command)}\nend tell`;
    launch = ["osascript", ["-e", script]];
  } else if (windows) {
    // `start` opens a new console window; /k keeps it open to read the result.
    launch = ["cmd.exe", ["/c", "start", '""', "cmd.exe", "/k", command]];
  } else {
    launch = ["x-terminal-emulator", ["-e", "sh", "-c", `${command}; exec sh`]];
  }

  return new Promise((resolve) => {
    const child = spawn(launch[0], launch[1], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    child.once("error", (error) =>
      resolve({
        ok: false,
        error: `Could not open a terminal: ${error.message}`,
        command,
      })
    );
    child.once("spawn", () => {
      child.unref();
      resolve({ ok: true, command });
    });
  });
}

/**
 * The environment a recording's agent runs in.
 *
 * Claude Code bills an API key over the subscription when one is set, and in
 * headless mode always uses it. Castfy's promise is "the subscription you
 * already pay for", so those variables are removed for Claude Code runs.
 */
export function agentEnv(agentId, env) {
  if (agentId !== "claude-code") {
    return env;
  }
  const { ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, ...rest } = env;
  return rest;
}
