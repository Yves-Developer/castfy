# Plan: Browser / Agent view in the studio

**Status:** not started.

## What changes for the user

The **Headless** switch next to the prompt goes away. During a run, the big
area where the live browser shows today gets a two-tab toggle:

- **Browser:** the live page with the agent's pointer, as today (`live-view.tsx`).
- **Agent:** the agent's own work as a chat thread, like Cursor's agent chat:
  - its messages;
  - each tool call as a compact row (`castfy0_click "Sign up"`, `castfy0_look`,
    `Read`), with the arguments and the result folded under it;
  - a thinking/working indicator;
  - errors in red;
  - the final message.

Clicking a step in the left panel (`sidebar/agent/step.tsx`) jumps the Agent view
to the tool call that made that step, and highlights it.

The recording browser always runs in the background (headless). That removes the
bug where turning headless off opens the recording browser as its own window. The
live view already shows everything that window did.

## Why it's possible

- Steps on the left come from castfy0's `progress.jsonl` (`progress.js`).
  Castfy0 only knows its own tools.
- The agent's text and other tool calls exist only in the agent's output. Today
  Claude Code runs with `-p --output-format json` (`agents.js`), which prints
  nothing until the run ends (`run-usage.js`).
- `--output-format stream-json --verbose` prints one JSON event per line as the
  run goes: assistant text, `tool_use`, `tool_result`, and the final `result`
  with usage. So the same run gives us the live thread and, at the end, the usage
  we read today.

## Steps

1. **Stream the agent's events** (`agents.js`, `main.js` around the `spawn` at
   ~1878):
   - **Claude Code:** switch to `stream-json --verbose`.
   - **Parsing:** parse stdout line by line (hold back a partial line like
     `ProgressTail`), normalise each event to:
     ```
     { kind: 'text' | 'tool' | 'tool_result' | 'error' | 'done', id, name?, input?, output?, t }
     ```
   - **Live:** send the events to the window (`demo:agent-event`).
   - **Saving:** append them to `agent-log.jsonl` in the recording, so a demo
     reopened later still shows its thread.
   - **Usage:** `readClaudeResult` reads the last `result` line, so usage keeps
     working. Keep a fallback for older CLIs that only print JSON at the end.
2. **One normaliser per agent:** Claude Code first, then OpenCode. Codex and
   Cursor fall back to raw text lines in the thread, so they still show
   something.
3. **Link steps to tool calls:**
   - castfy0's progress events and the agent's `tool_use` events both carry the
     tool name and time.
   - Match each castfy0 step to the nearest `tool_use` of that tool before it.
   - If castfy0 can echo a call id it is given, use that instead; check the MCP
     request for one.
4. **UI** (`demo/remotion/live-view.tsx` and a new `agent-thread.tsx`):
   - a Browser/Agent segmented toggle over the live area, remembered per user;
   - the thread with virtualised rows (runs reach ~140 turns), auto-scroll that
     pauses when the user scrolls up, and folded tool arguments;
   - Castfy's UI kit, checked in light and dark;
   - after the run, the Agent tab stays available beside the video editor, so
     "why did it do that?" can be answered from a finished demo.
5. **Remove Headless:**
   - drop the switch from `sidebar/agent/index.tsx` and the playground;
   - always pass `headless: true`;
   - keep reading old `headless=false` URLs without breaking.
6. **Test:**
   - a public page and a form;
   - a page that asks for a code;
   - a failing run (error shows in the thread);
   - reopening an old demo with no `agent-log.jsonl` (the tab says "Not saved
     for this demo").

## OpenCode (see `more-agents.md`)

Do it in the same branch, right after step 1, because its event stream is the
second normaliser:

- confirm its current non-interactive command, JSON event output, MCP config
  and tool permissions from the docs;
- add it to `AGENTS` and `CLIENTS`;
- show it as experimental in onboarding and the picker;
- add usage if OpenCode reports it.

Then send a build to Tomas.

## Ship together as desktop 1.0.1

The 1.0.0 build predates the analytics PR (#119), so recorder setup, beta-code
and in-app checkout events are missing from PostHog. Releasing 1.0.1 with the
work above fixes that.
