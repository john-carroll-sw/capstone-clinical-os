# HelixGuard

**Clinical AI Governance & Decision Support Platform**

> Executive MBA Capstone Project — John Carroll, 2026

One platform, three purpose-built surfaces. Each persona sees exactly what they need — nothing more.

**Govern &rarr; Embed &rarr; Measure**

![HelixGuard Demo Index — Three surfaces for three personas](docs/images/readme/hero-demo-index.png)

---

## Live Demo

**[helixguard.vercel.app](https://helixguard.vercel.app)**

Password-gated for demo access. Contact the author for credentials.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Platform Architecture](#platform-architecture)
- [Surface 1: Clinician Panel](#surface-1-clinician-panel)
- [Surface 2: Leadership Dashboard](#surface-2-leadership-dashboard)
- [Surface 3: Governance Control Plane](#surface-3-governance-control-plane)
- [AI Assistant](#ai-assistant)
- [User Journey Maps](#user-journey-maps)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Feedback](#feedback)

---

## The Problem

Healthcare systems are deploying clinical AI tools — medication alert triage, nursing handoff generators, drug interaction checkers — but nobody has a unified answer to three critical questions:

| Question | Who Asks It |
|----------|-------------|
| "Is this AI safe to use on my patient right now?" | Clinicians |
| "Is our AI program actually improving outcomes?" | Leadership |
| "Which models are approved, and what's the audit trail?" | Governance / Compliance |

Today, these answers live in disconnected spreadsheets, Slack threads, and quarterly reports. HelixGuard brings them into one platform.

---

## The Solution

HelixGuard provides **three surfaces** — each designed for a specific persona, all sharing the same data layer:

```mermaid
graph LR
    subgraph HelixGuard["HelixGuard Platform"]
        CP["Clinician Panel<br/><i>Use AI safely</i>"]
        LD["Leadership Dashboard<br/><i>Measure outcomes</i>"]
        GC["Governance Control Plane<br/><i>Approve & audit</i>"]
    end

    EHR["EHR System"] --> CP
    CP --> DATA[(Shared Data Layer)]
    LD --> DATA
    GC --> DATA
    DATA --> AUDIT["Audit Trail"]
    DATA --> METRICS["KR Attainment"]

    style HelixGuard fill:#f0f4ff,stroke:#1a2b5f,stroke-width:2px
    style CP fill:#e8f5e9,stroke:#2e7d32
    style LD fill:#e3f2fd,stroke:#1565c0
    style GC fill:#fff3e0,stroke:#e65100
```

| Surface | Persona | Core Value |
|---------|---------|------------|
| **Clinician Panel** | Pharmacists, Nurses | AI assistance embedded in the EHR — never leave your workflow |
| **Leadership Dashboard** | VP Clinical Ops | See whether AI is helping or hurting, at a glance |
| **Governance Control Plane** | CISO, Compliance | Approve every use case, audit every interaction |

---

## Platform Architecture

```mermaid
graph TB
    subgraph Frontend["React SPA (Vite + TypeScript)"]
        Router["React Router<br/>Persona-aware routing"]
        Personas["Persona Context<br/>4 personas, 3 surfaces"]
        AI["AI Chat Panel<br/>Context-aware assistant"]
        Feedback["Feedback Widget<br/>→ GitHub Issues"]
    end

    subgraph Surfaces["Three Surfaces"]
        S1["Clinician Panel<br/>Pharmacy Alerts<br/>Nursing Handoffs"]
        S2["Leadership Dashboard<br/>AI Briefing<br/>Outcomes & Reports"]
        S3["Governance Plane<br/>Use Case Registry<br/>Audit Log · RBAC"]
    end

    subgraph Backend["Vercel Platform"]
        Static["Static Hosting<br/>CDN + SPA"]
        Serverless["Serverless Functions<br/>Feedback API"]
        GitHub["GitHub Issues API"]
    end

    Router --> Personas
    Personas --> S1 & S2 & S3
    AI --> S1 & S2 & S3
    Frontend --> Static
    Feedback --> Serverless --> GitHub

    style Frontend fill:#f5f5ff,stroke:#1a2b5f
    style Surfaces fill:#fafafa,stroke:#666
    style Backend fill:#f0fff0,stroke:#2e7d32
```

---

## Surface 1: Clinician Panel

> **Persona:** Dr. Patel (Pharmacist) · Sarah, RN (Nurse)
>
> **Thesis:** AI assistance surfaces inline — clinicians never open a new app.

### Pharmacy — Alert Review

The pharmacist sees a simulated EHR on the left with a medication review queue and AI safety assistant on the right. Each patient's active alerts are triaged by the AI, and the pharmacist can **Confirm**, **Edit**, or **Reject** every recommendation.

![Pharmacy Alert Review — EHR + AI Medication Safety Assistant](docs/images/readme/clinician-pharmacy-alerts.png)

Expanding an alert shows the full AI clinical summary, medications involved, chart references, confidence score, and the governance policy that governs it.

![Alert Detail — Drug interaction with Confirm/Edit/Reject actions](docs/images/readme/clinician-alert-detail.png)

### Nursing — Shift Handoff Generator

Nurses select a patient to generate an AI-powered SBAR handoff (Situation, Background, Assessment, Recommendation). Every section is editable. The AI surfaces recent changes, pending tasks, and escalation flags.

![Nursing Handoff — SBAR format with patient context](docs/images/readme/clinician-nursing-handoff-sbar.png)

The handoff includes a timeline of changes in the last 12 hours, pending tasks with due times, and escalation flags that require immediate attention. The nurse reviews and signs off.

![Handoff Sign-Off — Changes, tasks, escalation flags](docs/images/readme/clinician-nursing-handoff-signoff.png)

---

## Surface 2: Leadership Dashboard

> **Persona:** VP Chen — VP of Clinical Operations
>
> **Thesis:** See whether AI is helping or hurting. Time saved, alert signal-to-noise, adoption rates, and safety events — all in one read-only view.

### AI Briefing

The "For You" briefing is the leadership landing page — a personalized, AI-generated summary of program health. It tells you what's on track, what needs attention, and what's on your radar.

![AI Briefing — Personalized program summary with metrics](docs/images/readme/leadership-ai-briefing.png)

Below the briefing: items that need attention (with severity), things on your radar, and your program areas with attainment percentages.

![Briefing Alerts — Needs attention, on your radar, program areas](docs/images/readme/leadership-briefing-alerts.png)

### Reports

Auto-generated reports with program health donut charts, KR attainment by program area, and AI narrative summaries. Reports can be previewed or downloaded.

![Reports — Program at a glance with KR attainment bars](docs/images/readme/leadership-reports.png)

---

## Surface 3: Governance Control Plane

> **Persona:** CISO Martinez — Chief Information Security Officer
>
> **Thesis:** Every AI use case is approved before deployment. Configure guardrails, manage access, and review full audit logs of every AI interaction.

### Use Case Registry

The central registry of all clinical AI use cases. Each row shows the model, department, risk level, approval status, interaction count, flagged rate, and last audit date. Expand any row to see the full approval history.

![Use Case Registry — 5 use cases across Pharmacy and Nursing](docs/images/readme/governance-use-case-registry.png)

![Use Case Detail — Medication Alert Prioritization with approval timeline](docs/images/readme/governance-use-case-detail.png)

### Audit Log

Complete trail of every AI interaction across all clinical use cases. 500 entries with filters for use case, department, severity, and escalation status. Expand any row for the full AI input/output.

![Audit Log — 500 entries, filterable, expandable detail](docs/images/readme/governance-audit-log.png)

### Access Control (RBAC)

Role-based access matrix showing who can use which AI workflows. Permissions range from "View Only" to "Approve/Suspend/Configure." Each role maps to specific authorized use cases.

![Access Control — RBAC matrix by role, department, and permissions](docs/images/readme/governance-access-control.png)

### Allowlists & Policies

Three tabs of governance configuration:

**Approved Models** — Version-pinned AI models with human review requirements.

![Allowlists — Approved models with version pinning](docs/images/readme/governance-allowlists-models.png)

**Governance Policies** — HIPAA data handling, human-in-the-loop mandates, model version pinning, quarterly audit reviews, and minimum data access rules.

![Governance Policies — HIPAA, human-in-the-loop, model pinning](docs/images/readme/governance-policies.png)

---

## AI Assistant

Every surface has a context-aware AI chat panel. The assistant adapts its personality, quick prompts, and data sources based on which surface and persona is active.

| Surface | Assistant Mode | Example Prompts |
|---------|---------------|-----------------|
| Clinician | Medication Safety | "Explain this interaction", "Check dosing", "Summarize patient" |
| Leadership | Program Analytics | "How is the clinical AI program performing?", "Any safety incidents?" |
| Governance | Compliance & Audit | "Any flagged AI interactions?", "Are there policy violations?" |

![Leadership AI Chat — Program performance snapshot with sources](docs/images/readme/leadership-ai-chat.png)

The assistant in governance mode can pull flagged interaction summaries and policy violation reports in real time:

![Governance AI Chat — Flagged interactions and policy violation report](docs/images/readme/governance-ai-chat.png)

---

## User Journey Maps

### Journey 1: Pharmacist Reviews AI-Triaged Alerts

```mermaid
journey
    title Pharmacist Morning Alert Review
    section Open Shift
      Log into EHR: 3: Pharmacist
      HelixGuard loads in sidebar: 5: System
    section Review Queue
      See 6 patients with alerts: 4: Pharmacist
      Select high-priority patient: 5: Pharmacist
      Read AI clinical summary: 5: AI
    section Take Action
      Confirm drug interaction alert: 5: Pharmacist
      Edit dosing recommendation: 4: Pharmacist
      Reject false-positive alert: 3: Pharmacist
    section Close
      All actions logged to audit trail: 5: System
      Shift handoff auto-generated: 5: AI
```

### Journey 2: VP Reviews Weekly AI Program Briefing

```mermaid
journey
    title VP Weekly Program Check-In
    section Morning Briefing
      Open HelixGuard Leadership: 5: VP
      Read AI-generated briefing: 5: AI
      Check program health (92%): 5: VP
    section Drill Down
      See 2 items need attention: 4: VP
      Review handoff accuracy gap: 3: VP
      Note governance review Thursday: 4: VP
    section Ask AI
      Ask about safety incidents: 5: VP
      AI summarizes 2 minor incidents: 5: AI
      No critical issues — close: 5: VP
    section Report
      Preview weekly summary report: 5: VP
      Download for exec team: 5: VP
```

### Journey 3: CISO Audits Flagged AI Interactions

```mermaid
journey
    title CISO Monthly Compliance Audit
    section Dashboard Review
      Open Governance Control Plane: 5: CISO
      Check Use Case Registry status: 5: CISO
      1 use case pending review: 4: CISO
    section Audit Log
      Filter to flagged interactions: 5: CISO
      Review 23 flagged (0.18%): 4: CISO
      Expand critical severity entry: 3: CISO
    section AI Check
      Ask AI for policy violations: 5: CISO
      No active violations: 5: AI
      1 resolved in last 30 days: 4: AI
    section Access Review
      Verify RBAC matrix: 5: CISO
      Check allowlisted models: 5: CISO
      Confirm policies enforced: 5: CISO
```

### Data Flow: From AI Interaction to Audit Trail

```mermaid
flowchart LR
    A[Clinician<br/>uses AI tool] --> B[AI generates<br/>recommendation]
    B --> C{Clinician<br/>decision}
    C -->|Confirm| D[Action logged]
    C -->|Edit| E[Modified action logged]
    C -->|Reject| F[Override logged]
    D & E & F --> G[(Audit Log)]
    G --> H[Leadership<br/>sees outcomes]
    G --> I[Governance<br/>reviews trail]
    H --> J[KR Attainment<br/>& Reports]
    I --> K[Compliance<br/>& Policy Check]

    style A fill:#e8f5e9,stroke:#2e7d32
    style B fill:#e3f2fd,stroke:#1565c0
    style G fill:#fff3e0,stroke:#e65100
    style H fill:#e3f2fd,stroke:#1565c0
    style I fill:#fff3e0,stroke:#e65100
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| UI Library | Material UI (MUI) v5 |
| Routing | React Router v6 (persona-aware) |
| Build | Vite |
| Hosting | Vercel (Static + Serverless Functions) |
| Feedback | Vercel Serverless → GitHub Issues API |
| State | React Context (Persona, Theme, Preferences) |
| Data | Client-side mocks (no backend required for demo) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Run Locally

```bash
git clone https://github.com/john-carroll-sw/capstone-helixguard.git
cd capstone-helixguard/frontend
npm install
npm run dev
```

Opens at **http://localhost:5173**. No backend required — all data is client-side mocks.

### Deploy to Vercel

The app is configured for one-click Vercel deployment:

1. Import the repo in Vercel
2. Set root directory to `frontend`
3. Add environment variables:
   - `VITE_DEMO_PASS` — password for the demo gate
   - `GITHUB_TOKEN` — fine-grained PAT for feedback → GitHub Issues
   - `GITHUB_REPO` — `john-carroll-sw/capstone-helixguard`
4. Deploy

---

## Project Structure

```
capstone-helixguard/
├── frontend/                    # React application
│   ├── api/                     # Vercel Serverless Functions
│   │   └── feedback.ts          # Feedback → GitHub Issues proxy
│   ├── src/
│   │   ├── components/
│   │   │   ├── clinician/       # Pharmacy alerts, nursing handoffs
│   │   │   ├── layout/          # AppShell, sidebar, navigation
│   │   │   ├── pages/           # All page-level views
│   │   │   ├── ai/              # AI chat panel
│   │   │   ├── governance/      # Registry, audit, RBAC, allowlists
│   │   │   └── feedback/        # Feedback widget
│   │   ├── context/             # Persona, theme, user contexts
│   │   ├── data/                # Mock data (healthcare, metrics)
│   │   ├── services/            # LLM, notifications, preferences
│   │   └── theme/               # MUI theme configuration
│   ├── vercel.json              # Vercel deployment config
│   └── package.json
├── docs/                        # Documentation & screenshots
│   └── images/readme/           # README screenshots
└── README.md                    # ← You are here
```

---

## Feedback

HelixGuard has a built-in feedback widget (bottom-right corner of every page). Feedback submissions create GitHub Issues on this repository automatically — text and optional screenshots included.

---

## License

Executive MBA capstone project. Source code is available for academic and portfolio purposes.

---

*Built with React, Material UI, and a lot of clinical AI research.*
