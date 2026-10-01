import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { geminiProvider } from '../services/ai/gemini.provider';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: db.isPostgresConnected ? 'connected' : 'memory_store_dev',
    ai: geminiProvider.isAvailable ? 'available' : 'rule_based_fallback',
    timestamp: new Date().toISOString(),
  });
});

export default router;
