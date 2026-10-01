import { api } from './api';
import { User } from '../types';

export const adminService = {
  async getUsers(): Promise<User[]> {
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
