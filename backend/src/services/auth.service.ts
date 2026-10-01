import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { config } from '../config/env';
import { User, UserRole, PreferredLanguage } from '../types';

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  static async register(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    preferred_language?: PreferredLanguage;
    team_id?: string;
  }): Promise<{ user: User; token: string }> {
    const existing = await UserRepository.findByEmail(userData.email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    const user = await UserRepository.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password_hash,
      role: userData.role,
      preferred_language: userData.preferred_language || 'en',
      team_id: userData.team_id || null,
    });

    const token = this.generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser as User, token };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    await UserRepository.update(user.id, { last_login_at: new Date().toISOString() });

    const token = this.generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser as User, token };
  }
}
