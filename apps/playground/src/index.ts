import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { extractSnapshot } from './core/scraper.js';
import { generateJourneyMap } from './core/ai.js';
import { renderVideo } from './core/generator.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Playground Backend is running!' });
});

// Modular Test: Scrape Only
app.post('/api/test/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    console.log(`[Phase 1 Test] Extracting snapshot for ${url}...`);
    const snapshot = await extractSnapshot(url);
    res.json({ snapshot });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Modular Test: Map Only
app.post('/api/test/map', async (req, res) => {
  try {
    const { url, title, provider, promptGoal } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    if (!promptGoal) return res.status(400).json({ error: 'promptGoal is required for the agentic loop' });
    
    console.log(`[Phase 1 Test] Generating map with provider: ${provider || 'anthropic'}...`);
    const stepsJson = await generateJourneyMap(url, title || 'Generated Demo', promptGoal, provider);
    
    res.json({ steps: stepsJson });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Full E2E Video Generation
app.post('/api/generate', async (req, res) => {
  try {
    const { url, title, provider, promptGoal } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    if (!promptGoal) {
      return res.status(400).json({ error: 'promptGoal is required for the agentic loop' });
    }

    // Phase 1: Reconnaissance
    console.log(`[Phase 1] Generating journey map using ${provider || 'anthropic'}...`);
    const stepsJson = await generateJourneyMap(url, title || 'Generated Demo', promptGoal, provider);
    
    // Send immediate response so the client doesn't timeout
    res.status(202).json({ 
      status: 'accepted', 
      message: 'Video generation started in the background.',
      steps: stepsJson 
    });

    // Phase 2: Execution (Video Generation in background)
    console.log(`[Phase 2] Starting video rendering in the background...`);
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

