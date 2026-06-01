import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface AgentStep {
  action: string;
  description: string;
  error?: string;
  ref?: string;
  status: "success" | "error";
  value?: string;
}

export interface AgentResult {
  deliverables?: any;
  error?: string;
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

function pruneOldSnapshots(
  messages: Anthropic.MessageParam[]
): Anthropic.MessageParam[] {
  let lastSnapshotMessageIndex = -1;
  let lastSnapshotBlockIndex = -1;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      if (
        typeof msg.content === "string" &&
        msg.content.includes("<snapshot>")
      ) {
        lastSnapshotMessageIndex = i;
        break;
      }
      if (Array.isArray(msg.content)) {
        const hasSnapshot = msg.content.some(
          (item) =>
            (item.type === "text" &&
              typeof (item as any).text === "string" &&
              (item as any).text.includes("<snapshot>")) ||
            (item.type === "tool_result" &&
              typeof (item as any).content === "string" &&
              (item as any).content.includes("<snapshot>"))
        );
        if (hasSnapshot) {
          lastSnapshotMessageIndex = i;
          for (let j = msg.content.length - 1; j >= 0; j--) {
            const item = msg.content[j];
            if (
              (item.type === "text" &&
                typeof (item as any).text === "string" &&
                (item as any).text.includes("<snapshot>")) ||
              (item.type === "tool_result" &&
                typeof (item as any).content === "string" &&
                (item as any).content.includes("<snapshot>"))
            ) {
              lastSnapshotBlockIndex = j;
              break;
            }
          }
          break;
        }
      }
    }
  }

  return messages.map((msg, msgIndex) => {
    if (msgIndex === lastSnapshotMessageIndex) {
      if (Array.isArray(msg.content)) {
        const prunedContent = msg.content.map((item, blockIndex) => {
          if (blockIndex !== lastSnapshotBlockIndex) {
            if (
              item.type === "text" &&
              typeof (item as any).text === "string" &&
              (item as any).text.includes("<snapshot>")
            ) {
              const prunedText = item.text.replace(
                /<snapshot>[\s\S]*?<\/snapshot>/g,
                "[Snapshot omitted for brevity]"
              );
              return { ...item, text: prunedText };
            }
            if (
              item.type === "tool_result" &&
              typeof (item as any).content === "string" &&
              (item as any).content.includes("<snapshot>")
            ) {
              const prunedText = (item as any).content.replace(
                /<snapshot>[\s\S]*?<\/snapshot>/g,
                "[Snapshot omitted for brevity]"
              );
              return { ...item, content: prunedText };
            }
          }
          return item;
        });
        return { ...msg, content: prunedContent };
      }
    } else if (typeof msg.content === "string") {
      if (msg.content.includes("<snapshot>")) {
        const pruned = msg.content.replace(
          /<snapshot>[\s\S]*?<\/snapshot>/g,
          "[Snapshot omitted for brevity]"
        );
        return { ...msg, content: pruned };
      }
    } else if (Array.isArray(msg.content)) {
      const prunedContent = msg.content.map((item) => {
        if (
          item.type === "text" &&
          typeof (item as any).text === "string" &&
          (item as any).text.includes("<snapshot>")
        ) {
          const prunedText = item.text.replace(
            /<snapshot>[\s\S]*?<\/snapshot>/g,
            "[Snapshot omitted for brevity]"
          );
          return { ...item, text: prunedText };
        }
        if (
          item.type === "tool_result" &&
          typeof (item as any).content === "string" &&
          (item as any).content.includes("<snapshot>")
        ) {
          const prunedText = (item as any).content.replace(
            /<snapshot>[\s\S]*?<\/snapshot>/g,
            "[Snapshot omitted for brevity]"
          );
          return { ...item, content: prunedText };
        }
        return item;
      });
      return { ...msg, content: prunedContent };
    }
    return msg;
  });
}

export async function runAgent(
  startUrl: string,
  promptGoal: string,
  outputDir: string,
  headless: boolean,
  _onStep: (step: AgentStep) => void,
  _onStatus: (status: string) => void
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
    command: "pnpm",
    args: ["exec", "castfy0-mcp"],
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
        trace: true,
        outputDir,
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
    let currentSnapshot = formatSnapshot(initialSnapshotResult);

    // 4. Initialize Anthropic Client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // 5. Construct prompt & messages history
    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `Your goal is: "${promptGoal}".\n\nYou control a browser recording session. Use tools to interact with the page until the goal is achieved.\n\nInitial Page Snapshot:\n<snapshot>\n${currentSnapshot.slice(0, 50_000)}\n</snapshot>`,
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
6. Call \`submit_journey\` once the user's goal has been completely achieved.`;

    const tools: Anthropic.Tool[] = [
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
              description:
                "Element ID to check (not needed for URL/title checks)",
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
        name: "submit_journey",
        description:
          "Call this when the user's goal has been completely achieved.",
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

    onStatus("Running agent loop...");
    let journeyFinished = false;

    for (let i = 0; i < 30; i++) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        system: systemInstruction,
        messages: pruneOldSnapshots(messages),
        tools,
      });

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

      let newSnapshotNeeded = false;
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const tool of toolCalls) {
        const actionDescription =
          (tool.input as any).description || "Interacting with page";
        const stepInfo: AgentStep = {
          action: tool.name,
          description: actionDescription,
          status: "success",
        };

        try {
          if (tool.name === "click") {
            const { ref } = tool.input as any;
            stepInfo.ref = ref;
            await callCastfy0Tool(client, "castfy0_click", {
              ref,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "fill") {
            const { ref, value } = tool.input as any;
            stepInfo.ref = ref;
            stepInfo.value = value;
            await callCastfy0Tool(client, "castfy0_fill", {
              ref,
              value,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "select") {
            const { ref, value } = tool.input as any;
            stepInfo.ref = ref;
            stepInfo.value = value;
            await callCastfy0Tool(client, "castfy0_select", {
              ref,
              value,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "hover") {
            const { ref } = tool.input as any;
            stepInfo.ref = ref;
            await callCastfy0Tool(client, "castfy0_hover", {
              ref,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "press_key") {
            const { key } = tool.input as any;
            stepInfo.value = key;
            await callCastfy0Tool(client, "castfy0_press_key", {
              key,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "scroll") {
            const { direction } = tool.input as any;
            stepInfo.value = direction;
            await callCastfy0Tool(client, "castfy0_scroll", {
              direction,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "assert") {
            const { assert_type, ref, expected } = tool.input as any;
            stepInfo.ref = ref;
            stepInfo.value = expected;
            await callCastfy0Tool(client, "castfy0_assert", {
              type: assert_type,
              ref,
              expected,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "navigate") {
            const { url } = tool.input as any;
            stepInfo.value = url;
            await callCastfy0Tool(client, "castfy0_navigate", {
              url,
              description: actionDescription,
            });
            newSnapshotNeeded = true;
          } else if (tool.name === "snapshot") {
            const snapshotResult = await callCastfy0Tool(
              client,
              "castfy0_snapshot",
              {}
            );
            currentSnapshot = formatSnapshot(snapshotResult);
            toolResults.push({
              type: "tool_result",
              tool_use_id: tool.id,
              content: `Snapshot:\n<snapshot>\n${currentSnapshot.slice(0, 50_000)}\n</snapshot>`,
            });
            steps.push(stepInfo);
            onStep(stepInfo);
            continue;
          } else if (tool.name === "submit_journey") {
            journeyFinished = true;
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: "Success",
          });
          steps.push(stepInfo);
          onStep(stepInfo);
        } catch (err: any) {
          console.error(`Tool ${tool.name} failed:`, err);
          stepInfo.status = "error";
          stepInfo.error = err.message;
          toolResults.push({
            type: "tool_result",
            tool_use_id: tool.id,
            content: `Error: ${err.message}`,
            is_error: true,
          });
          steps.push(stepInfo);
          onStep(stepInfo);
        }
      }

      if (journeyFinished) {
        break;
      }

      if (newSnapshotNeeded) {
        // Sleep 2000ms locally to allow client-side router transitions and fetches to trigger
        await new Promise((resolve) => setTimeout(resolve, 2000));
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

        // Fetch new snapshot
        const snapshotResult = await callCastfy0Tool(
          client,
          "castfy0_snapshot",
          {}
        );
        currentSnapshot = formatSnapshot(snapshotResult);

        messages.push({
          role: "user",
          content: [
            ...toolResults,
            {
              type: "text",
              text: `New Snapshot:\n<snapshot>\n${currentSnapshot.slice(0, 50_000)}\n</snapshot>`,
            },
          ],
        });
      } else {
        messages.push({ role: "user", content: toolResults });
      }
    }

    // 6. Close Castfy0 Session & retrieve deliverables
    onStatus("Finalizing recorded demo video...");
    const endResult = await client.callTool({
      name: "castfy0_end",
      arguments: {},
    });

    let deliverables = null;
    let endError: string | undefined;

    if (endResult.isError) {
      endError = `Failed to end session: ${
        (endResult.content as Array<{ text?: string }>)?.[0]?.text ||
        "Unknown error"
      }`;
      console.error(endError);
    } else if (Array.isArray(endResult.content) && endResult.content[0]) {
      try {
        deliverables = JSON.parse((endResult.content[0] as any).text);
      } catch (e: any) {
        endError = `Failed to parse deliverables JSON: ${e.message}`;
        console.error(endError, (endResult.content[0] as any).text);
      }
    } else {
      endError = "No deliverables returned from castfy0_end";
      console.error(endError);
    }

    return { steps, deliverables, error: endError };
  } finally {
    // Make sure to clean up the client connection
    await client.close();
  }
}
