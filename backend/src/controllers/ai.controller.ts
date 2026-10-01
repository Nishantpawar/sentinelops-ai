import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IncidentAnalysisAgent } from '../services/agents/incident.analysis.agent';
import { OwnershipAgent } from '../services/agents/ownership.agent';
import { EscalationAgent } from '../services/agents/escalation.agent';
import { CommunicationAgent } from '../services/agents/communication.agent';
import { AIRepository, AuditRepository } from '../repositories/ai.repository';
import { IncidentRepository } from '../repositories/incident.repository';
import { IncidentService } from '../services/incident.service';

export class AIController {
  static async analyzeIncident(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { text, title } = req.body;
      const result = await IncidentAnalysisAgent.analyze(text, title);
      res.json({ success: true, data: result, message: 'AI Incident Analysis generated' });
    } catch (err) {
      next(err);
    }
  }

  static async recommendAssignment(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { incidentId } = req.body;
      const result = await OwnershipAgent.recommendOwner(incidentId);
      res.json({ success: true, data: result, message: 'AI Ownership Recommendation generated' });
    } catch (err) {
      next(err);
    }
  }

  static async evaluateEscalation(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { incidentId } = req.body;
      const result = await EscalationAgent.evaluateEscalation(incidentId);
      res.json({ success: true, data: result, message: 'AI Escalation Evaluation completed' });
    } catch (err) {
      next(err);
    }
  }

  static async communicationDecision(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { incidentId, eventTrigger } = req.body;
      const result = await CommunicationAgent.decide(incidentId, eventTrigger || 'UNASSIGNED_URGENT');
      res.json({ success: true, data: result, message: 'AI Communication Decision generated' });
    } catch (err) {
      next(err);
    }
  }

  static async whyAtRisk(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { incidentId } = req.body;
      const incident = await IncidentRepository.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
      }

      const updates = await IncidentRepository.getUpdates(incidentId);
      const now = Date.now();
      const createdTime = new Date(incident.created_at).getTime();
      const ageMinutes = Math.round((now - createdTime) / (1000 * 60));

      const reasons: string[] = [];
      if (!incident.assigned_to) {
        reasons.push(`Incident INC-${incident.incident_number} has remained unassigned for ${ageMinutes} minutes with no designated owner.`);
      }
      if (incident.sla_state === 'At Risk' || incident.sla_state === 'Breached') {
        reasons.push(`SLA state is ${incident.sla_state}. Deadline threshold is imminent.`);
      }
      if (updates.length === 0) {
        reasons.push('No technical updates or progress logs posted since incident creation.');
      }

      res.json({
        success: true,
        data: {
          incidentId,
          reasons: reasons.length > 0 ? reasons : ['No high SLA risk detected currently.'],
        },
        message: 'AI Risk analysis generated',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getRecommendations(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const recs = await AIRepository.findRecommendationsByIncident(req.params.incidentId);
      res.json({ success: true, data: recs, message: 'AI recommendations retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async approveRecommendation(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { id } = req.params;
      const rec = await AIRepository.updateRecommendationStatus(id, 'APPROVED', req.user.id);
      if (!rec) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recommendation not found' } });
      }

      // If it was an ownership recommendation, trigger technician assignment
      if (rec.agent_type === 'ownership' && rec.recommendation?.recommendedUserId) {
        await IncidentService.assignTechnician(
          req.user,
          rec.incident_id,
          rec.recommendation.recommendedUserId,
          `Approved AI Recommendation (Confidence: ${Math.round(rec.confidence * 100)}%)`,
          'AI_RECOMMENDED'
        );
      }

      await AuditRepository.createLog({
        actor_id: req.user.id,
        actor_type: 'USER',
        action: 'APPROVE_AI_RECOMMENDATION',
        entity_type: 'AI_RECOMMENDATION',
        entity_id: id,
        old_value: { status: 'PENDING' },
        new_value: { status: 'APPROVED' },
      });

      res.json({ success: true, data: rec, message: 'AI recommendation approved and executed' });
    } catch (err) {
      next(err);
    }
  }

  static async rejectRecommendation(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { id } = req.params;
      const rec = await AIRepository.updateRecommendationStatus(id, 'REJECTED', req.user.id);

      await AuditRepository.createLog({
        actor_id: req.user.id,
        actor_type: 'USER',
        action: 'REJECT_AI_RECOMMENDATION',
        entity_type: 'AI_RECOMMENDATION',
        entity_id: id,
        old_value: { status: 'PENDING' },
        new_value: { status: 'REJECTED' },
      });

      res.json({ success: true, data: rec, message: 'AI recommendation rejected' });
    } catch (err) {
      next(err);
    }
  }

  static async getActions(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const actions = await AIRepository.findAllActions();
      res.json({ success: true, data: actions, message: 'AI actions retrieved' });
    } catch (err) {
      next(err);
    }
  }
}
