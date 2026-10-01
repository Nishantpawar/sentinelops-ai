import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Teams
  const maintenanceTeam = {
    id: 'f1b9b942-019d-4c3e-89a1-011111111111',
    name: 'Industrial Maintenance',
    description: 'Equipment diagnostics, mechanical and electrical repair',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const itOpsTeam = {
    id: 'f1b9b942-019d-4c3e-89a1-022222222222',
    name: 'IT & Infrastructure Ops',
    description: 'Network operations, servers, cloud and security',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.tables.teams = [maintenanceTeam, itOpsTeam];

  // 2. Skills
  const skill1 = { id: uuidv4(), name: 'Electrical Diagnostics', description: 'Power systems & PLCs', created_at: new Date().toISOString() };
  const skill2 = { id: uuidv4(), name: 'Mechanical Repair', description: 'Gearboxes & heavy machinery', created_at: new Date().toISOString() };
  const skill3 = { id: uuidv4(), name: 'Network Infrastructure', description: 'Switches, routers & firewalls', created_at: new Date().toISOString() };

  db.tables.skills = [skill1, skill2, skill3];

  // 3. Users
  const adminUser = {
    id: 'e1000000-0000-0000-0000-000000000001',
    name: 'System Admin',
    email: 'admin@example.com',
    password_hash: passwordHash,
    role: 'admin',
    preferred_language: 'en',
    team_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const managerUser = {
    id: 'e1000000-0000-0000-0000-000000000002',
    name: 'Eleanor Vance (Ops Manager)',
    email: 'manager@example.com',
    password_hash: passwordHash,
    role: 'manager',
    preferred_language: 'en',
    team_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const supervisorUser = {
    id: 'e1000000-0000-0000-0000-000000000003',
    name: 'Rajesh Sharma (Plant Supervisor)',
    email: 'supervisor@example.com',
    password_hash: passwordHash,
    role: 'supervisor',
    preferred_language: 'hi',
    team_id: maintenanceTeam.id,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const operatorUser = {
    id: 'e1000000-0000-0000-0000-000000000004',
    name: 'Aarav Patel (Assembly Line Operator)',
    email: 'operator@example.com',
    password_hash: passwordHash,
    role: 'operator',
    preferred_language: 'mr',
    team_id: maintenanceTeam.id,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tech1User = {
    id: 'e1000000-0000-0000-0000-000000000005',
    name: 'Alex Rivera (Sr Electrical Technician)',
    email: 'technician1@example.com',
    password_hash: passwordHash,
    role: 'technician',
    preferred_language: 'en',
    team_id: maintenanceTeam.id,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const tech2User = {
    id: 'e1000000-0000-0000-0000-000000000006',
    name: 'Priya Kulkarni (IT Infrastructure Tech)',
    email: 'technician2@example.com',
    password_hash: passwordHash,
    role: 'technician',
    preferred_language: 'mr',
    team_id: itOpsTeam.id,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.tables.users = [adminUser, managerUser, supervisorUser, operatorUser, tech1User, tech2User];

  // User Skills
  db.tables.user_skills = [
    { user_id: tech1User.id, skill_id: skill1.id, proficiency_level: 5 },
    { user_id: tech1User.id, skill_id: skill2.id, proficiency_level: 4 },
    { user_id: tech2User.id, skill_id: skill3.id, proficiency_level: 5 },
  ];

  // 4. SLA Policies
  db.tables.sla_policies = [
    {
      id: uuidv4(),
      name: 'Critical Infrastructure Emergency',
      priority: 'critical',
      severity: 'critical',
      response_minutes: 10,
      resolution_minutes: 60,
      escalation_minutes: 15,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'High Severity Business Impact',
      priority: 'high',
      severity: 'high',
      response_minutes: 30,
      resolution_minutes: 240,
      escalation_minutes: 45,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Standard Operational Issue',
      priority: 'medium',
      severity: 'medium',
      response_minutes: 120,
      resolution_minutes: 720,
      escalation_minutes: 180,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  // 5. Realistic Seed Incidents
  const inc1 = {
    id: 'c1000000-0000-0000-0000-000000000001',
    incident_number: 'INC-1001',
    title: 'Production Line 2 Assembly Motor Tripped',
    description: 'मशीन अचानक बंद झाली आहे आणि उत्पादन पूर्णपणे थांबले आहे. Conveyor belt control panel showing error E-402.',
    original_language: 'mr',
    category: 'equipment_failure',
    severity: 'critical',
    priority: 'critical',
    status: 'OPEN',
    location: 'Factory Floor Sector B, Line 2',
    affected_service: 'Main Conveyor Assembly',
    created_by: operatorUser.id,
    assigned_to: null,
    assigned_team: maintenanceTeam.id,
    sla_deadline: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    sla_response_deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  };

  const inc2 = {
    id: 'c1000000-0000-0000-0000-000000000002',
    incident_number: 'INC-1002',
    title: 'Plant Core Switch High Packet Drop',
    description: 'Core switch SW-OPS-01 experiencing 45% packet loss causing telemetry delay across monitoring dashboards.',
    original_language: 'en',
    category: 'network_issue',
    severity: 'high',
    priority: 'high',
    status: 'ASSIGNED',
    location: 'Server Room Rack 04',
    affected_service: 'Plant Network Telemetry',
    created_by: operatorUser.id,
    assigned_to: tech2User.id,
    assigned_team: itOpsTeam.id,
    sla_deadline: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    sla_response_deadline: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  };

  db.tables.incidents = [inc1, inc2];

  // 6. Sample Audit Logs
  db.tables.audit_logs = [
    {
      id: uuidv4(),
      actor_id: operatorUser.id,
      actor_type: 'USER',
      action: 'CREATE_INCIDENT',
      entity_type: 'INCIDENT',
      entity_id: inc1.id,
      old_value: null,
      new_value: { title: inc1.title, priority: inc1.priority },
      created_at: inc1.created_at,
    },
    {
      id: uuidv4(),
      actor_id: undefined,
      actor_type: 'AI_AGENT',
      action: 'AI_CLASSIFIED_INCIDENT',
      entity_type: 'INCIDENT',
      entity_id: inc1.id,
      old_value: null,
      new_value: { category: 'equipment_failure', severity: 'critical', language: 'mr' },
      created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    },
  ];

  console.log('✅ Seed data successfully initialized into database memory store.');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
