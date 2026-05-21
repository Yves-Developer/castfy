import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { StepsJson } from './ai.js';

/**
 * Runs Phase 2: Execution.
 * Writes the steps.json to disk and executes `demosmith replay`.
 */
export async function renderVideo(stepsData: StepsJson): Promise<string> {
  const outputDir = path.join(process.cwd(), 'output', `${Date.now()}`);
  const stepsFilePath = path.join(process.cwd(), `temp_steps_${Date.now()}.json`);

  try {
    // 1. Write the JSON map to disk
    await fs.mkdir(path.dirname(outputDir), { recursive: true });
    await fs.writeFile(stepsFilePath, JSON.stringify(stepsData, null, 2), 'utf-8');

    console.log(`[Generator] Wrote steps map to ${stepsFilePath}. Launching Demosmith CLI...`);

    // 2. Spawn the Demosmith CLI process
    return new Promise((resolve, reject) => {
      // Running using npx so it finds the globally/locally installed demosmith
      const child = spawn('npx', ['demosmith', 'replay', stepsFilePath, '-o', outputDir, '--video'], {
        stdio: 'inherit', // Stream logs to the main server console
        shell: true,
      });

      child.on('close', async (code) => {
        // 3. Clean up the temp file
        await fs.unlink(stepsFilePath).catch(() => {});

        if (code === 0) {
          console.log(`[Generator] Video generated successfully at ${outputDir}`);
          // In a real app, you would upload `outputDir/demo.webm` to S3 here
          resolve(outputDir);
        } else {
          reject(new Error(`Demosmith CLI exited with code ${code}`));
        }
      });
      
      child.on('error', (err) => {
        reject(err);
      });
    });

  } catch (error) {
    // Attempt cleanup if something failed before spawning
    await fs.unlink(stepsFilePath).catch(() => {});
    throw error;
  }
}
