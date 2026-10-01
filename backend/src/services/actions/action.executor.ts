import { PolicyEngine } from '../policy/policy.engine';
import { AIRepository, AuditRepository } from '../../repositories/ai.repository';
import { NotificationRepository } from '../../repositories/notification.repository';
import { IncidentRepository } from '../../repositories/incident.repository';
import { AIAction } from '../../types';

export class ActionExecutor {
  static async executeAiAction(
    incidentId: string,
    agentType: string,
    actionType: string,
    payload: Record<string, any>,
    executorName = 'SentinelOps AI'
  ): Promise<AIAction> {
    // 1. Evaluate Policy Engine
    const policy = PolicyEngine.evaluateAiAction(actionType);
    if (!policy.allowed) {
      throw new Error(`Policy Rejected Action: ${policy.reason}`);
    }

    const executionStatus = policy.requiresHumanApproval ? 'PENDING_APPROVAL' : 'SUCCESS';

    let executionResult: Record<string, any> = { policyReason: policy.reason };

    // 2. Perform actual execution if non-blocking
    if (executionStatus === 'SUCCESS') {
      if (actionType === 'NOTIFY_SUPERVISOR' && payload.recipientId) {
        await NotificationRepository.create({
          recipient_id: payload.recipientId,
          incident_id: incidentId,
          channel: payload.channel || 'in_app',
          type: 'ESCALATION',
          subject: payload.subject || 'Incident Alert',
          message: payload.message || 'Notification triggered by SentinelOps AI',
          language: payload.language || 'en',
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
        executionResult.notificationSent = true;
      }

      if (actionType === 'ESCALATE_INCIDENT') {
        const incident = await IncidentRepository.findById(incidentId);
        if (incident && incident.status !== 'ESCALATED') {
          await IncidentRepository.update(incidentId, { status: 'ESCALATED' });
          await IncidentRepository.addUpdate({
            incident_id: incidentId,
            user_id: payload.actorId || incident.created_by,
            update_type: 'ESCALATION',
            message: `[AI Escalation] ${payload.reason || 'SLA & Ownership risk detected.'}`,
            language: incident.original_language || 'en',
          });
          executionResult.escalatedStatusSet = true;
        }
      }
    }

    // 3. Log AI Action
    const aiAction = await AIRepository.saveAction({
      incident_id: incidentId,
      agent_type: agentType,
      action_type: actionType,
      action_payload: payload,
      execution_status: executionStatus,
      executed_by: executorName,
      execution_result: executionResult,
    });

    // 4. Record Audit Log
    await AuditRepository.createLog({
      actor_id: undefined,
      actor_type: 'AI_AGENT',
      action: `AI_ACTION_${actionType}`,
      entity_type: 'INCIDENT',
      entity_id: incidentId,
      old_value: null,
      new_value: { actionType, executionStatus, payload },
      metadata: { policyReason: policy.reason, agentType },
    });

    return aiAction;
  }
}
