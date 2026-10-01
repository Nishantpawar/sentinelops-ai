import { db } from '../config/database';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const user = db.tables.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const user = db.tables.users.find((u) => u.id === id);
    return user || null;
  }

  static async findAll(): Promise<User[]> {
    return db.tables.users.map((u) => {
      const team = db.tables.teams.find((t) => t.id === u.team_id);
      const userSkills = db.tables.user_skills
        .filter((us) => us.user_id === u.id)
        .map((us) => {
          const skill = db.tables.skills.find((s) => s.id === us.skill_id);
          return skill ? skill.name : null;
        })
        .filter(Boolean);

      return {
        ...u,
        team_name: team ? team.name : null,
        skills: userSkills,
      };
    });
  }

  static async findByRole(role: string): Promise<User[]> {
    const users = await this.findAll();
    return users.filter((u) => u.role === role);
  }

  static async findTechnicians(): Promise<User[]> {
    return this.findByRole('technician');
  }

  static async create(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: userData.id || uuidv4(),
      name: userData.name || '',
      email: userData.email || '',
      password_hash: userData.password_hash || '',
      role: userData.role || 'operator',
      preferred_language: userData.preferred_language || 'en',
      team_id: userData.team_id || null,
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
    };
    db.tables.users.push(newUser);
    return newUser;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = db.tables.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    db.tables.users[index] = {
      ...db.tables.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return db.tables.users[index];
  }
}
