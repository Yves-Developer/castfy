import { createRequire } from "node:module";
import { execPath } from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";

export interface RunAgentOptions {
  /**
   * Path to a Playwright storageState JSON so the recording starts already
   * authenticated (Mode A). Must be a server-managed path — never a raw,
   * user-supplied filesystem path — to avoid arbitrary local-file reads.
   */
  storageState?: string;
  /**
   * Aborts the run. On abort the agent loop stops at the next iteration and the
   * `finally` below closes the MCP client, which kills the child process and its
   * browser — so cancelling actually frees the slot rather than orphaning work.
   */
  signal?: AbortSignal;
}

const require = createRequire(import.meta.url);

/**
 * Absolute path to the castfy0-mcp entrypoint. We spawn `node <entrypoint>`
 * rather than `pnpm exec castfy0-mcp` so the container needs neither pnpm nor
 * workspace resolution at spawn time, and so we don't depend on the platform's
 * .bin shim (a .CMD on Windows, which `spawn` cannot exec directly).
 * Override with CASTFY0_MCP_ENTRY when running an unpublished build.
 */
function resolveMcpEntry(): string {
  const override = process.env.CASTFY0_MCP_ENTRY;
  if (override) {
    return override;
  }
  return require.resolve("@yves-developer/castfy0-mcp");
}

/**
 * Environment handed to the spawned castfy0-mcp process. StdioClientTransport
 * does NOT inherit process.env by default, so without this the MCP server never
 * sees ANTHROPIC_API_KEY and its in-process AI narration silently falls back to
 * the template. We forward only the keys the MCP actually needs.
 */
function buildMcpEnv(): Record<string, string> {
  const env: Record<string, string> = { ...getDefaultEnvironment() };
  if (process.env.ANTHROPIC_API_KEY) {
    env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  }
  if (process.env.NARRATION_MODEL) {
    env.NARRATION_MODEL = process.env.NARRATION_MODEL;
  }
  return env;
}

const SNAPSHOT_CHAR_LIMIT = 50_000;

/** Video/audio encoding in castfy0_end is the longest single step in a run. */
const RENDER_TIMEOUT_MS = 1_800_000;

export interface AgentStep {
  action: string;
  description: string;
  error?: string;
  ref?: string;
  status: "success" | "error";
  stepId?: number;
  value?: string;
}

export interface AgentResult {
  deliverables?: unknown;
  error?: string;
  /**
   * True only if the agent explicitly called submit_journey. False means the
   * loop hit its step cap (or ended early) without confirming the goal, so the
   * demo may be incomplete.
   */
  goalConfirmed: boolean;
  steps: AgentStep[];
}

type McpToolResponse = Awaited<ReturnType<Client["callTool"]>>;

interface SnapshotPayload {
  snapshot?: string;
  title?: string;
  url?: string;
}

function getToolResponseText(result: McpToolResponse): string {
  const content = result.content;
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) =>
      "text" in item && typeof item.text === "string" ? item.text : ""
    )
    .filter(Boolean)
    .join("\n");
}

function parseToolResponse<T>(result: McpToolResponse): T | undefined {
  const text = getToolResponseText(result);
  if (!text) {
    return;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return;
  }
}

async function callCastfy0Tool(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<McpToolResponse> {
  const result = await client.callTool({
    name,
    arguments: args,
  });
  const payload = parseToolResponse<{ error?: string; success?: boolean }>(
    result
  );

  if (result.isError || payload?.success === false) {
    const message =
      payload?.error || getToolResponseText(result) || `${name} failed`;
    throw new Error(message);
  }

  return result;
}

/**
 * Call a castfy0 tool and return the stepId it recorded (if any). Surfacing the
 * stepId lets the agent later exclude a specific misfired step from the clean
 * export via exclude_step.
 */
async function callAndGetStepId(
  client: Client,
  name: string,
  args: Record<string, unknown>
): Promise<number | undefined> {
  const result = await callCastfy0Tool(client, name, args);
  const payload = parseToolResponse<{ stepId?: number }>(result);
  return payload?.stepId;
}

function formatSnapshot(result: McpToolResponse): string {
  const payload = parseToolResponse<SnapshotPayload>(result);

  if (!payload?.snapshot) {
    return getToolResponseText(result);
  }

  return [
    payload.url ? `URL: ${payload.url}` : "",
    payload.title ? `Title: ${payload.title}` : "",
    "Accessibility Snapshot:",
    payload.snapshot,
  ]
    .filter(Boolean)
    .join("\n");
}

type MessageContentBlock = Exclude<
  Anthropic.MessageParam["content"],
  string
>[number];

function hasSnapshot(item: MessageContentBlock): boolean {
  if ("text" in item && typeof item.text === "string") {
    return item.text.includes("<snapshot>");
  }
  if (
    "type" in item &&
    item.type === "tool_result" &&
    typeof item.content === "string"
  ) {
    return item.content.includes("<snapshot>");
  }
  return false;
}

function pruneSnapshotText(text: string): string {
  return text.replace(
    /<snapshot>[\s\S]*?<\/snapshot>/g,
    "[Snapshot omitted for brevity]"
  );
}

function pruneItem(item: MessageContentBlock): MessageContentBlock {
  if (
    "text" in item &&
    typeof item.text === "string" &&
    item.text.includes("<snapshot>")
  ) {
    return {
      ...item,
      text: pruneSnapshotText(item.text),
    } as MessageContentBlock;
  }
  if (
    "type" in item &&
    item.type === "tool_result" &&
    typeof item.content === "string" &&
    item.content.includes("<snapshot>")
  ) {
    return {
      ...item,
      content: pruneSnapshotText(item.content),
    } as MessageContentBlock;
  }
  return item;
}

function pruneOldSnapshots(
  messages: Anthropic.MessageParam[]
): Anthropic.MessageParam[] {
  let lastSnapshotMessageIndex = -1;
  let lastSnapshotBlockIndex = -1;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "user") {
      continue;
    }
    if (typeof msg.content === "string" && msg.content.includes("<snapshot>")) {
      lastSnapshotMessageIndex = i;
      break;
    }
    if (Array.isArray(msg.content)) {
      let foundIdx = -1;
      for (let j = msg.content.length - 1; j >= 0; j--) {
        if (hasSnapshot(msg.content[j])) {
          foundIdx = j;
          break;
        }
      }
      if (foundIdx !== -1) {
        lastSnapshotMessageIndex = i;
        lastSnapshotBlockIndex = foundIdx;
        break;
      }
    }
  }

  return messages.map((msg, msgIndex) => {
    if (msgIndex === lastSnapshotMessageIndex) {
      if (Array.isArray(msg.content)) {
        const prunedContent = msg.content.map((item, blockIndex) => {
          if (blockIndex !== lastSnapshotBlockIndex) {
            return pruneItem(item);
          }
          return item;
        });
        return { ...msg, content: prunedContent };
      }
      return msg;
    }

    if (typeof msg.content === "string") {
      if (msg.content.includes("<snapshot>")) {
        return { ...msg, content: pruneSnapshotText(msg.content) };
      }
    } else if (Array.isArray(msg.content)) {
      return { ...msg, content: msg.content.map(pruneItem) };
    }
    return msg;
  });
}

interface ClickInput {
  ref: string;
}

interface FillInput {
  ref: string;
  value: string;
}

interface SelectInput {
  ref: string;
  value: string;
}

interface HoverInput {
  ref: string;
}

interface PressKeyInput {
  key: string;
}

interface ScrollInput {
  direction: "up" | "down";
}

interface AssertInput {
  assert_type: "text" | "visible" | "hidden" | "url" | "title";
  expected?: string;
  ref?: string;
}

interface NavigateInput {
  url: string;
}

interface WaitInput {
  condition?: "load" | "networkidle" | "domcontentloaded";
}

interface ThinkStartInput {
  description?: string;
}

interface ThinkEndInput {
  reason?: string;
}

interface ExcludeStepInput {
  reason: string;
  stepId: number;
}

const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: "snapshot",
    description:
      "Get the current page accessibility tree snapshot and element refs.",
    input_schema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Reason for taking the snapshot",
        },
      },
      required: ["description"],
    },
  },
  {
    name: "click",
    description:
      "Click an element on the page using the exact numeric ref from the latest snapshot.",
    input_schema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description:
            "The exact numeric element ref from the latest snapshot, without brackets (e.g. '12'). Do not pass text: selectors or element names.",
        },
        description: {
          type: "string",
          description:
            "Reason for clicking the element (e.g. 'Click products link')",
        },
      },
      required: ["ref", "description"],
    },
  },
  {
    name: "fill",
    description:
      "Fill a text input on the page using the exact numeric ref from the latest snapshot.",
    input_schema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description:
            "The exact numeric element ref from the latest snapshot, without brackets (e.g. '12'). Do not pass text: selectors or element names.",
        },
        value: { type: "string", description: "The text to type" },
        description: { type: "string", description: "Reason for typing" },
      },
      required: ["ref", "value", "description"],
    },
  },
  {
    name: "select",
    description:
      "Select an option from a dropdown element using the exact numeric ref from the latest snapshot.",
    input_schema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description:
            "The exact numeric element ref from the latest snapshot, without brackets (e.g. '12'). Do not pass text: selectors or element names.",
        },
        value: {
          type: "string",
          description: "The option value to select",
        },
        description: {
          type: "string",
          description: "Reason for selecting",
        },
      },
      required: ["ref", "value", "description"],
    },
  },
  {
    name: "hover",
    description:
      "Hover over an element using the exact numeric ref from the latest snapshot.",
    input_schema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description:
            "The exact numeric element ref from the latest snapshot, without brackets (e.g. '12'). Do not pass text: selectors or element names.",
        },
        description: { type: "string", description: "Reason for hovering" },
      },
      required: ["ref", "description"],
    },
  },
  {
    name: "press_key",
    description:
      "Press a key or combination on the keyboard (e.g. 'Enter', 'Escape').",
    input_schema: {
      type: "object",
      properties: {
        key: { type: "string", description: "The key name" },
        description: {
          type: "string",
          description: "Reason for pressing key",
        },
      },
      required: ["key", "description"],
    },
  },
  {
    name: "scroll",
    description: "Scroll the viewport or an element up or down.",
    input_schema: {
      type: "object",
      properties: {
        direction: {
          type: "string",
          enum: ["up", "down"],
          description: "The direction to scroll",
        },
        description: {
          type: "string",
          description: "Reason for scrolling",
        },
      },
      required: ["direction", "description"],
    },
  },
  {
    name: "assert",
    description:
      "Assert and verify page conditions (e.g. text visibility, URL).",
    input_schema: {
      type: "object",
      properties: {
        assert_type: {
          type: "string",
          enum: ["text", "visible", "hidden", "url", "title"],
        },
        ref: {
          type: "string",
          description: "Element ID to check (not needed for URL/title checks)",
        },
        expected: {
          type: "string",
          description:
            "The expected text, URL, or title value (not required for visible/hidden checks)",
        },
        description: {
          type: "string",
          description: "Reason for the check",
        },
      },
      required: ["assert_type", "description"],
    },
  },
  {
    name: "navigate",
    description:
      "Emergency use only. DANGER: DO NOT use this tool unless the page is completely blank, broken, or has no clickable elements. Using this tool unnecessarily violates demo quality standards and fails the task.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to navigate to" },
        description: {
          type: "string",
          description: "Reason for navigating (emergency recovery only)",
        },
      },
      required: ["url", "description"],
    },
  },
  {
    name: "wait",
    description:
      "Wait for a page load or network idle condition before proceeding.",
    input_schema: {
      type: "object",
      properties: {
        condition: {
          type: "string",
          enum: ["load", "networkidle", "domcontentloaded"],
          description: "The load condition to wait for (default: 'load').",
        },
        description: {
          type: "string",
          description:
            "Reason for waiting (e.g. 'Wait for products list to load').",
        },
      },
      required: ["description"],
    },
  },
  {
    name: "think_start",
    description:
      "Begin a planning/exploration period. Everything between think_start and think_end (extra snapshots, hesitation, scrolling around to orient) is CUT from the clean demo video. Use this before uncertain exploration so the final video stays tight.",
    input_schema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "What you are about to figure out",
        },
      },
      required: ["description"],
    },
  },
  {
    name: "think_end",
    description:
      "End the current planning/exploration period and resume the recorded demo.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "What you concluded / what you will do next",
        },
      },
      required: ["reason"],
    },
  },
  {
    name: "exclude_step",
    description:
      "Remove a single misfired or duplicate step from the clean demo video. Pass the stepId reported in the '(stepId: N)' suffix of that step's tool result. Use this right after a wrong click or a fill that had to be redone.",
    input_schema: {
      type: "object",
      properties: {
        stepId: {
          type: "number",
          description:
            "The numeric stepId from the tool result of the step to remove",
        },
        reason: {
          type: "string",
          description: "Why this step is excluded",
        },
      },
      required: ["stepId", "reason"],
    },
  },
  {
    name: "submit_journey",
    description: "Call this when the user's goal has been completely achieved.",
    input_schema: {
      type: "object",
      properties: {
        success_message: {
          type: "string",
          description: "Message detailing completion",
        },
      },
      required: ["success_message"],
    },
  },
];

async function handleAgentClick(
  client: Client,
  input: ClickInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.ref = input.ref;
  return await callAndGetStepId(client, "castfy0_click", {
    ref: input.ref,
    description,
  });
}

async function handleAgentFill(
  client: Client,
  input: FillInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.ref = input.ref;
  stepInfo.value = input.value;
  return await callAndGetStepId(client, "castfy0_fill", {
    ref: input.ref,
    value: input.value,
    description,
  });
}

async function handleAgentSelect(
  client: Client,
  input: SelectInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.ref = input.ref;
  stepInfo.value = input.value;
  return await callAndGetStepId(client, "castfy0_select", {
    ref: input.ref,
    value: input.value,
    description,
  });
}

async function handleAgentHover(
  client: Client,
  input: HoverInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.ref = input.ref;
  return await callAndGetStepId(client, "castfy0_hover", {
    ref: input.ref,
    description,
  });
}

async function handleAgentPressKey(
  client: Client,
  input: PressKeyInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.value = input.key;
  return await callAndGetStepId(client, "castfy0_press_key", {
    key: input.key,
    description,
  });
}

async function handleAgentScroll(
  client: Client,
  input: ScrollInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.value = input.direction;
  return await callAndGetStepId(client, "castfy0_scroll", {
    direction: input.direction,
    description,
  });
}

async function handleAgentAssert(
  client: Client,
  input: AssertInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.ref = input.ref;
  stepInfo.value = input.expected;
  return await callAndGetStepId(client, "castfy0_assert", {
    type: input.assert_type,
    ref: input.ref,
    expected: input.expected,
    description,
  });
}

async function handleAgentNavigate(
  client: Client,
  input: NavigateInput,
  description: string,
  stepInfo: AgentStep
): Promise<number | undefined> {
  stepInfo.value = input.url;
  return await callAndGetStepId(client, "castfy0_navigate", {
    url: input.url,
    description,
  });
}

async function handleAgentWait(
  client: Client,
  input: WaitInput,
  description: string
): Promise<void> {
  await callCastfy0Tool(client, "castfy0_wait", {
    condition: input.condition || "load",
    description,
  });
}

async function handleAgentThinkStart(
  client: Client,
  input: ThinkStartInput
): Promise<void> {
  await callCastfy0Tool(client, "castfy0_think_start", {
    description: input.description ?? "Planning next step",
  });
}

async function handleAgentThinkEnd(
  client: Client,
  input: ThinkEndInput
): Promise<void> {
  await callCastfy0Tool(client, "castfy0_think_end", {
    reason: input.reason ?? "Resuming demo",
  });
}

async function handleAgentExcludeStep(
  client: Client,
  input: ExcludeStepInput
): Promise<void> {
  await callCastfy0Tool(client, "castfy0_exclude_step", {
    stepId: input.stepId,
    reason: input.reason,
  });
}

interface ToolBatchResult {
  currentSnapshot?: string;
  journeyFinished: boolean;
  newSnapshotNeeded: boolean;
  toolResults: Anthropic.ToolResultBlockParam[];
}

async function executeToolBatch(
  client: Client,
  toolCalls: Anthropic.ToolUseBlock[],
  steps: AgentStep[],
  onStep: (step: AgentStep) => void
): Promise<ToolBatchResult> {
  let newSnapshotNeeded = false;
  let journeyFinished = false;
  let currentSnapshot: string | undefined;
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  for (const tool of toolCalls) {
    const toolInput = tool.input as Record<string, unknown>;
    const actionDescription =
      typeof toolInput.description === "string"
        ? toolInput.description
        : "Interacting with page";

    const stepInfo: AgentStep = {
      action: tool.name,
      description: actionDescription,
      status: "success",
    };

    try {
      let actionStepId: number | undefined;
      switch (tool.name) {
        case "click":
          actionStepId = await handleAgentClick(
            client,
            tool.input as ClickInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "fill":
          actionStepId = await handleAgentFill(
            client,
            tool.input as FillInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "select":
          actionStepId = await handleAgentSelect(
            client,
            tool.input as SelectInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "hover":
          actionStepId = await handleAgentHover(
            client,
            tool.input as HoverInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "press_key":
          actionStepId = await handleAgentPressKey(
            client,
            tool.input as PressKeyInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "scroll":
          actionStepId = await handleAgentScroll(
            client,
            tool.input as ScrollInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "assert":
          actionStepId = await handleAgentAssert(
            client,
            tool.input as AssertInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "navigate":
          actionStepId = await handleAgentNavigate(
            client,
            tool.input as NavigateInput,
            actionDescription,
            stepInfo
          );
          newSnapshotNeeded = true;
          break;
        case "wait":
          await handleAgentWait(
            client,
            tool.input as WaitInput,
            actionDescription
          );
          newSnapshotNeeded = true;
          break;
        case "think_start":
          await handleAgentThinkStart(client, tool.input as ThinkStartInput);
          break;
        case "think_end":
          await handleAgentThinkEnd(client, tool.input as ThinkEndInput);
          break;
        case "exclude_step":
          await handleAgentExcludeStep(client, tool.input as ExcludeStepInput);
          break;
        case "submit_journey":
          journeyFinished = true;
          break;
        case "snapshot": {
          const snapshotResult = await callCastfy0Tool(
            client,
            "castfy0_snapshot",
            {}
          );
          currentSnapshot = formatSnapshot(snapshotResult);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: `Snapshot:\n<snapshot>\n${currentSnapshot.slice(
              0,
              SNAPSHOT_CHAR_LIMIT
            )}\n</snapshot>`,
          });
          break;
        }
        default:
          throw new Error(`Unknown tool: ${tool.name}`);
      }

      if (tool.name !== "snapshot") {
        if (actionStepId !== undefined) {
          stepInfo.stepId = actionStepId;
        }
        const successContent =
          actionStepId === undefined
            ? "Success"
            : `Success (stepId: ${actionStepId})`;
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: successContent,
        });
      }
      steps.push(stepInfo);
      onStep(stepInfo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Tool ${tool.name} failed:`, err);
      stepInfo.status = "error";
      stepInfo.error = message;
      toolResults.push({
        type: "tool_result",
        tool_use_id: tool.id,
        content: `Error: ${message}`,
        is_error: true,
      });
      steps.push(stepInfo);
      onStep(stepInfo);
    }
  }

  return {
    newSnapshotNeeded,
    journeyFinished,
    toolResults,
    currentSnapshot,
  };
}

async function handlePostActionSnapshot(
  client: Client,
  toolCalls: Anthropic.ToolUseBlock[]
): Promise<string> {
  const isNavigationAction = toolCalls.some((t) =>
    ["click", "navigate"].includes(t.name)
  );

  if (isNavigationAction) {
    // Sleep 1500ms locally to allow client-side router transitions and fetches to trigger
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Wait for page rendering/network to settle inside browser (blocks agent call)
    await client
      .callTool({
        name: "castfy0_wait",
        arguments: {
          condition: "networkidle",
          timeout: 3000,
          description: "Wait for network idle and rendering to settle",
        },
      })
      .catch(() => {
        // Ignore wait errors during transition
      });
  } else {
    // For non-navigation actions (like scroll, fill, hover), sleep 500ms
    // to let scroll animations or layout transitions settle before the snapshot.
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Fetch new snapshot
  const snapshotResult = await callCastfy0Tool(client, "castfy0_snapshot", {});
  return formatSnapshot(snapshotResult);
}

async function runAgentLoop(
  client: Client,
  anthropic: Anthropic,
  promptGoal: string,
  initialSnapshot: string,
  steps: AgentStep[],
  onStep: (step: AgentStep) => void,
  signal?: AbortSignal
): Promise<boolean> {
  let currentSnapshot = initialSnapshot;
  let goalConfirmed = false;

  // Construct prompt & messages history
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Your goal is: "${promptGoal}".\n\nYou control a browser recording session. Use tools to interact with the page until the goal is achieved.\n\nInitial Page Snapshot:\n<snapshot>\n${currentSnapshot.slice(
        0,
        SNAPSHOT_CHAR_LIMIT
      )}\n</snapshot>`,
    },
  ];

  const systemInstruction = `You control a browser to record a high-quality product demo video based on the user's goal.
You must explore and interact with the page to complete the goal.

Rules for Demo Quality:
1. **CRITICAL: NEVER use direct URL navigation (the \`navigate\` tool) to move between pages of the website.** You must interact with the site like a real user by clicking links, buttons, navigation menus, and product cards. This ensures that the demo recording captures natural animated cursor movements and click effects in the final video. Using \`navigate\` violates rules and ruins the demo. Only use the \`navigate\` tool for the initial starting URL (done automatically) or in absolute emergency recovery if you get completely stuck (e.g. page is entirely blank or broken).
2. **Loop Prevention**: If you click a link or button and the page content, snapshot, or URL does not change after the click, **DO NOT keep clicking the same element repeatedly**. Assume that the link/button is either non-functional, dead, or does not lead to the page you want. Explore other links, scroll down to see other elements, or try a different path to achieve your goal.
3. **Interactive Roles Only**: Pay close attention to the **role** of elements in the accessibility tree snapshot. Only click elements that are inherently interactive (e.g., role is 'link', 'button', 'checkbox', 'combobox', 'tab', 'menuitem'). **DO NOT click static text labels or structural containers** (e.g., role is 'paragraph', 'text', 'section', 'heading', 'generic', 'div', or 'img') unless they are explicitly marked as clickable. Confusing a static text heading (like a section header) for a navigation link will fail the demo.
4. Read the page snapshot carefully to locate elements. If you click a link and need to wait, wait for the page to settle.
5. Be precise with description strings for all tools (e.g. "Click the Add to Cart button to add the item"). These descriptions are used for subtitles and documentation generation.
6. **Keep the final video clean**: Wrap any uncertain exploration (hunting for the right element, extra snapshots, scrolling to orient) between \`think_start\` and \`think_end\` — that time is cut from the clean demo. If you click the wrong element or a fill has to be redone, call \`exclude_step\` with the stepId reported in that action's result (shown as "(stepId: N)") to drop it from the clean video. Do not narrate mistakes; just exclude them.
7. Call \`submit_journey\` once the user's goal has been completely achieved.`;

  for (let i = 0; i < 30; i++) {
    // Cancellation lands here rather than mid-tool-call, so the browser is in a
    // known state when the caller's `finally` closes the MCP client.
    signal?.throwIfAborted();

    const response = await anthropic.messages.create(
      {
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: systemInstruction,
        messages: pruneOldSnapshots(messages),
        tools: AGENT_TOOLS,
      },
      { signal }
    );

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      break;
    }

    const toolCalls = response.content.filter(
      (c): c is Anthropic.ToolUseBlock => c.type === "tool_use"
    );

    if (toolCalls.length === 0) {
      messages.push({ role: "user", content: "You must call a tool." });
      continue;
    }

    const batchResult = await executeToolBatch(
      client,
      toolCalls,
      steps,
      onStep
    );

    if (batchResult.currentSnapshot) {
      currentSnapshot = batchResult.currentSnapshot;
    }

    if (batchResult.journeyFinished) {
      goalConfirmed = true;
      break;
    }

    if (batchResult.newSnapshotNeeded) {
      currentSnapshot = await handlePostActionSnapshot(client, toolCalls);
      messages.push({
        role: "user",
        content: [
          ...batchResult.toolResults,
          {
            type: "text",
            text: `New Snapshot:\n<snapshot>\n${currentSnapshot.slice(
              0,
              SNAPSHOT_CHAR_LIMIT
            )}\n</snapshot>`,
          },
        ],
      });
    } else {
      messages.push({ role: "user", content: batchResult.toolResults });
    }
  }

  return goalConfirmed;
}

export async function runAgent(
  startUrl: string,
  promptGoal: string,
  outputDir: string,
  headless: boolean,
  _onStep: (step: AgentStep) => void,
  _onStatus: (status: string) => void,
  options: RunAgentOptions = {}
): Promise<AgentResult> {
  const steps: AgentStep[] = [];

  const onStatus = (msg: string) => {
    console.log(`[Agent Status] ${msg}`);
    _onStatus(msg);
  };
  const onStep = (step: AgentStep) => {
    console.log(
      `[Agent Step] ${step.action.toUpperCase()}: ${step.description}`
    );
    if (step.status === "error") {
      console.log(`  └─ ERROR: ${step.error}`);
    }
    _onStep(step);
  };

  // 1. Initialize MCP Transport & Client
  onStatus("Connecting to Castfy0 MCP Server...");
  const transport = new StdioClientTransport({
    command: execPath,
    args: [resolveMcpEntry()],
    env: buildMcpEnv(),
  });
  const client = new Client(
    { name: "playground-agent", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);

  try {
    // 2. Start Castfy0 Session
    onStatus("Starting browser recording session...");
    const startResult = await client.callTool({
      name: "castfy0_start",
      arguments: {
        url: startUrl,
        title: "Agent Recorded Demo",
        headless,
        video: true,
        trace: false,
        outputDir,
        ...(options.storageState ? { storageState: options.storageState } : {}),
      },
    });

    if (startResult.isError) {
      throw new Error(
        `Failed to start Castfy0: ${JSON.stringify(startResult)}`
      );
    }

    // Wait for the page to load/hydrate completely
    onStatus("Waiting for page load...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await client
      .callTool({
        name: "castfy0_wait",
        arguments: {
          condition: "networkidle",
          timeout: 5000,
          description: "Wait for page load and hydration",
        },
      })
      .catch(() => {
        // Ignore wait errors during initial load
      });

    // 3. Take initial snapshot
    onStatus("Analyzing starting page...");
    const initialSnapshotResult = await callCastfy0Tool(
      client,
      "castfy0_snapshot",
      {}
    );
    const initialSnapshot = formatSnapshot(initialSnapshotResult);

    // 4. Initialize Anthropic Client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 5. Run agent loop
    onStatus("Running agent loop...");
    const goalConfirmed = await runAgentLoop(
      client,
      anthropic,
      promptGoal,
      initialSnapshot,
      steps,
      onStep,
      options.signal
    );

    if (!goalConfirmed) {
      onStatus(
        "Reached the step limit without confirming the goal — the demo may be incomplete."
      );
    }

    // 6. Close Castfy0 Session & retrieve deliverables
    onStatus("Finalizing recorded demo video...");
    const endResult = await client.callTool(
      {
        name: "castfy0_end",
        arguments: {
          tts: {
            provider: "edge",
          },
        },
      },
      undefined,
      { timeout: RENDER_TIMEOUT_MS, signal: options.signal }
    );

    let deliverables: unknown = null;
    let endError: string | undefined;

    if (endResult.isError) {
      endError = `Failed to end session: ${
        (endResult.content as Array<{ text?: string }>)?.[0]?.text ||
        "Unknown error"
      }`;
      console.error(endError);
    } else if (Array.isArray(endResult.content) && endResult.content[0]) {
      try {
        deliverables = JSON.parse(
          (endResult.content[0] as { text: string }).text
        );
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        endError = `Failed to parse deliverables JSON: ${message}`;
        console.error(
          endError,
          (endResult.content[0] as { text: string }).text
        );
      }
    } else {
      endError = "No deliverables returned from castfy0_end";
      console.error(endError);
    }

    return { steps, deliverables, error: endError, goalConfirmed };
  } finally {
    // Make sure to clean up the client connection
    await client.close();
  }
}
