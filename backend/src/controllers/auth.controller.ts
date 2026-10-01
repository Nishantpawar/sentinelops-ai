import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { name, email, password, role, preferred_language, team_id } = req.body;
      const result = await AuthService.register({ name, email, password, role, preferred_language, team_id });
      res.status(201).json({ success: true, data: result, message: 'Registration successful' });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result, message: 'Login successful' });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    const user = req.user;
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, data: safeUser, message: 'User profile retrieved' });
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, message: 'Logout successful' });
  }
}
