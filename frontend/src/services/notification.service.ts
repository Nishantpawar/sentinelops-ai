import { api } from './api';
import { Notification, AuditLog } from '../types';

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const res: any = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res: any = await api.post(`/notifications/${id}/read`);
    return res.data;
  },
};

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

export const adminService = {
  async getUsers() {
    const res: any = await api.get('/admin/users');
    return res.data;
  },
  async getTeams() {
    const res: any = await api.get('/admin/teams');
    return res.data;
  },
  async getSla() {
    const res: any = await api.get('/admin/sla');
    return res.data;
  },
};
