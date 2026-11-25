import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The agent's run as the studio's Agent view shows it.
 *
 * Claude Code, run with `--output-format stream-json --verbose`, prints one
 * JSON object per line as it works: its messages and tool calls, the results
 * that come back, how its subscription limit stands, and at the end the usual
 * result object (run-usage.js reads that one). This turns those lines into a
 * small, agent-neutral list of events (src/features/app/demo/agent-thread/
 * types.ts) and keeps it, so a finished demo still shows its thread.
 */

/** Kept with the recording, next to run-usage.json. */
export const AGENT_LOG_FILE = 'agent-log.json';

/** A tool's result is for reading at a glance, not for keeping whole. */
const MAX_OUTPUT = 4000;
/** The agent's MCP prefix for castfy0's tools: mcp__castfy0__castfy0_click. */
const MCP_PREFIX = /^mcp__[^_]+(?:_[^_]+)*?__/;

/** "mcp__castfy0__castfy0_click" -> "castfy0_click"; built-ins stay as they are. */
export function toolName(name) {
  return typeof name === 'string' ? name.replace(MCP_PREFIX, '') : 'tool';
}

/** A tool result's content as text: images become a marker, long text is cut. */
function resultText(content) {
  const parts = Array.isArray(content) ? content : [content];
  const text = parts
    .map((part) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text') return part.text ?? '';
      if (part?.type === 'image') return '[image]';
      return '';
    })
    .filter(Boolean)
    .join('\n');
  return text.length > MAX_OUTPUT ? `${text.slice(0, MAX_OUTPUT)}…` : text;
}

/** Inputs are shown folded; a huge one (a pasted file) is cut the same way. */
function smallInput(input) {
  if (!input || typeof input !== 'object') return {};
  const json = JSON.stringify(input);
  if (json.length <= MAX_OUTPUT) return input;
  return { truncated: `${json.slice(0, MAX_OUTPUT)}…` };
}

/**
 * Follows one run's stdout. `push` takes raw chunks and returns the events
 * that are new or changed (a tool call changes when its result arrives); the
 * renderer replaces an event it already has by id.
 */
export class ClaudeStream {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.partial = '';
    /** id -> event, in arrival order. */
    this.events = new Map();
    this.model = null;
    /** The first and the latest five-hour limit report. */
    this.firstLimit = null;
    this.lastLimit = null;
    this.result = null;
    /** stdout without the JSON lines: what explains a crash, kept small. */
    this.text = '';
    this.seq = 0;
  }

  /** @returns {object[]} events to send. */
  push(chunk) {
    const lines = (this.partial + chunk).split('\n');
    this.partial = lines.pop() ?? '';
    const out = [];
    for (const line of lines) out.push(...this.#line(line));
    return out;
  }

  /** Whatever is left once the process has exited. */
  end() {
    const rest = this.partial;
    this.partial = '';
    return rest ? this.#line(rest) : [];
  }

  #add(event) {
    this.events.set(event.id, event);
    return event;
  }

  #line(raw) {
    const line = raw.trim();
    if (!line) return [];
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      // Not ours (a warning the CLI printed): kept for the failure explanation.
      if (this.text.length < 20_000) this.text += `${raw}\n`;
      return [];
    }
    const t = this.now();
    switch (msg.type) {
      case 'system':
        if (msg.subtype === 'init' && typeof msg.model === 'string') this.model = msg.model;
        return [];
      case 'assistant': {
        const out = [];
        for (const block of msg.message?.content ?? []) {
          if (block.type === 'text' && block.text?.trim()) {
            out.push(this.#add({ kind: 'text', id: `text-${++this.seq}`, t, text: block.text.trim() }));
          } else if (block.type === 'tool_use' && block.id) {
            out.push(
              this.#add({
                kind: 'tool',
                id: block.id,
                t,
                name: toolName(block.name),
                input: smallInput(block.input),
                status: 'running',
              })
            );
          }
        }
        return out;
      }
      case 'user': {
        const out = [];
        for (const block of msg.message?.content ?? []) {
          if (block.type !== 'tool_result') continue;
          const call = this.events.get(block.tool_use_id);
          if (!call) continue;
          out.push(
            this.#add({
              ...call,
              status: block.is_error ? 'error' : 'done',
              output: resultText(block.content),
              endedAt: t,
            })
          );
        }
        return out;
      }
      case 'rate_limit_event': {
        const window = msg.rate_limit_info?.unifiedWindows?.five_hour;
        if (window && typeof window.utilization === 'number') {
          const limit = { utilization: window.utilization, resetsAt: window.resetsAt ?? null };
          this.firstLimit ??= limit;
          this.lastLimit = limit;
        }
        return [];
      }
      case 'result': {
        this.result = msg;
        const out = [];
        // A call that never got its result (the run ended under it) stops spinning.
        for (const event of this.events.values()) {
          if (event.kind === 'tool' && event.status === 'running') {
            out.push(this.#add({ ...event, status: 'error', output: 'The run ended before this finished.', endedAt: t }));
          }
        }
        out.push(this.#add(this.#done(msg, t)));
        return out;
      }
      default:
        return [];
    }
  }

  #done(result, t) {
    const models = Object.values(result.modelUsage ?? {});
    const sum = (key) => models.reduce((total, usage) => total + (Number(usage[key]) || 0), 0);
    const tokens =
      sum('inputTokens') + sum('outputTokens') + sum('cacheReadInputTokens') + sum('cacheCreationInputTokens');
    return {
      kind: 'done',
      id: 'done',
      t,
      isError: Boolean(result.is_error),
      turns: result.num_turns ?? null,
      durationMs: result.duration_ms ?? null,
      tokens: tokens || null,
      costUsd: typeof result.total_cost_usd === 'number' ? result.total_cost_usd : null,
      model: this.model,
      limit: this.limit(),
    };
  }

  /** How much of the five-hour limit the run used, when the agent reported it. */
  limit() {
    if (!(this.firstLimit && this.lastLimit)) return null;
    return {
      used: Math.max(0, this.lastLimit.utilization - this.firstLimit.utilization),
      now: this.lastLimit.utilization,
      resetsAt: this.lastLimit.resetsAt,
    };
  }

  /** Every event, once each, in order: what is saved with the recording. */
  all() {
    return [...this.events.values()];
  }
}

/**
 * OpenCode, run with `opencode run --format json`, prints one JSON event per
 * line: `text`, `tool_use` (once the call is over: its input, output or
 * error, and when it started and ended), `step_start`/`step_finish` (each
 * model turn, with its tokens and cost) and `error`. Checked against
 * OpenCode 1.19 (scripts/check-agent-events.mjs).
 */
export class OpenCodeStream {
  constructor({ now = () => Date.now(), model = null } = {}) {
    this.now = now;
    this.model = model;
    this.partial = '';
    this.events = new Map();
    this.text = '';
    this.turns = 0;
    this.tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    this.cost = 0;
    this.firstAt = null;
    this.lastAt = null;
    this.lastText = '';
    this.errorText = null;
    this.ended = false;
    this.seq = 0;
  }

  push(chunk) {
    const lines = (this.partial + chunk).split('\n');
    this.partial = lines.pop() ?? '';
    const out = [];
    for (const line of lines) out.push(...this.#line(line));
    return out;
  }

  /** The process exited: the closing summary, and whatever line was left. */
  end() {
    const out = this.partial ? this.#line(this.partial) : [];
    this.partial = '';
    if (!this.ended) {
      this.ended = true;
      out.push(this.#add(this.#done()));
    }
    return out;
  }

  #add(event) {
    this.events.set(event.id, event);
    return event;
  }

  #line(raw) {
    const line = raw.trim();
    if (!line) return [];
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      if (this.text.length < 20_000) this.text += `${raw}\n`;
      return [];
    }
    const t = typeof msg.timestamp === 'number' ? msg.timestamp : this.now();
    this.firstAt ??= t;
    this.lastAt = t;
    const part = msg.part ?? {};
    switch (msg.type) {
      case 'text': {
        const text = typeof part.text === 'string' ? part.text.trim() : '';
        if (!text) return [];
        this.lastText = text;
        return [this.#add({ kind: 'text', id: part.id ?? `text-${++this.seq}`, t, text })];
      }
      case 'tool_use': {
        const state = part.state ?? {};
        const failed = state.status === 'error';
        const started = state.time?.start ?? t;
        const output = failed ? state.error : state.output;
        return [
          this.#add({
            kind: 'tool',
            id: part.callID ?? part.id ?? `tool-${++this.seq}`,
            t: started,
            name: openCodeToolName(part.tool),
            input: smallInput(state.input),
            status: failed ? 'error' : state.status === 'completed' ? 'done' : 'running',
            output: typeof output === 'string' ? resultText(output) : undefined,
            endedAt: state.time?.end ?? t,
          }),
        ];
      }
      case 'step_finish': {
        this.turns += 1;
        const tokens = part.tokens ?? {};
        this.tokens.input += Number(tokens.input) || 0;
        this.tokens.output += Number(tokens.output) || 0;
        this.tokens.cacheRead += Number(tokens.cache?.read) || 0;
        this.tokens.cacheWrite += Number(tokens.cache?.write) || 0;
        this.cost += Number(part.cost) || 0;
        return [];
      }
      case 'error': {
        const text =
          msg.error?.data?.message ?? msg.error?.message ?? (typeof msg.error === 'string' ? msg.error : 'The agent hit an error.');
        this.errorText = String(text);
        return [this.#add({ kind: 'error', id: `error-${++this.seq}`, t, text: this.errorText })];
      }
      default:
        return [];
    }
  }

  /** A model error OpenCode only logged (stderr), shown in the thread too. */
  fail(text) {
    this.errorText = text;
    return [this.#add({ kind: 'error', id: `error-${++this.seq}`, t: this.now(), text })];
  }

  #done() {
    const { input, output, cacheRead, cacheWrite } = this.tokens;
    const tokens = input + output + cacheRead + cacheWrite;
    return {
      kind: 'done',
      id: 'done',
      t: this.now(),
      isError: Boolean(this.errorText),
      turns: this.turns || null,
      durationMs: this.firstAt && this.lastAt ? this.lastAt - this.firstAt : null,
      tokens: tokens || null,
      // OpenCode reports 0 for free and subscription models: no price to show.
      costUsd: this.cost > 0 ? this.cost : null,
      model: this.model,
      limit: null,
    };
  }

  /** What run-usage.js keeps, in the shape readClaudeResult returns. */
  result() {
    return {
      text: this.errorText ?? this.lastText,
      isError: Boolean(this.errorText),
      usage: {
        agent: 'opencode',
        turns: this.turns || null,
        durationMs: this.firstAt && this.lastAt ? this.lastAt - this.firstAt : null,
        models: this.model ? [this.model] : [],
        inputTokens: this.tokens.input,
        outputTokens: this.tokens.output,
        cacheReadTokens: this.tokens.cacheRead,
        cacheWriteTokens: this.tokens.cacheWrite,
        costUsd: this.cost > 0 ? this.cost : null,
      },
    };
  }

  all() {
    return [...this.events.values()];
  }
}

/**
 * OpenCode names MCP tools `<server>_<tool>`: castfy0's click is
 * "castfy0_castfy0_click". Its own tools keep their names (bash, read).
 */
export function openCodeToolName(name) {
  if (typeof name !== 'string') return 'tool';
  return name.startsWith('castfy0_castfy0_') ? name.slice('castfy0_'.length) : name;
}

/**
 * Agents that print plain text (Codex, Cursor): each line is a message, so the
 * thread still says something for them.
 */
export class TextStream {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.partial = '';
    this.events = [];
    this.seq = 0;
  }

  push(chunk) {
    const lines = (this.partial + chunk).split('\n');
    this.partial = lines.pop() ?? '';
    return lines.map((l) => l.trim()).filter(Boolean).map((text) => this.#add(text));
  }

  end() {
    const rest = this.partial.trim();
    this.partial = '';
    return rest ? [this.#add(rest)] : [];
  }

  #add(text) {
    const event = { kind: 'text', id: `text-${++this.seq}`, t: this.now(), text };
    this.events.push(event);
    return event;
  }

  all() {
    return this.events;
  }
}

export async function saveAgentLog(dir, events) {
  await fs.writeFile(path.join(dir, AGENT_LOG_FILE), JSON.stringify({ version: 1, events }));
}

export async function readAgentLog(dir) {
  try {
    const data = JSON.parse(await fs.readFile(path.join(dir, AGENT_LOG_FILE), 'utf8'));
    return Array.isArray(data?.events) ? data.events : null;
  } catch {
    return null;
  }
}
