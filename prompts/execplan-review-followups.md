---
description: Create linked tracker follow-ups from an ExecPlan delivery audit
argument-hint: "<plan-slug-or-path> [context...]"
model: zai/glm-5-turbo
thinking: medium
restore: true
---

You are converting the most recent `/execplan-review` verdict into tracker follow-up work.

## Inputs

- ExecPlan slug, path, or topic: `$1`
- Optional context: `${@:2}`

## Policy

- `/execplan-review` is read-only by default and audits plan delivery across derived issues/tickets.
- `/execplan-review --create-followups <plan>` may combine the audit and follow-up creation in one explicit mutation run.
- `/execplan-review-followups` is the explicit post-review mutation step.
- Create follow-ups only for concrete material gaps; do not ticket speculative concerns or low-value nits.
- Every created item must reference the ExecPlan path and, when applicable, the related milestone and existing issue/ticket.

## Your tasks

1. Resolve the ExecPlan from `$1` using direct path, `.execflow/plans/<slug>/execplan.md`, or best match under `.execflow/plans/`.
2. Determine tracker system (`tk`, `br`, or other) from repository evidence.
3. Read the most recent `# ExecPlan Review Verdict` from the current conversation. If none is available, stop and tell the user to run `/execplan-review $1` first.
4. Create follow-ups for material actionable gaps, including:
   - missing milestone issue/ticket
   - closed item that does not satisfy plan intent
   - validation evidence gap that blocks confidence
   - implementation drift requiring correction
   - missing docs or architecture update required by the plan
   - dependency/sequencing issue that still matters
5. De-duplicate against existing open tracker items.
6. Add concise notes/comments to relevant existing issues/tickets when useful for auditability.
7. Run tracker sync if required (`RUST_LOG=error br sync --flush-only` for `br`).

## Follow-up body format

```md
ExecPlan Review Follow-up

ExecPlan: <path>
Milestone: <milestone or none>
Related work item: <id or none>
Severity: <high|medium|low>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The ExecPlan gap is addressed or explicitly superseded.
- Relevant validation or evidence is documented.
```

## Rules

- Do not create follow-ups when the review found no material gaps.
- Do not create duplicate follow-ups for equivalent open issues/tickets.
- Prefer fewer, well-scoped follow-ups over many tiny tickets.
- Do not claim tracker changes succeeded until commands actually succeeded.

## Output format

Use exactly these sections:

# ExecPlan Follow-up Decision

- Plan:
- Tracker system: tk / br / other
- Review verdict:
- Material gaps:
- Why:

# Tracker Actions

- Notes/comments added:
- Follow-up items created:
- Dependencies / references added:
- Sync run:

# Follow-up Details

- Follow-up 1:
  - ID:
  - Severity:
  - Title:
  - Source finding:
- Follow-up 2:
  - ID:
  - Severity:
  - Title:
  - Source finding:

# Skipped Findings

- Finding:
  - Reason:

# Manual Follow-up

- Item:
