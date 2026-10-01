import { IncidentRepository } from '../repositories/incident.repository';
import { SlaRepository } from '../repositories/sla.repository';
import { UserRepository } from '../repositories/user.repository';
import { AuditRepository } from '../repositories/ai.repository';
import { AgentOrchestrator } from './agents/agent.orchestrator';
import { Incident, IncidentStatus, User } from '../types';

export class IncidentService {
  static async createIncident(
    creator: User,
    data: {
      title: string;
      description: string;
      location: string;
      category?: string;
      severity?: string;
      priority?: string;
      affected_service?: string;
      original_language?: 'en' | 'hi' | 'mr';
    }
  ): Promise<Incident> {
    const category = (data.category as any) || 'other';
    const severity = (data.severity as any) || 'medium';
    const priority = (data.priority as any) || severity;

    // Calculate SLA deadline from SLA Policy Table
    const slaPolicy = await SlaRepository.findByPriorityAndSeverity(priority, severity);
    const resolutionMinutes = slaPolicy ? slaPolicy.resolution_minutes : 240; // default 4 hours
    const responseMinutes = slaPolicy ? slaPolicy.response_minutes : 30;

    const slaDeadline = new Date(Date.now() + resolutionMinutes * 60 * 1000).toISOString();
    const slaResponseDeadline = new Date(Date.now() + responseMinutes * 60 * 1000).toISOString();

    const incident = await IncidentRepository.create({
      title: data.title,
      description: data.description,
      location: data.location,
      category,
      severity,
      priority,
      status: 'OPEN',
      affected_service: data.affected_service || 'Core Infrastructure',
      original_language: data.original_language || 'en',
      created_by: creator.id,
      sla_deadline: slaDeadline,
      sla_response_deadline: slaResponseDeadline,
    });

    // Record Audit Log
    await AuditRepository.createLog({
      actor_id: creator.id,
      actor_type: 'USER',
      action: 'CREATE_INCIDENT',
      entity_type: 'INCIDENT',
      entity_id: incident.id,
      old_value: null,
      new_value: incident as any,
    });

    // Trigger AI Agent Pipeline asynchronously (never blocks response)
    setImmediate(() => {
      AgentOrchestrator.onIncidentCreated(incident.id).catch((err) => {
        console.error('Agent Orchestrator background process error:', err);
      });
    });

    return incident;
  }

  static async assignTechnician(
    assigner: User,
    incidentId: string,
    technicianId: string,
    reason: string,
    assignmentType: 'MANUAL' | 'AI_RECOMMENDED' | 'AUTO' = 'MANUAL'
  ): Promise<Incident> {
    const incident = await IncidentRepository.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const tech = await UserRepository.findById(technicianId);
    if (!tech || tech.role !== 'technician') {
      throw new Error('Target user is not a valid technician');
    }

    const updated = await IncidentRepository.update(incidentId, {
      assigned_to: technicianId,
      assigned_team: tech.team_id || incident.assigned_team,
      status: 'ASSIGNED',
    });

    await IncidentRepository.addAssignment({
      incident_id: incidentId,
      assigned_to: technicianId,
      assigned_by: assigner.id,
      assignment_reason: reason,
      assignment_type: assignmentType,
      started_at: new Date().toISOString(),
    });

    await IncidentRepository.addUpdate({
      incident_id: incidentId,
      user_id: assigner.id,
      update_type: 'STATUS_CHANGE',
      message: `Assigned technician ${tech.name}. Reason: ${reason}`,
      language: assigner.preferred_language || 'en',
    });

    await AuditRepository.createLog({
      actor_id: assigner.id,
      actor_type: 'USER',
      action: 'ASSIGN_TECHNICIAN',
      entity_type: 'INCIDENT',
      entity_id: incidentId,
      old_value: { assigned_to: incident.assigned_to, status: incident.status },
      new_value: { assigned_to: technicianId, status: 'ASSIGNED', assignmentType },
    });

    return updated!;
  }

  static async updateStatus(
    user: User,
    incidentId: string,
    newStatus: IncidentStatus,
    message: string
  ): Promise<Incident> {
    const incident = await IncidentRepository.findById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const updates: Partial<Incident> = { status: newStatus };
    if (newStatus === 'RESOLVED') {
      updates.resolved_at = new Date().toISOString();
      updates.resolution_notes = message;
    } else if (newStatus === 'CLOSED') {
      updates.closed_at = new Date().toISOString();
    }

    const updated = await IncidentRepository.update(incidentId, updates);

    await IncidentRepository.addUpdate({
      incident_id: incidentId,
      user_id: user.id,
      update_type: newStatus === 'RESOLVED' ? 'RESOLUTION_ATTEMPT' : 'STATUS_CHANGE',
      message,
      language: user.preferred_language || 'en',
    });

    await AuditRepository.createLog({
      actor_id: user.id,
      actor_type: 'USER',
      action: `STATUS_CHANGE_${newStatus}`,
      entity_type: 'INCIDENT',
      entity_id: incidentId,
      old_value: { status: incident.status },
      new_value: { status: newStatus, message },
    });

    if (newStatus === 'RESOLVED') {
      setImmediate(() => {
        AgentOrchestrator.handleEvent('RESOLVED', incidentId).catch(console.error);
      });
    }

    return updated!;
  }
}
