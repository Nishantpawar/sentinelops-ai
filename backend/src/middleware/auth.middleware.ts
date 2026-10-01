import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await UserRepository.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User account inactive or removed' } });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Token invalid or expired' } });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Access forbidden for role ${req.user.role}. Required: ${roles.join(', ')}` },
      });
    }

    next();
  };
};
