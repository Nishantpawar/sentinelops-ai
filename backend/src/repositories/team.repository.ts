import { db } from '../config/database';
import { Team, Skill, SlaPolicy } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TeamRepository {
  static async findAll(): Promise<Team[]> {
    return db.tables.teams;
  }

  static async findById(id: string): Promise<Team | null> {
    return db.tables.teams.find((t) => t.id === id) || null;
  }

  static async create(name: string, description: string): Promise<Team> {
    const team: Team = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.tables.teams.push(team);
    return team;
  }
}

export class SkillRepository {
  static async findAll(): Promise<Skill[]> {
    return db.tables.skills;
  }

  static async create(name: string, description: string): Promise<Skill> {
    const skill: Skill = {
      id: uuidv4(),
      name,
      description,
      created_at: new Date().toISOString(),
    };
    db.tables.skills.push(skill);
    return skill;
  }
}

export class SlaRepository {
  static async findAll(): Promise<SlaPolicy[]> {
    return db.tables.sla_policies;
  }

  static async findByPriorityAndSeverity(priority: string, severity: string): Promise<SlaPolicy | null> {
    const policy = db.tables.sla_policies.find(
      (p) => p.priority === priority && p.severity === severity && p.is_active
    );
    if (policy) return policy;
    // Fallback match by priority only
    const fallback = db.tables.sla_policies.find((p) => p.priority === priority && p.is_active);
    return fallback || db.tables.sla_policies[0] || null;
  }

  static async update(id: string, updates: Partial<SlaPolicy>): Promise<SlaPolicy | null> {
    const index = db.tables.sla_policies.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.tables.sla_policies[index] = {
      ...db.tables.sla_policies[index],
      ...updates,
    };
    return db.tables.sla_policies[index];
  }
}
