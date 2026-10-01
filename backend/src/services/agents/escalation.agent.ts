import { geminiProvider } from '../ai/gemini.provider';
import { EscalationDecisionSchema } from '../../schemas/ai.schema';
import { AgentContextBuilder } from '../ai/context.builder';
import { z } from 'zod';

export type EscalationDecision = z.infer<typeof EscalationDecisionSchema>;

export class EscalationAgent {
  static async evaluateEscalation(incidentId: string): Promise<EscalationDecision> {
    const context = await AgentContextBuilder.buildIncidentContext(incidentId);
    const inc = context.incident;

    const now = Date.now();
    const createdTime = new Date(inc.created_at).getTime();
    const ageMinutes = (now - createdTime) / (1000 * 60);

    const isUnassignedUrgent = !inc.assigned_to && (inc.severity === 'critical' || inc.severity === 'high');
    const isSlaBreachedOrNear = inc.sla_deadline ? (new Date(inc.sla_deadline).getTime() - now) / (1000 * 60) <= 20 : false;

    const shouldEscalate = isUnassignedUrgent || isSlaBreachedOrNear || ageMinutes > 30;

    const systemPrompt = `You are SentinelOps AI Escalation Agent.
Monitor incidents for ownership gaps, inactivity, and SLA risks. Recommend proper escalation level: REMINDER, SUPERVISOR_ALERT, or MANAGER_ESCALATION.`;

    const userPrompt = `Incident Number: ${inc.incident_number}
Severity: ${inc.severity}
Status: ${inc.status}
Age Minutes: ${Math.round(ageMinutes)}
Assigned To: ${inc.assigned_to || 'UNASSIGNED'}
SLA Deadline: ${inc.sla_deadline || 'None'}`;

    const fallback: EscalationDecision = {
      shouldEscalate,
      escalationLevel: isSlaBreachedOrNear || isUnassignedUrgent ? 'MANAGER_ESCALATION' : 'SUPERVISOR_ALERT',
      reason: isUnassignedUrgent
        ? `Incident has remained unassigned for ${Math.round(ageMinutes)} minutes with ${inc.severity} severity.`
        : `SLA window approaching breach threshold.`,
      suggestedAction: 'Reassign to backup supervisor or dispatch emergency technical lead.',
      confidence: 0.95,
    };

    return await geminiProvider.generateStructuredJSON(
      systemPrompt,
      userPrompt,
      EscalationDecisionSchema,
      fallback
    );
  }
}
