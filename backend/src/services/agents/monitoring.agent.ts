import { IncidentRepository } from '../../repositories/incident.repository';
import { EscalationAgent } from './escalation.agent';
import { AgentOrchestrator } from './agent.orchestrator';

export class MonitoringAgent {
  static async runScan(): Promise<{ scanned: number; escalationsTriggered: number }> {
    const incidents = await IncidentRepository.findAll();
    const activeIncidents = incidents.filter((i) => i.status !== 'CLOSED' && i.status !== 'RESOLVED');

    let escalationsTriggered = 0;

    for (const inc of activeIncidents) {
      try {
        const escalationDecision = await EscalationAgent.evaluateEscalation(inc.id);
        if (escalationDecision.shouldEscalate) {
          await AgentOrchestrator.handleEvent('SLA_AT_RISK', inc.id, {
            escalationLevel: escalationDecision.escalationLevel,
            reason: escalationDecision.reason,
          });
          escalationsTriggered++;
        }
      } catch (err) {
        console.error(`Monitoring Agent error scanning incident ${inc.id}:`, err);
      }
    }

    return { scanned: activeIncidents.length, escalationsTriggered };
  }
}
