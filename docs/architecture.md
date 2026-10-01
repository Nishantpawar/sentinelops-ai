# SentinelOps AI Architecture Documentation

## 1. System Overview

**SentinelOps AI** is an Agentic AI-powered intelligent incident ownership and coordination platform designed to solve the critical enterprise operational pain point of **unclear ownership** during urgent incidents.

```
+-----------------------------------------------------------------------+
|                           React Frontend                              |
|   (Vite + Tailwind CSS + Lucide Icons + Recharts + React Router DOM)  |
+-----------------------------------------------------------------------+
                                  | HTTP / JSON REST APIs
                                  v
+-----------------------------------------------------------------------+
|                    Node.js Express Backend Service                    |
|                                                                       |
|  [ Auth & RBAC ]  [ Incident Engine ]  [ Agent Orchestrator ]         |
|        |                  |                     |                     |
|        v                  v                     v                     |
|  [ Policy Engine ] -> [ Action Executor ] -> [ Audit Logger ]         |
+-----------------------------------------------------------------------+
            |                                         |
            v                                         v
+-----------------------+                 +-----------------------+
| Supabase PostgreSQL / |                 |  Google Gemini API    |
|   Relational Store    |                 |   (Structured JSON)   |
+-----------------------+                 +-----------------------+
```

---

## 2. Core Architectural Components

### 2.1 Frontend (`frontend/`)
- **Framework**: React 18, Vite 5, TypeScript.
- **Styling**: Tailwind CSS with enterprise dark-mode glassmorphism and custom SLA countdown animations.
- **State & Context**:
  - `AuthContext`: Manages JWT tokens, user role state, and instant 1-click role-switching presets for demo testing.
  - `LanguageContext`: Provides seamless localization across English, Hindi, and Marathi.
  - `NotificationContext`: Real-time polling and unread count badge.
- **Role-Based Views**:
  - **Operator**: Incident creation, natural language description input, timeline tracking.
  - **Supervisor**: Operational queue, "OWNER REQUIRED" alert banner, AI recommendation review, 1-click technician assignment, SLA risk alerts.
  - **Technician**: My assigned tasks, live SLA countdown timer, progress posting, resolution submission.
  - **Manager**: Analytics command center, SLA compliance metrics, ownership gap %, AI action metrics, audit & traceability viewer.
  - **Admin**: User directory management, team assignment, active SLA policy thresholds.

### 2.2 Backend (`backend/`)
- **Framework**: Express.js with TypeScript (`tsx`, `tsc`).
- **Authentication**: JWT authentication with bcrypt password hashing.
- **Database Abstraction**: PostgreSQL relational driver (`pg`) with automatic zero-config dev relational memory store fallback pre-seeded with realistic multi-role data.
- **Agent Orchestrator**: Event-driven engine coordinating specialized AI agents (`IncidentAnalysisAgent`, `OwnershipAgent`, `CommunicationAgent`, `EscalationAgent`, `ResolutionAgent`, `MonitoringAgent`).
- **Policy Engine**: Enforces strict allowlists (`CREATE_RECOMMENDATION`, `NOTIFY_SUPERVISOR`, `REMIND_TECHNICIAN`, `ESCALATE_INCIDENT`, `GENERATE_SUMMARY`), autonomy level rules (Advisory, Assisted, Autonomous), and RBAC controls.
- **Action Executor**: Validates and executes allowed AI actions transactionally, producing append-only audit records.

---

## 3. Database Relational Schema

```sql
users (id, name, email, password_hash, role, preferred_language, team_id, is_active, created_at, updated_at)
teams (id, name, description, created_at, updated_at)
skills (id, name, description, created_at)
user_skills (user_id, skill_id, proficiency_level)
incidents (id, incident_number, title, description, original_language, category, severity, priority, status, location, affected_service, created_by, assigned_to, assigned_team, sla_deadline, resolved_at, closed_at, created_at, updated_at)
incident_assignments (id, incident_id, assigned_to, assigned_by, assignment_reason, assignment_type, started_at, ended_at, created_at)
incident_updates (id, incident_id, user_id, update_type, message, language, created_at)
notifications (id, recipient_id, incident_id, channel, type, subject, message, language, status, sent_at, created_at)
ai_recommendations (id, incident_id, agent_type, recommendation_type, input_context, recommendation, confidence, status, approved_by, approved_at, created_at)
ai_actions (id, incident_id, agent_type, action_type, action_payload, execution_status, executed_by, execution_result, created_at)
audit_logs (id, actor_id, actor_type, action, entity_type, entity_id, old_value, new_value, metadata, created_at)
sla_policies (id, name, priority, severity, response_minutes, resolution_minutes, escalation_minutes, is_active, created_at)
messages (id, incident_id, sender_id, recipient_id, message, language, created_at)
system_settings (id, setting_key, setting_value, updated_at)
```
