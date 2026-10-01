# SentinelOps AI
### Agentic Incident Ownership & Intelligent Coordination Platform

> **Solving Unclear Ownership in Urgent Incidents**  
> *"When urgent tasks have no designated owner, teams assume someone else is handling it, leading to delays and SLA breaches."*

SentinelOps AI creates a centralized intelligent incident-management environment where Agentic AI continuously monitors incidents, identifies ownership gaps, prioritizes risks, recommends qualified technicians based on active workload capacity, and automates controlled operational notifications in English, Hindi, and Marathi—keeping humans accountable for critical decisions.

---

## 🌟 Key Product Features

1. **Explicit Ownership Guarantee ("OWNER REQUIRED")**: Urgent incidents cannot remain unowned. Unassigned tasks trigger automated supervisor alerts, escalation timers, and high-visibility dashboard banners.
2. **Multi-Agent AI Architecture**:
   - **Incident Analysis Agent**: Multilingual language detection (English, Hindi, Marathi), category classification, severity & urgency scoring.
   - **Ownership Agent**: Skill profile matching and technician workload evaluation.
   - **Communication Agent**: Decision engine generating localized notifications (in-app, email, chat).
   - **Escalation Agent**: Monitored SLA thresholds and automated escalation triggers.
   - **Resolution Agent**: Technician resolution summarization and supervisor review notes.
   - **Monitoring Agent**: Continuous scanning loop for unassigned timeouts and SLA breaches.
3. **Human-in-the-Loop & Policy Engine**:
   - Autonomy Level 2 (Assisted): AI prepares recommendations while requiring supervisor sign-off for critical actions.
   - Allowlist enforcement & append-only audit trail logging.
4. **Multilingual Support**: Supports natural language inputs and outputs in **English, Hindi (हिंदी), and Marathi (मराठी)** without destroying original text.
5. **Interactive AI Tools**:
   - *"Why is this at risk?"* (Explains SLA and inactivity risk factors)
   - *"Recommend Owner"* (Workload & skill match with 1-click Approve button)
   - *"Who needs to know?"* (Targeted operational communications)

---

## 🔑 Development Demo Credentials

Use these pre-configured demo accounts (Password for all accounts: `Password123!`):

| Role | Name | Email | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Operator** | Aarav Patel | `operator@example.com` | Report incidents, natural language Marathi/Hindi input |
| **Supervisor** | Rajesh Sharma | `supervisor@example.com` | Operational queue, review AI recommendations, assign owners |
| **Technician** | Alex Rivera | `technician1@example.com` | View assigned tasks, live SLA countdown, update progress, resolve |
| **Manager** | Eleanor Vance | `manager@example.com` | Analytics dashboard, SLA compliance %, AI audit traceability |
| **Admin** | System Admin | `admin@example.com` | User management & SLA policy thresholds |

*Note: The frontend Navbar includes a 1-click Demo Role Switcher for instant testing.*

---

## 🚀 Quick Run Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm test
npm run dev
```

The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run build
npm run dev
```

The frontend application will start on `http://localhost:3000`.

---

## 🧪 Automated Test Verification

Run backend unit & policy tests:

```bash
cd backend
npm test
```

**Test Results Output:**
```text
🧪 Running SentinelOps AI Backend Verification Suite...
✅ Seed data successfully initialized into database memory store.
✔ Database seeded for test execution.
✔ PolicyEngine Allowlist & Autonomy checks passed.
✔ IncidentRepository SLA status computation passed.
✔ Repository Query passed (2 incidents enriched).

📊 TEST RESULTS SUMMARY: 4 PASSED, 0 FAILED
```

---

## 📁 Repository Structure

```text
sentinelops-ai/
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── controllers/      # REST API Controllers
│   │   ├── middleware/       # JWT Auth, RBAC & Error Handlers
│   │   ├── migrations/       # Production PostgreSQL 001_initial_schema.sql
│   │   ├── repositories/     # Data Access Layer & Repositories
│   │   ├── routes/           # Express API Route Handlers
│   │   ├── schemas/          # Zod Validation Schemas
│   │   ├── seed/             # Seed Data Generator
│   │   ├── services/         # Business Logic, Agents, Policy Engine & Actions
│   │   │   ├── actions/      # Action Executor & Audit Logging
│   │   │   ├── agents/       # Multi-Agent Orchestrator & Agents
│   │   │   ├── ai/           # Gemini AI Provider & Context Builder
│   │   │   └── policy/       # Policy Engine Guard
│   │   ├── test/             # Automated Verification Test Suite
│   │   ├── app.ts
│   │   └── index.ts
│   └── package.json
│
├── frontend/                 # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI, Badges, Modals, Panels & Timeline
│   │   ├── context/          # Auth, Language & Notification React Contexts
│   │   ├── pages/            # Role-tailored Dashboard, Incidents & Analytics
│   │   ├── services/         # Axios API Client & Service Wrappers
│   │   ├── types/            # TypeScript Interface Definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
├── docs/                     # Comprehensive System Documentation
│   ├── architecture.md       # Frontend/Backend/Database Architecture
│   ├── ai.md                 # Agent System Specs, Prompt Injection Defense
│   └── deployment.md         # Production Deployment & Docker Instructions
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛡️ License

Built for enterprise operational coordination.
