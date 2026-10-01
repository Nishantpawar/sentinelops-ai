import { db } from '../config/database';
import { Incident, IncidentAssignment, IncidentUpdate, DirectMessage, SlaState } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class IncidentRepository {
  static computeSlaState(incident: Incident): SlaState {
    if (incident.status === 'CLOSED' || incident.status === 'RESOLVED') {
      return 'Healthy';
    }
    if (!incident.sla_deadline) return 'Healthy';
    const now = new Date().getTime();
    const deadline = new Date(incident.sla_deadline).getTime();
    const timeDiffMinutes = (deadline - now) / (1000 * 60);

    if (timeDiffMinutes <= 0) {
      return 'Breached';
    } else if (timeDiffMinutes <= 30) {
      return 'At Risk';
    }
    return 'Healthy';
  }

  static enrichIncident(inc: Incident): Incident {
    const creator = db.tables.users.find((u) => u.id === inc.created_by);
    const assignee = db.tables.users.find((u) => u.id === inc.assigned_to);
    const team = db.tables.teams.find((t) => t.id === inc.assigned_team);

    const enriched = {
      ...inc,
      created_by_name: creator ? creator.name : 'Unknown User',
      assigned_to_name: assignee ? assignee.name : null,
      assigned_team_name: team ? team.name : null,
      sla_state: this.computeSlaState(inc),
    };
    return enriched;
  }

  static async findAll(): Promise<Incident[]> {
    return db.tables.incidents
      .map((inc) => this.enrichIncident(inc))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async findById(id: string): Promise<Incident | null> {
    const inc = db.tables.incidents.find((i) => i.id === id);
    if (!inc) return null;
    return this.enrichIncident(inc);
  }

  static async findByAssignee(userId: string): Promise<Incident[]> {
    const all = await this.findAll();
    return all.filter((i) => i.assigned_to === userId);
  }

  static async findByCreator(userId: string): Promise<Incident[]> {
    const all = await this.findAll();
    return all.filter((i) => i.created_by === userId);
  }

  static async findUnassigned(): Promise<Incident[]> {
    const all = await this.findAll();
    return all.filter((i) => !i.assigned_to && i.status !== 'CLOSED' && i.status !== 'RESOLVED');
  }

  static async create(incidentData: Partial<Incident>): Promise<Incident> {
    const count = db.tables.incidents.length + 1001;
    const newIncident: Incident = {
      id: incidentData.id || uuidv4(),
      incident_number: incidentData.incident_number || `INC-${count}`,
      title: incidentData.title || '',
      description: incidentData.description || '',
      original_language: incidentData.original_language || 'en',
      category: incidentData.category || 'other',
      severity: incidentData.severity || 'medium',
      priority: incidentData.priority || 'medium',
      status: incidentData.status || 'OPEN',
      location: incidentData.location || 'Default Operations',
      affected_service: incidentData.affected_service || 'General System',
      created_by: incidentData.created_by || '',
      assigned_to: incidentData.assigned_to || null,
      assigned_team: incidentData.assigned_team || null,
      sla_deadline: incidentData.sla_deadline || null,
      sla_response_deadline: incidentData.sla_response_deadline || null,
      resolved_at: null,
      closed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.tables.incidents.push(newIncident);
    return this.enrichIncident(newIncident);
  }

  static async update(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const index = db.tables.incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;

    db.tables.incidents[index] = {
      ...db.tables.incidents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.enrichIncident(db.tables.incidents[index]);
  }

  static async addAssignment(assignment: Omit<IncidentAssignment, 'id' | 'created_at'>): Promise<IncidentAssignment> {
    const newAssignment: IncidentAssignment = {
      id: uuidv4(),
      ...assignment,
      created_at: new Date().toISOString(),
    };
    db.tables.incident_assignments.push(newAssignment);
    return newAssignment;
  }

  static async getAssignments(incidentId: string): Promise<IncidentAssignment[]> {
    return db.tables.incident_assignments
      .filter((a) => a.incident_id === incidentId)
      .map((a) => {
        const assignee = db.tables.users.find((u) => u.id === a.assigned_to);
        const assigner = db.tables.users.find((u) => u.id === a.assigned_by);
        return {
          ...a,
          assigned_to_name: assignee ? assignee.name : 'Unknown User',
          assigned_by_name: assigner ? assigner.name : 'System',
        };
      });
  }

  static async addUpdate(updateData: Omit<IncidentUpdate, 'id' | 'created_at'>): Promise<IncidentUpdate> {
    const user = db.tables.users.find((u) => u.id === updateData.user_id);
    const newUpdate: IncidentUpdate = {
      id: uuidv4(),
      ...updateData,
      user_name: user ? user.name : 'System',
      user_role: user ? user.role : undefined,
      created_at: new Date().toISOString(),
    };
    db.tables.incident_updates.push(newUpdate);
    return newUpdate;
  }

  static async getUpdates(incidentId: string): Promise<IncidentUpdate[]> {
    return db.tables.incident_updates
      .filter((u) => u.incident_id === incidentId)
      .map((u) => {
        const user = db.tables.users.find((usr) => usr.id === u.user_id);
        return {
          ...u,
          user_name: user ? user.name : 'System',
          user_role: user ? user.role : undefined,
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  static async addMessage(messageData: Omit<DirectMessage, 'id' | 'created_at'>): Promise<DirectMessage> {
    const sender = db.tables.users.find((u) => u.id === messageData.sender_id);
    const recipient = messageData.recipient_id ? db.tables.users.find((u) => u.id === messageData.recipient_id) : null;
    const msg: DirectMessage = {
      id: uuidv4(),
      ...messageData,
      sender_name: sender ? sender.name : 'System',
      recipient_name: recipient ? recipient.name : undefined,
      created_at: new Date().toISOString(),
    };
    db.tables.messages.push(msg);
    return msg;
  }

  static async getMessages(incidentId: string): Promise<DirectMessage[]> {
    return db.tables.messages
      .filter((m) => m.incident_id === incidentId)
      .map((m) => {
        const sender = db.tables.users.find((u) => u.id === m.sender_id);
        const recipient = m.recipient_id ? db.tables.users.find((u) => u.id === m.recipient_id) : null;
        return {
          ...m,
          sender_name: sender ? sender.name : 'System',
          recipient_name: recipient ? recipient.name : undefined,
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}
