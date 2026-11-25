// Checks agent-events.js against the line shapes Claude Code 2.1 prints with
// `-p --output-format stream-json --verbose`. Run: node scripts/check-agent-events.mjs
import assert from 'node:assert/strict';
import { ClaudeStream, OpenCodeStream, openCodeToolName, TextStream, toolName } from '../agent-events.js';

const lines = [
  { type: 'system', subtype: 'init', model: 'claude-sonnet-5-5' },
  { type: 'assistant', message: { content: [{ type: 'text', text: 'Looking first.' }] } },
  {
    type: 'assistant',
    message: { content: [{ type: 'tool_use', id: 'toolu_1', name: 'mcp__castfy0__castfy0_click', input: { description: 'Sign up' } }] },
  },
  { type: 'rate_limit_event', rate_limit_info: { unifiedWindows: { five_hour: { utilization: 0.4, resetsAt: 100 } } } },
  {
    type: 'user',
    message: { content: [{ type: 'tool_result', tool_use_id: 'toolu_1', content: [{ type: 'text', text: 'Clicked.' }, { type: 'image', source: {} }] }] },
  },
  { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'toolu_2', name: 'Read', input: { file_path: '/a' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'toolu_2', is_error: true, content: 'No such file' }] } },
  { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'toolu_3', name: 'mcp__castfy0__castfy0_end', input: {} }] } },
  { type: 'rate_limit_event', rate_limit_info: { unifiedWindows: { five_hour: { utilization: 0.58, resetsAt: 100 } } } },
  {
    type: 'result',
    is_error: false,
    num_turns: 4,
    duration_ms: 9000,
    total_cost_usd: 1.25,
    modelUsage: { 'claude-sonnet-5-5': { inputTokens: 10, outputTokens: 20, cacheReadInputTokens: 300, cacheCreationInputTokens: 70 } },
  },
];

let clock = 0;
const s = new ClaudeStream({ now: () => ++clock });
const text = lines.map((l) => JSON.stringify(l)).join('\n');
// Split mid-line, as pipes do.
const sent = [...s.push(text.slice(0, 137)), ...s.push(text.slice(137)), ...s.end()];

assert.equal(toolName('mcp__castfy0__castfy0_click'), 'castfy0_click');
assert.equal(toolName('mcp__my_server__thing'), 'thing');
assert.equal(toolName('Read'), 'Read');

const all = s.all();
assert.deepEqual(all.map((e) => e.kind), ['text', 'tool', 'tool', 'tool', 'done']);
const [, click, read, end, done] = all;
assert.equal(click.name, 'castfy0_click');
assert.equal(click.status, 'done');
assert.equal(click.output, 'Clicked.\n[image]');
assert.equal(read.status, 'error');
assert.equal(read.output, 'No such file');
assert.equal(end.status, 'error', 'a call cut off by the end of the run stops spinning');
assert.equal(done.costUsd, 1.25);
assert.equal(done.tokens, 400);
assert.equal(done.model, 'claude-sonnet-5-5');
assert.equal(done.turns, 4);
assert.ok(Math.abs(done.limit.used - 0.18) < 1e-9);
assert.equal(done.limit.now, 0.58);
assert.ok(sent.some((e) => e.id === 'toolu_1' && e.status === 'running'), 'the call is sent when it starts');
assert.ok(sent.some((e) => e.id === 'toolu_1' && e.status === 'done'), 'and again when it ends');

// No limit report (an API key): no limit, the rest still there.
const api = new ClaudeStream();
api.push(`${JSON.stringify(lines.at(-1))}\n`);
assert.equal(api.all().at(-1).limit, null);

// Non-JSON output is kept for explaining failures.
const noisy = new ClaudeStream();
noisy.push('Error: not logged in\n');
assert.match(noisy.text, /not logged in/);

const plain = new TextStream();
assert.deepEqual(plain.push('one\ntw').map((e) => e.text), ['one']);
assert.deepEqual(plain.end().map((e) => e.text), ['tw']);

// OpenCode 1.19, `opencode run --format json`: the line shapes it printed in a real run.
const oc = new OpenCodeStream({ model: 'anthropic/claude-sonnet-5-5' });
const ocLines = [
  { type: 'step_start', timestamp: 1000, part: { type: 'step-start' } },
  { type: 'text', timestamp: 1000, part: { id: 'prt_1', type: 'text', text: 'Checking the recorder first.' } },
  {
    type: 'tool_use',
    timestamp: 1066,
    part: { type: 'tool', tool: 'castfy0_castfy0_status', callID: 'call_1', state: { status: 'completed', input: {}, output: '{"active":false}', time: { start: 1020, end: 1044 } } },
  },
  {
    type: 'tool_use',
    timestamp: 1100,
    part: { type: 'tool', tool: 'castfy0_castfy0_click', callID: 'call_2', state: { status: 'error', input: {}, error: 'description: Required', time: { start: 1080, end: 1090 } } },
  },
  { type: 'step_finish', timestamp: 1102, part: { type: 'step-finish', tokens: { input: 1200, output: 30, cache: { read: 10, write: 0 } }, cost: 0.5 } },
  { type: 'text', timestamp: 1200, part: { id: 'prt_2', type: 'text', text: 'Done.' } },
  { type: 'step_finish', timestamp: 1202, part: { type: 'step-finish', tokens: { input: 1400, output: 8, cache: { read: 0, write: 0 } }, cost: 0 } },
];
oc.push(ocLines.map((l) => JSON.stringify(l)).join('\n'));
oc.end();
const ocAll = oc.all();
assert.deepEqual(ocAll.map((e) => e.kind), ['text', 'tool', 'tool', 'text', 'done']);
assert.equal(ocAll[1].name, 'castfy0_status');
assert.equal(ocAll[1].status, 'done');
assert.equal(ocAll[1].endedAt - ocAll[1].t, 24);
assert.equal(ocAll[2].status, 'error');
assert.equal(ocAll[2].output, 'description: Required');
const ocDone = ocAll.at(-1);
assert.equal(ocDone.turns, 2);
assert.equal(ocDone.tokens, 2648);
assert.equal(ocDone.costUsd, 0.5);
assert.equal(ocDone.model, 'anthropic/claude-sonnet-5-5');
assert.equal(oc.result().usage.inputTokens, 2600);
assert.equal(oc.result().text, 'Done.');
assert.equal(openCodeToolName('castfy0_castfy0_click'), 'castfy0_click');
assert.equal(openCodeToolName('bash'), 'bash');

// A model error OpenCode only logs ends the run as an error.
const ocFail = new OpenCodeStream();
ocFail.fail('Free usage limit reached.');
assert.equal(ocFail.end().at(-1).isError, true);
assert.equal(ocFail.result().text, 'Free usage limit reached.');

console.log('agent-events: ok');
