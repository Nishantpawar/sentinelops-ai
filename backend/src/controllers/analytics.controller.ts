import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IncidentRepository } from '../repositories/incident.repository';
import { UserRepository } from '../repositories/user.repository';
import { AIRepository, AuditRepository } from '../repositories/ai.repository';
import { db } from '../config/database';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const incidents = await IncidentRepository.findAll();
      const total = incidents.length;
      const unassigned = incidents.filter((i) => !i.assigned_to && i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
      const critical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
      const inProgress = incidents.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACCEPTED').length;
      const awaitingReview = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'REVIEW').length;
      const escalated = incidents.filter((i) => i.status === 'ESCALATED').length;
      const slaAtRisk = incidents.filter((i) => i.sla_state === 'At Risk' || i.sla_state === 'Breached').length;

      const categoryDistribution: Record<string, number> = {};
      incidents.forEach((inc) => {
        categoryDistribution[inc.category] = (categoryDistribution[inc.category] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          kpi: {
            total,
            unassigned,
            critical,
            inProgress,
            awaitingReview,
            escalated,
            slaAtRisk,
            ownershipGapPercentage: total > 0 ? Math.round((unassigned / total) * 100) : 0,
          },
          categoryDistribution: Object.entries(categoryDistribution).map(([name, count]) => ({ name, count })),
        },
        message: 'Analytics overview retrieved',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSlaMetrics(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const incidents = await IncidentRepository.findAll();
      const healthy = incidents.filter((i) => i.sla_state === 'Healthy').length;
      const atRisk = incidents.filter((i) => i.sla_state === 'At Risk').length;
      const breached = incidents.filter((i) => i.sla_state === 'Breached').length;

      res.json({
        success: true,
        data: {
          healthy,
          atRisk,
          breached,
          complianceRate: incidents.length > 0 ? Math.round((healthy / incidents.length) * 100) : 100,
        },
        message: 'SLA metrics retrieved',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getWorkloadMetrics(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const technicians = await UserRepository.findTechnicians();
      const incidents = await IncidentRepository.findAll();

      const workload = technicians.map((t) => {
        const assigned = incidents.filter((i) => i.assigned_to === t.id && i.status !== 'CLOSED');
        return {
          id: t.id,
          name: t.name,
          activeCount: assigned.length,
          inProgressCount: assigned.filter((i) => i.status === 'IN_PROGRESS').length,
          resolvedCount: incidents.filter((i) => i.assigned_to === t.id && (i.status === 'RESOLVED' || i.status === 'CLOSED')).length,
        };
      });

      res.json({ success: true, data: workload, message: 'Technician workload metrics retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async getAiMetrics(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const actions = await AIRepository.findAllActions();
      const recs = db.tables.ai_recommendations;

      const totalRecommendations = recs.length;
      const approvedCount = recs.filter((r) => r.status === 'APPROVED').length;
      const rejectedCount = recs.filter((r) => r.status === 'REJECTED').length;
      const approvalRate = totalRecommendations > 0 ? Math.round((approvedCount / totalRecommendations) * 100) : 100;

      res.json({
        success: true,
        data: {
          totalActions: actions.length,
          totalRecommendations,
          approvedCount,
          rejectedCount,
          approvalRate,
        },
        message: 'AI performance metrics retrieved',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const logs = await AuditRepository.findAll();
      res.json({ success: true, data: logs, message: 'Audit logs retrieved' });
    } catch (err) {
      next(err);
    }
  }
}
