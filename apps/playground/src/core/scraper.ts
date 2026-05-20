import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Connects to the Demosmith MCP server, starts a silent session, and extracts the snapshot.
 */
export async function extractSnapshot(url: string): Promise<string> {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['demosmith-mcp'],
  });

  const client = new Client(
    { name: 'playground-app', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  try {
    // 1. Start the session silently (headless, no video)
    console.log('[Scraper] Calling demosmith_start...');
    const startResult = await client.callTool({
      name: 'demosmith_start',
      arguments: {
        url,
        title: 'Temporary Snapshot Session',
        headless: true,
        video: false,
        trace: false,
      }
    });
    
    if (startResult.isError) {
      throw new Error(`Failed to start session: ${JSON.stringify(startResult)}`);
    }

    // 2. Take the snapshot
    console.log('[Scraper] Calling demosmith_snapshot...');
    const snapshotResult = await client.callTool({
      name: 'demosmith_snapshot',
      arguments: {}
    });

    if (snapshotResult.isError) {
      throw new Error(`Failed to take snapshot: ${JSON.stringify(snapshotResult)}`);
    }

    // Extract the text output from the tool result
    const snapshotText = (snapshotResult.content[0] as any)?.text || '';
    
    // 3. End the session quickly to free up resources
    console.log('[Scraper] Ending session...');
    await client.callTool({
      name: 'demosmith_end',
      arguments: {}
    });

    return snapshotText;
  } finally {
    // Ensure the MCP client is closed
    await client.close();
  }
}
