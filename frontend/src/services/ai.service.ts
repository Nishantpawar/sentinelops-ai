import { api } from './api';
import { AIRecommendation, AIAction } from '../types';

export const aiService = {
  async analyzeIncident(text: string, title?: string) {
    const res: any = await api.post('/ai/analyze-incident', { text, title });
    return res.data;
  },

  async recommendOwner(incidentId: string) {
    const res: any = await api.post('/ai/recommend-assignment', { incidentId });
    return res.data;
  },

  async whyAtRisk(incidentId: string) {
    const res: any = await api.post('/ai/why-at-risk', { incidentId });
    return res.data;
  },

  async getRecommendations(incidentId: string): Promise<AIRecommendation[]> {
    const res: any = await api.get(`/ai/recommendations/${incidentId}`);
    return res.data;
  },

  async approveRecommendation(recommendationId: string) {
    const res: any = await api.post(`/ai/recommendations/${recommendationId}/approve`);
    return res.data;
  },

  async rejectRecommendation(recommendationId: string) {
    const res: any = await api.post(`/ai/recommendations/${recommendationId}/reject`);
    return res.data;
  },

  async getActions(): Promise<AIAction[]> {
    const res: any = await api.get('/ai/actions');
    return res.data;
  },
};
