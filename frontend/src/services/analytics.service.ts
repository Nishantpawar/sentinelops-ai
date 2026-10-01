import { api } from './api';
import { AuditLog } from '../types';

export const analyticsService = {
  async getOverview() {
    const res: any = await api.get('/analytics/overview');
    return res.data;
  },

  async getSla() {
    const res: any = await api.get('/analytics/sla');
    return res.data;
  },

  async getWorkload() {
    const res: any = await api.get('/analytics/workload');
    return res.data;
  },

  async getAiMetrics() {
    const res: any = await api.get('/analytics/ai');
    return res.data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res: any = await api.get('/analytics/audit');
    return res.data;
  },
};
