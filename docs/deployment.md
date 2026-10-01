# SentinelOps AI Deployment Guide

## Production Architecture

```
Frontend (Vite / React) -> Render / Vercel / Netlify
Backend (Node.js / Express) -> Render / Fly.io / Railway
Database (PostgreSQL) -> Supabase PostgreSQL
AI Provider -> Google Gemini API
```

---

## Environment Variables

Copy `.env.example` to `.env` in the root directory:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
JWT_SECRET=super_secret_production_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash
FRONTEND_URL=https://sentinelops-ai.vercel.app
AI_AUTONOMY_LEVEL=2
```

---

## Local Docker Deployment

Run the complete stack with Docker Compose:

```bash
docker-compose up --build
```
