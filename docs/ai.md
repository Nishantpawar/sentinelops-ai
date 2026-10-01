# SentinelOps AI - Agentic AI Architecture & Safety Specifications

## 1. Multi-Agent System Roles

SentinelOps AI operates an intelligent multi-agent orchestration layer:

```
                          +-------------------------+
                          |   Agent Orchestrator    |
                          +------------+------------+
                                       |
        +------------------+-----------+-----------+------------------+
        |                  |                       |                  |
        v                  v                       v                  v
[Incident Analysis]  [Ownership Agent]  [Communication Agent] [Escalation Agent]
        |                  |                       |                  |
        +------------------+-----------+-----------+------------------+
                                       v
                             [Policy Engine Guard]
                                       v
                              [Action Executor]
```

### 1.1 Incident Analysis Agent
- Detects input language (English `en`, Hindi `hi`, Marathi `mr`).
- Categorizes incident (`equipment_failure`, `network_issue`, `software_issue`, `electrical_issue`, etc.).
- Determines severity and urgency (`low`, `medium`, `high`, `critical`).
- Extracts required skills and provides a concise English summary.

### 1.2 Ownership Agent
- Evaluates eligible technician skill profiles, active workload capacity, availability, and incident location.
- Recommends the single best technician to eliminate "someone else will handle it" ambiguity.
- Requires Supervisor approval before executing assignment in Level 2 Assisted Autonomy.

### 1.3 Communication Agent
- Determines whether stakeholder notifications are required.
- Selects target recipient role (Supervisor, Technician, Manager).
- Generates localized notifications in recipient's preferred language (English, Hindi, Marathi).

### 1.4 Escalation Agent
- Monitors SLA response & resolution deadlines, unassigned status timeouts, and technician inactivity.
- Evaluates escalation levels (`REMINDER`, `SUPERVISOR_ALERT`, `MANAGER_ESCALATION`).

### 1.5 Resolution Agent
- Summarizes technician resolution notes and assesses completeness for supervisor sign-off.
- Explicitly distinguishes AI text assessment from physical human verification.

---

## 2. Safety Controls & Prompt Injection Defense

1. **Server-Side API Key Isolation**: Gemini API keys strictly reside in backend environment variables (`GEMINI_API_KEY`).
2. **Prompt Injection Guard**: User-submitted incident descriptions are wrapped in strict `<USER_INPUT>` delimiters and evaluated purely as data content.
3. **Structured JSON Enforcement**: Responses are validated through Zod schemas (`IncidentAnalysisSchema`, `OwnershipRecommendationSchema`, `CommunicationDecisionSchema`).
4. **Action Allowlist**: AI is restricted to authorized actions (`CREATE_RECOMMENDATION`, `NOTIFY_SUPERVISOR`, `REMIND_TECHNICIAN`, `ESCALATE_INCIDENT`, `GENERATE_SUMMARY`).
5. **No Direct Database Writes**: AI agents produce recommendations that must pass through the `PolicyEngine` and `ActionExecutor`.
6. **No Hidden Chain of Thought**: AI outputs display concise, factual decision factors based on observable data only.
