# Agent Instructions for HelixGuard Development

This repo contains HelixGuard — a healthcare AI governance platform for an Executive MBA capstone project.

---

## Before ANY Work

0. **Read `docs/foundations/SOUL.md`** — HelixGuard's agent soul: who we are, how we behave, what we never do
1. **Read `docs/strategy/`** — Strategic context and goals (Note: docs are being replaced/updated)
2. **Check `docs/requirements/PRD_*.md` Section 2.4** — HelixGuard success metrics (Note: docs are being replaced/updated)
3. **Review `docs/README.md`** — Feature dashboard and spec status (Note: docs are being replaced/updated)

---

## Strategic Validation

HelixGuard is a healthcare AI governance platform focused on responsible AI deployment and oversight.

Before completing ANY task, answer:

- [ ] **Does this advance HelixGuard's core mission?** (Healthcare AI governance and oversight)
- [ ] **Which HelixGuard success metric does this advance?** (See PRD 2.4, if available)
- [ ] **Does it follow Design Principles?** (See `.cursor/rules/thread-principles.mdc`)
- [ ] **Does it create bidirectional value?** (Leadership + Teams both benefit)

If an item doesn't clearly align with HelixGuard's mission, flag it as **exploratory** and confirm before proceeding.

---

## When Writing Code

- Apply `.cursor/rules/thread-principles.mdc` — Design principle guardrails
- Apply `.cursor/rules/code-patterns.mdc` — Development conventions
- Every component serves a persona: Leadership, Stakeholder, or Build Team
- Follow healthcare AI governance best practices

---

## When Writing Specs/Docs

- Apply `.cursor/rules/docs-structure.md` — Documentation lifecycle
- Include **Strategic Alignment** section with HelixGuard mission reference
- Use template: `docs/specs/_template.md` (Note: templates are being updated)
- Update `docs/README.md` Feature Dashboard when moving specs (Note: docs are being replaced/updated)

### Content Standards (CRITICAL)

- **NEVER include specific names** from meetings, transcripts, or conversations
- **NEVER quote directly** from meeting transcripts or recordings
- **Genericize problem statements** — focus on the problem, not who said it
- **Role-based references only** — use "Leadership", "Stakeholders", "Build Teams", not individual names
- **Personas over people** — describe user types, not specific users
- **If transcript context is needed** — summarize the insight, not the quote

**Why:** Specs and docs become long-lived artifacts. Personal attribution creates maintenance burden and privacy concerns. The insight matters, not who said it.

---

## Git Workflow

- Apply `.cursor/rules/git-workflow.mdc` — Branch naming, commit messages, PR requirements
- PRs MUST include HelixGuard mission alignment
- Reference success metrics being advanced

---

## Key Files

| Purpose | File |
|---------|------|
| HelixGuard agent soul | `docs/foundations/SOUL.md` (Note: being replaced/updated) |
| Strategic context | `docs/strategy/` (Note: being replaced/updated) |
| HelixGuard success metrics | `docs/requirements/PRD_*.md` (Section 2.4) (Note: being replaced/updated) |
| Design principles | `docs/foundations/Design_Principles.md` (Note: being replaced/updated) |
| Product thesis | `docs/foundations/Thread_Thesis_Vision.md` (Note: being replaced/updated) |
| Feature dashboard | `docs/README.md` (Note: being replaced/updated) |
| Spec template | `docs/specs/_template.md` (Note: being replaced/updated) |

---

## The Design Checklist

Apply to every feature:

| Question | Expected |
|----------|----------|
| Remove burden or add it? | Remove |
| Bidirectional value? | Yes |
| Close a loop? | Yes |
| Context over data? | Context first |
| Teams would choose this? | Yes |
| AI augments humans? | Always |
| Soul test: team empowerment first? | Always |
