import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { TeamRepository } from '../repositories/team.repository';
import { SlaRepository } from '../repositories/sla.repository';

export class AdminController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const users = await UserRepository.findAll();
      const safeUsers = users.map(({ password_hash, ...u }) => u);
      res.json({ success: true, data: safeUsers, message: 'Users retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async getTeams(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const teams = await TeamRepository.findAll();
      res.json({ success: true, data: teams, message: 'Teams retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async getSlaPolicies(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const policies = await SlaRepository.findAll();
      res.json({ success: true, data: policies, message: 'SLA policies retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async updateSlaPolicy(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const policy = await SlaRepository.update(req.params.id, req.body);
      res.json({ success: true, data: policy, message: 'SLA policy updated' });
    } catch (err) {
      next(err);
    }
  }
}
