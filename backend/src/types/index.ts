export type UserRole = 'operator' | 'supervisor' | 'technician' | 'manager' | 'admin';
export type PreferredLanguage = 'en' | 'hi' | 'mr';

export type IncidentCategory =
  | 'equipment_failure'
  | 'network_issue'
  | 'software_issue'
  | 'electrical_issue'
  | 'security_alert'
  | 'facility_issue'
  | 'production_issue'
  | 'safety_issue'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REVIEW'
  | 'CLOSED'
  | 'REJECTED';

export type SlaState = 'Healthy' | 'At Risk' | 'Breached';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: UserRole;
  preferred_language: PreferredLanguage;
  team_id?: string | null;
  team_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  skills?: string[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface UserSkill {
  user_id: string;
  skill_id: string;
  proficiency_level: number;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  original_language: PreferredLanguage;
  category: IncidentCategory;
  severity: SeverityLevel;
  priority: PriorityLevel;
  status: IncidentStatus;
  location: string;
  affected_service: string;
  created_by: string;
  created_by_name?: string;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  assigned_team?: string | null;
  assigned_team_name?: string | null;
  sla_deadline?: string | null;
  sla_response_deadline?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  sla_state?: SlaState;
  resolution_notes?: string | null;
}

export interface IncidentAssignment {
  id: string;
  incident_id: string;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_by: string;
  assigned_by_name?: string;
  assignment_reason: string;
  assignment_type: 'MANUAL' | 'AI_RECOMMENDED' | 'AUTO';
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  user_id: string;
  user_name?: string;
  user_role?: UserRole;
  update_type: 'NOTE' | 'PROGRESS' | 'STATUS_CHANGE' | 'ESCALATION' | 'RESOLUTION_ATTEMPT';
  message: string;
  language: PreferredLanguage;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_name?: string;
  incident_id?: string | null;
  channel: 'in_app' | 'email' | 'internal_msg';
  type: 'ASSIGNMENT' | 'SLA_WARNING' | 'ESCALATION' | 'STATUS_UPDATE' | 'REVIEW_REQUIRED';
  subject: string;
  message: string;
  language: PreferredLanguage;
  status: 'queued' | 'sent' | 'failed' | 'read';
  sent_at?: string | null;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  incident_id: string;
  agent_type: 'analysis' | 'ownership' | 'communication' | 'escalation' | 'resolution';
  recommendation_type: string;
  input_context: Record<string, any>;
  recommendation: Record<string, any>;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_EXECUTED';
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface AIAction {
  id: string;
  incident_id: string;
  agent_type: string;
  action_type: string;
  action_payload: Record<string, any>;
  execution_status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
  executed_by: string;
  execution_result?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name?: string;
  actor_type: 'USER' | 'AI_AGENT' | 'SYSTEM';
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  created_at: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  priority: PriorityLevel;
  severity: SeverityLevel;
  response_minutes: number;
  resolution_minutes: number;
  escalation_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  incident_id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id?: string | null;
  recipient_name?: string | null;
  message: string;
  language: PreferredLanguage;
  created_at: string;
}

export interface StructuredAiAnalysis {
  language: PreferredLanguage;
  category: IncidentCategory;
  severity: SeverityLevel;
  urgency: PriorityLevel;
  summary: string;
  requiredSkills: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  recommendedTeam: string | null;
  recommendedAction: string;
  escalationRequired: boolean;
  communicationRequired: boolean;
  confidence: number;
  decisionFactors: string[];
}

export interface StructuredAiOwnershipRecommendation {
  recommendedUserId: string;
  recommendedUserName: string;
  recommendedTeamId: string;
  recommendedTeamName: string;
  matchScore: number;
  confidence: number;
  reasoning: string[];
  workloadStatus: string;
  skillMatchCount: number;
}

export interface StructuredAiCommunicationDecision {
  shouldNotify: boolean;
  urgency: PriorityLevel;
  recipients: Array<{ userId: string; role: UserRole; name: string }>;
  channel: 'in_app' | 'email' | 'internal_msg';
  language: PreferredLanguage;
  subject: string;
  message: string;
  reason: string;
}
