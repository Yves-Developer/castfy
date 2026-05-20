import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class DemosmithSession {
  private client: Client;
  private transport: StdioClientTransport;
  private isStarted = false;

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['demosmith-mcp'],
    });

    this.client = new Client(
      { name: 'playground-app', version: '1.0.0' },
      { capabilities: {} }
    );
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async start(url: string, title: string = 'Agentic Session') {
    console.log(`[Scraper] Starting MCP session for ${url}`);
    const result = await this.client.callTool({
      name: 'demosmith_start',
      arguments: { url, title, headless: true, video: false, trace: false }
    });
    if (result.isError) throw new Error(`Start failed: ${JSON.stringify(result)}`);
    this.isStarted = true;
  }

  async snapshot(): Promise<string> {
    console.log(`[Scraper] Taking snapshot...`);
    const result = await this.client.callTool({ name: 'demosmith_snapshot', arguments: {} });
    if (result.isError) throw new Error(`Snapshot failed: ${JSON.stringify(result)}`);
    return (result.content[0] as any)?.text || '';
  }

  async click(ref: string) {
    console.log(`[Scraper] Clicking ref: ${ref}`);
    const result = await this.client.callTool({ name: 'demosmith_click', arguments: { ref } });
    if (result.isError) throw new Error(`Click failed: ${JSON.stringify(result)}`);
  }

  async fill(ref: string, value: string) {
    console.log(`[Scraper] Filling ref: ${ref} with value: ${value}`);
    const result = await this.client.callTool({ name: 'demosmith_fill', arguments: { ref, value } });
    if (result.isError) throw new Error(`Fill failed: ${JSON.stringify(result)}`);
  }

  async navigate(url: string) {
    console.log(`[Scraper] Navigating to: ${url}`);
    const result = await this.client.callTool({ name: 'demosmith_navigate', arguments: { url } });
    if (result.isError) throw new Error(`Navigate failed: ${JSON.stringify(result)}`);
  }

  async wait(ms: number) {
    console.log(`[Scraper] Waiting ${ms}ms...`);
    const result = await this.client.callTool({ name: 'demosmith_wait', arguments: { ms } });
    if (result.isError) throw new Error(`Wait failed: ${JSON.stringify(result)}`);
  }

  async close() {
    if (this.isStarted) {
      console.log(`[Scraper] Ending session...`);
      await this.client.callTool({ name: 'demosmith_end', arguments: {} }).catch(() => {});
    }
    await this.client.close();
  }
}

// Keep the old function for backward compatibility with the Scrape Only tab
export async function extractSnapshot(url: string): Promise<string> {
  const session = new DemosmithSession();
  await session.connect();
  try {
    await session.start(url);
    const snapshot = await session.snapshot();
    return snapshot;
  } finally {
    await session.close();
  }
}
