# ClinicalOS Docs Structure Rules

**Template Version:** v20260129.1

These rules enforce documentation consistency for the ClinicalOS project.

---

## Versioning

- Format: `vYYYYMMDD.#` (e.g., v20260129.1)
- If you touch a doc, bump version and update date
- Increment `.#` for multiple updates same day (v20260129.1 → v20260129.2)

---

## Spec Lifecycle

Specs move through folders as work progresses:

| Folder | Purpose |
|--------|---------|
| `3_backlog/` | Future ideas, light specs |
| `2_proposed/` | Ready for pickup, refined |
| `1_active/` | Feature branch active, someone working |
| `0_implemented/` | Shipped, reference only |
| `99_archive/` | Historical iteration docs, superseded specs |

**Flow:** `3_backlog/ → 2_proposed/ → 1_active/ → 0_implemented/ → 99_archive/`

**Feature IDs are global, sequential, never reused.**

**When moving specs:** Update both:
- `docs/README.md` Feature Dashboard
- `docs/requirements/PRD_*.md` Section 3.5 Feature Dashboard

---

## Decision Lifecycle

| Folder | Purpose |
|--------|---------|
| `0_proposed/` | Decisions under consideration |
| `1_accepted/` | Accepted and in effect |
| `2_rejected/` | Rejected (kept for history) |

**Flow:** `0_proposed/ → 1_accepted/` OR `0_proposed/ → 2_rejected/`

**When moving decisions:** Update `docs/README.md` Decision Records section and `docs/decisions/README.md` to reflect new status.

---

## Core Docs

PRD, IA, Architecture are living documents:
- Update in place (don't create new files)
- Track changes in Changelog section at bottom
- Always update Date field when editing

---

## File Naming

- Specs: `[ID]-[Feature_Name].md` (e.g., `011-Impact_Refiner_Agent.md`)
- Decisions: `DR-[ID]-[Decision_Name].md` (e.g., `DR-001-Platform_Abstraction_Strategy.md`)

---

## Templates

- New specs MUST use `docs/specs/_template.md`
- New decisions MUST use `docs/decisions/_template.md`
- Template changes require review — update existing docs if structural fields change
- Template version tracked in template file header

---

## Traceability

- Use `Supersedes:` field to link to predecessor (spec or decision being replaced)
- Use `Superseded By:` field when archiving (filled in by the replacing doc)
- Both fields use IDs (e.g., "DR-001" or "005")
- Use "None" if no predecessor exists

---

## Content Standards (CRITICAL)

All specs, requirements, and strategy docs MUST follow these rules:

### No Personal Attribution

- **NEVER include specific names** from meetings, transcripts, or conversations
- **NEVER quote directly** from meeting transcripts or recordings
- **Role-based references only** — use "Leadership", "Stakeholders", "Build Teams"
- **Personas over people** — describe user types, not specific individuals

### Genericize Problem Statements

- Focus on the **problem**, not who articulated it
- Focus on the **insight**, not who said it
- If meeting context informed a decision, summarize the insight without attribution

### Why This Matters

Specs and docs become long-lived artifacts shared across teams. Personal attribution:
- Creates maintenance burden when people change roles
- Raises privacy concerns
- Distracts from the problem being solved
- Makes docs feel dated when names become unfamiliar

**The insight matters, not who said it.**
