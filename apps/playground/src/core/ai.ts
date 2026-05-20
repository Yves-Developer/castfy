import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { DemosmithSession } from './scraper.js';

const stepSchema = z.object({
  action: z.enum(['navigate', 'click', 'fill', 'scroll', 'wait', 'assert', 'press_key']),
  ref: z.string().optional(),
  value: z.string().optional(),
  description: z.string(),
});

const stepsFileSchema = z.object({
  title: z.string(),
  startUrl: z.string(),
  steps: z.array(stepSchema),
});

export type StepsJson = z.infer<typeof stepsFileSchema>;

export async function generateJourneyMap(
  startUrl: string, 
  title: string, 
  promptGoal: string,
  provider: 'anthropic' | 'openai' | 'gemini' = 'anthropic'
): Promise<StepsJson> {
  const session = new DemosmithSession();
  await session.connect();
  
  try {
    await session.start(startUrl);
    
    if (provider === 'anthropic') {
      return await runAnthropicAgent(session, startUrl, title, promptGoal);
    } else if (provider === 'gemini') {
      return await runGeminiAgent(session, startUrl, title, promptGoal);
    } else {
      throw new Error('Agentic loop is currently optimized for Anthropic and Gemini. OpenAI support coming soon.');
    }
  } finally {
    await session.close();
  }
}

async function runAnthropicAgent(session: DemosmithSession, startUrl: string, title: string, promptGoal: string): Promise<StepsJson> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const steps: any[] = [];
  let currentSnapshot = await session.snapshot();
  
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: `Your goal is: "${promptGoal}".\nYou control a browser. Use tools to navigate until the goal is achieved.\n\nCurrent Snapshot:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` }
  ];

  const tools: Anthropic.Tool[] = [
    {
      name: 'click', description: 'Click an element',
      input_schema: { type: 'object', properties: { ref: { type: 'string' }, description: { type: 'string' } }, required: ['ref', 'description'] }
    },
    {
      name: 'fill', description: 'Fill an input',
      input_schema: { type: 'object', properties: { ref: { type: 'string' }, value: { type: 'string' }, description: { type: 'string' } }, required: ['ref', 'value', 'description'] }
    },
    {
      name: 'submit_journey', description: 'Call when goal achieved',
      input_schema: { type: 'object', properties: { success_message: { type: 'string' } }, required: ['success_message'] }
    }
  ];

  for (let i = 0; i < 15; i++) {
    const response = await anthropic.messages.create({ model: 'claude-3-5-sonnet-latest', max_tokens: 1024, messages, tools });
    messages.push({ role: 'assistant', content: response.content });

    const toolCalls = response.content.filter((c): c is Anthropic.ToolUseBlock => c.type === 'tool_use');
    if (toolCalls.length === 0) {
      messages.push({ role: 'user', content: 'You must call a tool.'});
      continue;
    }

    let journeyFinished = false;
    let newSnapshotNeeded = false;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const tool of toolCalls) {
      try {
        if (tool.name === 'click') {
          const { ref, description } = tool.input as any;
          await session.click(ref);
          steps.push({ action: 'click', ref, description });
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Success' });
          newSnapshotNeeded = true;
        } else if (tool.name === 'fill') {
          const { ref, value, description } = tool.input as any;
          await session.fill(ref, value);
          steps.push({ action: 'fill', ref, value, description });
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Success' });
          newSnapshotNeeded = true;
        } else if (tool.name === 'submit_journey') {
          journeyFinished = true;
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Success' });
        }
      } catch (err: any) {
        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: `Error: ${err.message}`, is_error: true });
      }
    }

    messages.push({ role: 'user', content: toolResults });
    if (journeyFinished) break;

    if (newSnapshotNeeded) {
      await session.wait(1500);
      currentSnapshot = await session.snapshot();
      messages.push({ role: 'user', content: `New Snapshot:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` });
    }
  }

  return { title, startUrl, steps };
}

async function runGeminiAgent(session: DemosmithSession, startUrl: string, title: string, promptGoal: string): Promise<StepsJson> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const steps: any[] = [];
  let currentSnapshot = await session.snapshot();
  
  const tools = [{
    functionDeclarations: [
      {
        name: 'click', description: 'Click an element',
        parameters: { type: 'OBJECT', properties: { ref: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['ref', 'description'] }
      },
      {
        name: 'fill', description: 'Fill an input',
        parameters: { type: 'OBJECT', properties: { ref: { type: 'STRING' }, value: { type: 'STRING' }, description: { type: 'STRING' } }, required: ['ref', 'value', 'description'] }
      },
      {
        name: 'submit_journey', description: 'Call when goal achieved',
        parameters: { type: 'OBJECT', properties: { success_message: { type: 'STRING' } }, required: ['success_message'] }
      }
    ]
  }];

  let messages: any[] = [{
    role: 'user',
    parts: [{ text: `Goal: "${promptGoal}"\n\nCurrent Snapshot:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` }]
  }];

  for (let i = 0; i < 15; i++) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: messages,
      config: { 
        tools,
        systemInstruction: 'You control a browser to achieve the user\'s goal. Call one tool at a time. Do not guess the whole script. I will return new snapshots after you click or fill.'
      }
    });
    
    if (!response.functionCalls || response.functionCalls.length === 0) {
      messages.push(response.candidates![0].content);
      messages.push({ role: 'user', parts: [{ text: 'You must call a tool to interact with the page.' }] });
      continue;
    }

    messages.push(response.candidates![0].content);

    let journeyFinished = false;
    let newSnapshotNeeded = false;
    const toolResponses: any[] = [];

    for (const tool of response.functionCalls) {
      try {
        if (tool.name === 'click') {
          const { ref, description } = tool.args as any;
          await session.click(ref);
          steps.push({ action: 'click', ref, description });
          toolResponses.push({ functionResponse: { name: tool.name, response: { result: 'Success' } } });
          newSnapshotNeeded = true;
        } else if (tool.name === 'fill') {
          const { ref, value, description } = tool.args as any;
          await session.fill(ref, value);
          steps.push({ action: 'fill', ref, value, description });
          toolResponses.push({ functionResponse: { name: tool.name, response: { result: 'Success' } } });
          newSnapshotNeeded = true;
        } else if (tool.name === 'submit_journey') {
          journeyFinished = true;
          toolResponses.push({ functionResponse: { name: tool.name, response: { result: 'Success' } } });
        }
      } catch (err: any) {
        toolResponses.push({ functionResponse: { name: tool.name, response: { error: err.message } } });
      }
    }

    if (journeyFinished) break;

    if (newSnapshotNeeded) {
      await session.wait(1500);
      currentSnapshot = await session.snapshot();
      messages.push({
        role: 'user',
        parts: [
          ...toolResponses,
          { text: `New Snapshot:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        parts: toolResponses
      });
    }
  }

  return { title, startUrl, steps };
}

