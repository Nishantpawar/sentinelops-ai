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
  role: UserRole;
  preferred_language: PreferredLanguage;
  team_id?: string | null;
  team_name?: string | null;
  is_active: boolean;
  created_at: string;
  skills?: string[];
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
  incident_id?: string | null;
  channel: 'in_app' | 'email' | 'internal_msg';
  type: string;
  subject: string;
  message: string;
  language: PreferredLanguage;
  status: 'queued' | 'sent' | 'failed' | 'read';
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  incident_id: string;
  agent_type: 'analysis' | 'ownership' | 'communication' | 'escalation' | 'resolution';
  recommendation_type: string;
  input_context: any;
  recommendation: any;
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
  action_payload: any;
  execution_status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
  executed_by: string;
  execution_result?: any;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  actor_type: 'USER' | 'AI_AGENT' | 'SYSTEM';
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
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
