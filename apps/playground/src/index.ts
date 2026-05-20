import express from 'express';
import cors from 'cors';
import { extractSnapshot } from './core/scraper.js';
import { generateJourneyMap } from './core/ai.js';
import { renderVideo } from './core/generator.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Playground Backend is running!' });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { url, title } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Phase 1: Reconnaissance (Scraping & Intelligence)
    console.log(`[Phase 1] Extracting snapshot for ${url}...`);
    const snapshot = await extractSnapshot(url);
    
    console.log(`[Phase 1] Generating journey map using AI...`);
    const stepsJson = await generateJourneyMap(url, snapshot, title || 'Generated Demo');
    
    // Send immediate response so the client doesn't timeout
    res.status(202).json({ 
      status: 'accepted', 
      message: 'Video generation started in the background.',
      steps: stepsJson 
    });

    // Phase 2: Execution (Video Generation in background)
    console.log(`[Phase 2] Starting video rendering in the background...`);
    // Note: In production, this should be sent to a robust queue like BullMQ or Inngest.
    renderVideo(stepsJson).catch(err => {
      console.error('[Phase 2] Error generating video:', err);
    });

  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Playground API listening on http://localhost:${PORT}`);
});
