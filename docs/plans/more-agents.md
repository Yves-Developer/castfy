# Plan: OpenCode and Gemini CLI support

**Status:** OpenCode is built (experimental), Gemini CLI is not started. A
tester (Tomas, Discord) uses OpenCode and Antigravity, not Claude Code; he is
waiting to test it.

What OpenCode support does (tested with OpenCode 1.19.6):
- Runs `opencode run --format json --print-logs --log-level ERROR [--model …]`
  with the prompt on stdin; events are read by `OpenCodeStream`
  (`agent-events.js`) into the Agent view.
- castfy0 and permission for its tools come from `OPENCODE_CONFIG_CONTENT`
  per run, merged over the user's own config, which stays untouched.
- A model error OpenCode only logs (used-up free tier, bad key) stops the
  run and is shown; OpenCode itself would wait forever.
- The model list comes from `opencode models`; "Connect" writes castfy0 into
  `~/.config/opencode/opencode.json` (and removes only that on disconnect).
- Not yet tested with a real model: the free models were rate-limited from
  the test machine, so a scripted local model stood in. Tomas's test is the
  first real one.

## Why it doesn't work today

Castfy doesn't contain the AI. For each agent it needs to:

1. **Start it without anyone typing:** run its CLI with the prompt
   (`buildArgs` in `apps/desktop/agents.js`).
2. **Plug in the recorder:** register castfy0 as an MCP server for that
   agent (`apps/desktop/clients.js`: `connectClient`, `writeRunMcpConfig`).
3. **Let it call the tools unattended:** no approval prompts mid-run.
4. **Read its progress and usage:** steps, errors, and what the run used
   (`run-usage.js`).

Today only Claude Code does all four. Codex and Cursor are experimental.

## The agents

| Agent | What it is | Can Castfy drive it? |
|---|---|---|
| **OpenCode** | Open-source terminal coding agent, any model (Claude, GPT, Gemini, local) with your own API key | **Likely yes.** It has a non-interactive run mode and MCP support. |
| **Gemini CLI** | Google's terminal agent | **Likely yes.** Non-interactive mode and MCP support. The route for Gemini users. |
| **Antigravity** | Google's AI editor (desktop app) | **No.** An editor, not drivable in the background, and Google's login is only allowed in Google's apps. Point these users to Gemini CLI or OpenCode. |

## Steps (OpenCode first)

1. **Check the current docs** (they change often), and confirm:
   - the non-interactive command and how the prompt is passed;
   - where MCP servers are configured (global and per-project) and the format;
   - how to allow castfy0's tools without approval prompts;
   - whether it prints usage (tokens or cost) we can read.
2. **Add OpenCode to `AGENTS`:** binary locations on macOS, Windows and Linux,
   and `buildArgs`.
3. **Add OpenCode to `CLIENTS`:** write and remove castfy0's MCP entry in its
   config, like Claude Code's.
4. **Make onboarding and the agent picker** list OpenCode, marked experimental
   at first.
5. **Usage:** read what the run used if OpenCode reports it; otherwise show
   time only.
6. **Test on Linux, then macOS and Windows:**
   - a public page;
   - a form (typing);
   - a page that needs a code (`castfy0_ask_user`).
7. **Ask Tomas to test** (Arch Linux, OpenCode with an API key).
8. **Repeat for Gemini CLI.**

## Also

- **Website:** say clearly near the download that Castfy needs Claude Code
  today (Codex and Cursor experimental), and add OpenCode once it works, so
  people don't download it and hit a wall.
- **Changelog:** announce each new agent.
