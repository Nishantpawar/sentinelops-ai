import { PolicyEngine } from '../services/policy/policy.engine';
import { IncidentRepository } from '../repositories/incident.repository';
import { seedDatabase } from '../seed/seed';
import { Incident } from '../types';

async function runTests() {
  console.log('🧪 Running SentinelOps AI Backend Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    await seedDatabase();
    console.log('✔ Database seeded for test execution.');
    passed++;
  } catch (e: any) {
    console.error('❌ Database seed failed:', e.message);
    failed++;
  }

  // Test 1: Policy Engine
  try {
    const safeCheck = PolicyEngine.evaluateAiAction('NOTIFY_SUPERVISOR');
    if (safeCheck.allowed !== true) throw new Error('NOTIFY_SUPERVISOR should be allowed');

    const highRiskCheck = PolicyEngine.evaluateAiAction('REASSIGN_TECHNICIAN');
    if (highRiskCheck.requiresHumanApproval !== true) throw new Error('REASSIGN_TECHNICIAN must require human approval');

    console.log('✔ PolicyEngine Allowlist & Autonomy checks passed.');
    passed++;
  } catch (e: any) {
    console.error('❌ PolicyEngine test failed:', e.message);
    failed++;
  }

  // Test 2: SLA Calculation
  try {
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
      sla_deadline: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const state = IncidentRepository.computeSlaState(dummyIncident);
    if (state !== 'Breached') throw new Error(`Expected Breached, got ${state}`);
    console.log('✔ IncidentRepository SLA status computation passed.');
    passed++;
  } catch (e: any) {
    console.error('❌ SLA test failed:', e.message);
    failed++;
  }

  // Test 3: Repository queries
  try {
    const incidents = await IncidentRepository.findAll();
    if (incidents.length === 0) throw new Error('No incidents found in database');
    if (!incidents[0].created_by_name) throw new Error('Enriched fields missing');
    console.log(`✔ Repository Query passed (${incidents.length} incidents enriched).`);
    passed++;
  } catch (e: any) {
    console.error('❌ Repository test failed:', e.message);
    failed++;
  }

  console.log(`\n📊 TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runTests();
