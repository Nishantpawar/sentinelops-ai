import { IncidentAnalysisAgent } from './incident.analysis.agent';
import { OwnershipAgent } from './ownership.agent';
import { CommunicationAgent } from './communication.agent';
import { ResolutionAgent } from './resolution.agent';
import { IncidentRepository } from '../../repositories/incident.repository';
import { AIRepository, AuditRepository } from '../../repositories/ai.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { ActionExecutor } from '../actions/action.executor';
import { config } from '../../config/env';

export class AgentOrchestrator {
  static async onIncidentCreated(incidentId: string) {
    const incident = await IncidentRepository.findById(incidentId);
    if (!incident) return;

    // 1. Run Incident Analysis Agent
    const analysis = await IncidentAnalysisAgent.analyze(incident.description, incident.title);

    // Save Analysis Recommendation
    await AIRepository.saveRecommendation({
      incident_id: incidentId,
      agent_type: 'analysis',
      recommendation_type: 'INCIDENT_CLASSIFICATION',
      input_context: { title: incident.title, description: incident.description },
      recommendation: analysis as any,
      confidence: analysis.confidence,
      status: 'APPROVED',
    });

    // Update incident with AI classification if different
    await IncidentRepository.update(incidentId, {
      category: analysis.category,
      severity: analysis.severity,
      priority: analysis.urgency,
      original_language: analysis.language,
    });

    // Audit log classification
    await AuditRepository.createLog({
      actor_id: undefined,
      actor_type: 'AI_AGENT',
      action: 'AI_CLASSIFIED_INCIDENT',
      entity_type: 'INCIDENT',
      entity_id: incidentId,
      old_value: null,
      new_value: analysis as any,
      metadata: { agent: 'IncidentAnalysisAgent' },
    });

    // 2. Run Ownership Agent
    try {
      const ownershipRec = await OwnershipAgent.recommendOwner(incidentId);
      await AIRepository.saveRecommendation({
        incident_id: incidentId,
        agent_type: 'ownership',
        recommendation_type: 'OWNER_RECOMMENDATION',
        input_context: { incidentId },
        recommendation: ownershipRec as any,
        confidence: ownershipRec.confidence,
        status: 'PENDING',
      });
    } catch (err) {
      console.warn('Ownership recommendation skipped (no active techs):', err);
    }

    // 3. Run Communication Agent
    const commDecision = await CommunicationAgent.decide(
      incidentId,
      incident.severity === 'critical' || incident.severity === 'high' ? 'UNASSIGNED_URGENT' : 'ASSIGNED'
    );

    if (commDecision.shouldNotify) {
      for (const rec of commDecision.recipients) {
        // Check notification cooldown
        const recentNotif = await NotificationRepository.findRecentDuplicate(
          rec.userId,
          incidentId,
          'UNASSIGNED_URGENT',
          config.notificationCooldownMinutes
        );

        if (!recentNotif) {
          await ActionExecutor.executeAiAction(incidentId, 'communication', 'NOTIFY_SUPERVISOR', {
            recipientId: rec.userId,
            subject: commDecision.subject,
            message: commDecision.message,
            channel: commDecision.channel,
            language: commDecision.language,
          });
        }
      }
    }
  }

  static async handleEvent(eventType: string, incidentId: string, payload?: any) {
    const incident = await IncidentRepository.findById(incidentId);
    if (!incident) return;

    if (eventType === 'SLA_AT_RISK' || eventType === 'UNASSIGNED_STALE') {
      const commDecision = await CommunicationAgent.decide(incidentId, 'SLA_WARNING');
      if (commDecision.shouldNotify) {
        for (const rec of commDecision.recipients) {
          await ActionExecutor.executeAiAction(incidentId, 'escalation', 'ESCALATE_INCIDENT', {
            recipientId: rec.userId,
            reason: payload?.reason || 'SLA Risk / Unassigned Timeout',
            subject: commDecision.subject,
            message: commDecision.message,
          });
        }
      }
    } else if (eventType === 'RESOLVED') {
      const updates = await IncidentRepository.getUpdates(incidentId);
      const lastUpdate = updates[updates.length - 1];
      const resolutionAssessment = await ResolutionAgent.evaluateResolution(
        incident.title,
        incident.description,
        lastUpdate?.message || 'Resolution marked by technician.'
      );

      await AIRepository.saveRecommendation({
        incident_id: incidentId,
        agent_type: 'resolution',
        recommendation_type: 'RESOLUTION_SUMMARY',
        input_context: { resolutionNotes: lastUpdate?.message },
        recommendation: resolutionAssessment as any,
        confidence: resolutionAssessment.qualityScore / 100,
        status: 'PENDING',
      });
    }
  }
}
