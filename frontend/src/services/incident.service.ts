import { api } from './api';
import { Incident, IncidentAssignment, IncidentUpdate, DirectMessage } from '../types';

export const incidentService = {
  async getAll(): Promise<Incident[]> {
    const res: any = await api.get('/incidents');
    return res.data;
  },

  async getById(id: string): Promise<Incident> {
    const res: any = await api.get(`/incidents/${id}`);
    return res.data;
  },

  async create(data: {
    title: string;
    description: string;
    location: string;
    category?: string;
    severity?: string;
    priority?: string;
    affected_service?: string;
    original_language?: string;
  }): Promise<Incident> {
    const res: any = await api.post('/incidents', data);
    return res.data;
  },

  async assignTechnician(incidentId: string, technicianId: string, reason: string): Promise<Incident> {
    const res: any = await api.post(`/incidents/${incidentId}/assign`, { technicianId, reason });
    return res.data;
  },

  async updateStatus(incidentId: string, status: string, message?: string): Promise<Incident> {
    const res: any = await api.patch(`/incidents/${incidentId}/status`, { status, message });
    return res.data;
  },

  async getAssignments(incidentId: string): Promise<IncidentAssignment[]> {
    const res: any = await api.get(`/incidents/${incidentId}/assignments`);
    return res.data;
  },

  async getUpdates(incidentId: string): Promise<IncidentUpdate[]> {
    const res: any = await api.get(`/incidents/${incidentId}/updates`);
    return res.data;
  },

  async postUpdate(incidentId: string, message: string, update_type = 'PROGRESS'): Promise<IncidentUpdate> {
    const res: any = await api.post(`/incidents/${incidentId}/updates`, { message, update_type });
    return res.data;
  },

  async getMessages(incidentId: string): Promise<DirectMessage[]> {
    const res: any = await api.get(`/incidents/${incidentId}/messages`);
    return res.data;
  },

  async postMessage(incidentId: string, message: string, recipient_id?: string): Promise<DirectMessage> {
    const res: any = await api.post(`/incidents/${incidentId}/messages`, { message, recipient_id });
    return res.data;
  },
};
