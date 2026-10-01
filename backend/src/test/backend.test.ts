import { describe, it, expect, beforeAll } from 'vitest';
import { PolicyEngine } from '../services/policy/policy.engine';
import { IncidentRepository } from '../repositories/incident.repository';
import { seedDatabase } from '../seed/seed';
import { Incident } from '../types';

describe('SentinelOps AI Backend Architecture Tests', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  it('PolicyEngine should enforce allowlist & human approval for high-risk actions', () => {
    const safeCheck = PolicyEngine.evaluateAiAction('NOTIFY_SUPERVISOR');
    expect(safeCheck.allowed).toBe(true);

    const highRiskCheck = PolicyEngine.evaluateAiAction('REASSIGN_TECHNICIAN');
    expect(highRiskCheck.requiresHumanApproval).toBe(true);
  });

  it('IncidentRepository should calculate correct SLA states', () => {
    const dummyIncident: Incident = {
      id: 'test-id',
      incident_number: 'INC-TEST',
      title: 'Test Incident',
      description: 'Test',
      original_language: 'en',
      category: 'equipment_failure',
      severity: 'critical',
      priority: 'critical',
      status: 'OPEN',
      location: 'Floor 1',
      affected_service: 'Test Service',
      created_by: 'user-id',
      sla_deadline: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min past deadline
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const state = IncidentRepository.computeSlaState(dummyIncident);
    expect(state).toBe('Breached');
  });

  it('IncidentRepository should retrieve seeded incidents', async () => {
    const incidents = await IncidentRepository.findAll();
    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents[0].created_by_name).toBeDefined();
  });
});
