import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to process.env

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sentinelops',
  jwtSecret: process.env.JWT_SECRET || 'sentinelops_super_secret_jwt_key_2026_production_grade',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gemini-1.5-flash',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  aiAutonomyLevel: parseInt(process.env.AI_AUTONOMY_LEVEL || '2', 10), // 1: Advisory, 2: Assisted, 3: Controlled Autonomous
  notificationCooldownMinutes: parseInt(process.env.NOTIFICATION_COOLDOWN_MINUTES || '15', 10),
};
