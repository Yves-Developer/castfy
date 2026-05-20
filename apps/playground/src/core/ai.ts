import Anthropic from '@anthropic-ai/sdk';
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
  if (provider !== 'anthropic') {
    throw new Error('Agentic loop is currently optimized for Anthropic Claude 3.5 Sonnet. Please select Anthropic in the UI.');
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not set');

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const session = new DemosmithSession();
  await session.connect();
  
  const steps: any[] = [];
  
  try {
    await session.start(startUrl);
    let currentSnapshot = await session.snapshot();
    
    const messages: Anthropic.MessageParam[] = [
      { 
        role: 'user', 
        content: `Your goal is: "${promptGoal}".\nYou control a browser. Use the provided tools to navigate the site until the goal is achieved. Do not guess the whole script at once. Execute one logical step (like clicking a link or filling a form), and I will return the new page snapshot.\n\nCurrent Page Snapshot:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` 
      }
    ];

    const tools: Anthropic.Tool[] = [
      {
        name: 'click',
        description: 'Click an element on the page',
        input_schema: {
          type: 'object',
          properties: {
            ref: { type: 'string', description: 'The text or numerical ref to click (e.g., "text:Add to Cart" or "112")' },
            description: { type: 'string', description: 'Human readable description of the action' }
          },
          required: ['ref', 'description']
        }
      },
      {
        name: 'fill',
        description: 'Fill an input field',
        input_schema: {
          type: 'object',
          properties: {
            ref: { type: 'string', description: 'The input ref' },
            value: { type: 'string', description: 'The text to type' },
            description: { type: 'string', description: 'Human readable description of the action' }
          },
          required: ['ref', 'value', 'description']
        }
      },
      {
        name: 'submit_journey',
        description: 'Call this when you have successfully achieved the goal on the website.',
        input_schema: {
          type: 'object',
          properties: {
            success_message: { type: 'string' }
          },
          required: ['success_message']
        }
      }
    ];

    console.log(`[AI Agent] Starting agentic loop for goal: "${promptGoal}"`);

    // Agent Loop (Max 15 iterations to prevent infinite loops)
    for (let i = 0; i < 15; i++) {
      console.log(`[AI Agent] Iteration ${i+1}...`);
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        messages,
        tools
      });

      messages.push({ role: 'assistant', content: response.content });

      const toolCalls = response.content.filter((c): c is Anthropic.ToolUseBlock => c.type === 'tool_use');
      
      if (toolCalls.length === 0) {
        // If it didn't call a tool, force it to.
        messages.push({ role: 'user', content: 'You must call a tool to interact with the page or call submit_journey if done.'});
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
            toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Click executed successfully.' });
            newSnapshotNeeded = true;
          } else if (tool.name === 'fill') {
            const { ref, value, description } = tool.input as any;
            await session.fill(ref, value);
            steps.push({ action: 'fill', ref, value, description });
            toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Fill executed successfully.' });
            newSnapshotNeeded = true;
          } else if (tool.name === 'submit_journey') {
            journeyFinished = true;
            toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: 'Journey marked as complete.' });
          }
        } catch (err: any) {
          toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: `Error: ${err.message}`, is_error: true });
        }
      }

      messages.push({ role: 'user', content: toolResults });

      if (journeyFinished) {
        console.log(`[AI Agent] Journey completed in ${i+1} steps!`);
        break;
      }

      if (newSnapshotNeeded) {
        await session.wait(1500); // Wait for network/animations
        currentSnapshot = await session.snapshot();
        messages.push({ 
          role: 'user', 
          content: `New Page Snapshot after actions:\n<snapshot>\n${currentSnapshot.substring(0, 50000)}\n</snapshot>` 
        });
      }
    }

    return {
      title,
      startUrl,
      steps
    };

  } finally {
    await session.close();
  }
}

