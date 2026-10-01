import { IncidentRepository } from '../../repositories/incident.repository';
import { UserRepository } from '../../repositories/user.repository';
import { TeamRepository } from '../../repositories/team.repository';
import { SlaRepository } from '../../repositories/sla.repository';

export class AgentContextBuilder {
  static async buildIncidentContext(incidentId: string) {
    const incident = await IncidentRepository.findById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const assignments = await IncidentRepository.getAssignments(incidentId);
    const updates = await IncidentRepository.getUpdates(incidentId);
    const technicians = await UserRepository.findTechnicians();
    const teams = await TeamRepository.findAll();
    const slaPolicy = await SlaRepository.findByPriorityAndSeverity(incident.priority, incident.severity);

    // Calculate active technician workloads
    const allIncidents = await IncidentRepository.findAll();
    const technicianWorkload = technicians.map((t) => {
      const activeCount = allIncidents.filter(
        (i) => i.assigned_to === t.id && i.status !== 'CLOSED' && i.status !== 'RESOLVED'
      ).length;
      return {
        id: t.id,
        name: t.name,
        team_id: t.team_id,
        role: t.role,
        skills: t.skills || [],
        activeIncidentCount: activeCount,
        isOverloaded: activeCount >= 3,
      };
    });

    return {
      incident: {
        id: incident.id,
        incident_number: incident.incident_number,
        title: incident.title,
        description: incident.description,
        original_language: incident.original_language,
        category: incident.category,
        severity: incident.severity,
        priority: incident.priority,
        status: incident.status,
        location: incident.location,
        affected_service: incident.affected_service,
        created_at: incident.created_at,
        sla_deadline: incident.sla_deadline,
        assigned_to: incident.assigned_to,
        assigned_team: incident.assigned_team,
      },
      assignmentsHistory: assignments.map((a) => ({
        assigned_to_name: a.assigned_to_name,
        assigned_by_name: a.assigned_by_name,
        reason: a.assignment_reason,
        timestamp: a.created_at,
      })),
      recentUpdates: updates.slice(-5).map((u) => ({
        user: u.user_name,
        type: u.update_type,
        message: u.message,
        timestamp: u.created_at,
      })),
      availableTechnicians: technicianWorkload,
      teams: teams.map((t) => ({ id: t.id, name: t.name })),
      slaPolicy,
    };
  }
}
