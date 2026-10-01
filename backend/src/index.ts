import app from './app';
import { config } from './config/env';
import { MonitoringAgent } from './services/agents/monitoring.agent';

const server = app.listen(config.port, () => {
  console.log(`🚀 SentinelOps AI Server listening on http://localhost:${config.port}`);
  console.log(`🛡️  Agentic AI Autonomy Level: ${config.aiAutonomyLevel}`);

  // Background Monitoring Agent Cron (Runs every 2 minutes for SLA & unassigned checks)
  setInterval(() => {
    MonitoringAgent.runScan().catch((err) => {
      console.error('Monitoring Agent background scan failed:', err);
    });
  }, 120000);
});

export default server;
