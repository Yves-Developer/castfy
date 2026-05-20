import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Defaults to ANTHROPIC_API_KEY environment variable
});

// Using Zod to define the expected structure for the LLM output
const stepSchema = z.object({
  action: z.enum(['navigate', 'click', 'fill', 'scroll', 'wait', 'assert', 'press_key']),
  ref: z.string().optional().describe('The element ref to interact with (e.g., "12", "text:Submit", "placeholder:Email")'),
  value: z.string().optional().describe('The value to fill or key to press'),
  description: z.string().describe('A human-readable description of what this step does'),
});

const stepsFileSchema = z.object({
  title: z.string(),
  startUrl: z.string(),
  steps: z.array(stepSchema),
});

export type StepsJson = z.infer<typeof stepsFileSchema>;

/**
 * Sends the accessibility tree snapshot to the LLM to map out the shortest journey.
 */
export async function generateJourneyMap(url: string, snapshotText: string, title: string): Promise<StepsJson> {
  const prompt = `
You are an expert AI automated testing engineer.
Your task is to analyze the provided Accessibility Tree Snapshot of a webpage and generate a structured JSON script to automate the "shortest journey" for a user.
For example, if it's an ecommerce site, the journey should add an item to the cart and go to checkout.

Here is the snapshot of ${url}:
<snapshot>
${snapshotText.substring(0, 50000)} // Truncate if extremely large, but usually fine
</snapshot>

Rules for generating the script:
1. Prefer using text, placeholder, or label references if they are completely unique (e.g., "text:Add to cart").
2. If the text is not unique, use the numerical ref ID shown in brackets (e.g., "112").
3. Your output must strictly match the expected JSON schema.

Generate the shortest, most effective journey to demonstrate the core value of this page.
`;

  console.log('[AI] Sending prompt to Anthropic Claude...');
  
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 4096,
    system: "You are an AI that outputs purely valid JSON matching the requested schema. No markdown wrapping.",
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  const responseText = (response.content[0] as any).text;
  
  try {
    // Attempt to parse the LLM output. In production, consider using Anthropic's tool use for strict schema adherence.
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    const parsedData = JSON.parse(jsonStr);
    
    // Validate against schema
    return stepsFileSchema.parse(parsedData);
  } catch (err: any) {
    throw new Error(`Failed to parse AI response into valid steps JSON: ${err.message}\nRaw Output: ${responseText}`);
  }
}
