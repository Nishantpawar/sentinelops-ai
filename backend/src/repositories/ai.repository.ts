import { db } from '../config/database';
import { AIRecommendation, AIAction, AuditLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AIRepository {
  static async saveRecommendation(
    recData: Omit<AIRecommendation, 'id' | 'created_at'>
  ): Promise<AIRecommendation> {
    const rec: AIRecommendation = {
      id: uuidv4(),
      ...recData,
      created_at: new Date().toISOString(),
    };
    db.tables.ai_recommendations.push(rec);
    return rec;
  }

  static async findRecommendationsByIncident(incidentId: string): Promise<AIRecommendation[]> {
    return db.tables.ai_recommendations
      .filter((r) => r.incident_id === incidentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async updateRecommendationStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    approvedBy: string
  ): Promise<AIRecommendation | null> {
    const rec = db.tables.ai_recommendations.find((r) => r.id === id);
    if (!rec) return null;
    rec.status = status;
    rec.approved_by = approvedBy;
    rec.approved_at = new Date().toISOString();
    return rec;
  }

  static async saveAction(actionData: Omit<AIAction, 'id' | 'created_at'>): Promise<AIAction> {
    const act: AIAction = {
      id: uuidv4(),
      ...actionData,
      created_at: new Date().toISOString(),
    };
    db.tables.ai_actions.push(act);
    return act;
  }

  static async findActionsByIncident(incidentId: string): Promise<AIAction[]> {
    return db.tables.ai_actions
      .filter((a) => a.incident_id === incidentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async findAllActions(): Promise<AIAction[]> {
    return db.tables.ai_actions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export class AuditRepository {
  static async createLog(logData: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const actor = logData.actor_id ? db.tables.users.find((u) => u.id === logData.actor_id) : null;
    const log: AuditLog = {
      id: uuidv4(),
      ...logData,
      actor_name: actor ? actor.name : logData.actor_type === 'AI_AGENT' ? 'SentinelOps AI' : 'System',
      created_at: new Date().toISOString(),
    };
    db.tables.audit_logs.push(log);
    return log;
  }

  static async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return db.tables.audit_logs
      .filter((l) => l.entity_type === entityType && l.entity_id === entityId)
      .map((l) => {
        const actor = l.actor_id ? db.tables.users.find((u) => u.id === l.actor_id) : null;
        return {
          ...l,
          actor_name: actor ? actor.name : l.actor_type === 'AI_AGENT' ? 'SentinelOps AI' : 'System',
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  static async findAll(): Promise<AuditLog[]> {
    return db.tables.audit_logs
      .map((l) => {
        const actor = l.actor_id ? db.tables.users.find((u) => u.id === l.actor_id) : null;
        return {
          ...l,
          actor_name: actor ? actor.name : l.actor_type === 'AI_AGENT' ? 'SentinelOps AI' : 'System',
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
