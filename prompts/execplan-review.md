---
description: Audit an ExecPlan delivery across derived issues/tickets
argument-hint: "<plan-slug-or-path> [--create-followups] [context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: review-suite
restore: true
---

You are reviewing delivery of a whole ExecPlan and its derived work items.

## Inputs

- ExecPlan slug, path, or topic: `$1`
- Optional flags/context: `${@:2}`
- Optional mutation flag: `--create-followups`

## Scope

This is a plan-fulfillment and delivery audit, not a line-by-line review of the entire repository.

Review whether the ExecPlan was delivered coherently across its issues/tickets:

- milestone coverage
- derived work-item coverage
- dependency and sequencing correctness
- implementation drift from plan intent
- acceptance and validation evidence
- missing docs or `ARCHITECTURE.md` updates
- unresolved high-risk implementation areas
- need for follow-up work items

## Required workflow

1. Resolve the ExecPlan from `$1`:
   - direct file path
   - `.execflow/plans/<slug>/execplan.md`
   - best title/slug/content match under `.execflow/plans/`
2. Determine tracker system from repository evidence (`br`, `tk`, or other).
3. Find derived issues/tickets that reference the plan path, topic, milestone names, or ExecPlan sections.
4. Inspect issue/ticket status, descriptions, dependencies, comments, and validation notes.
5. Sample high-risk changed code paths only as needed to verify drift and evidence. Do not broaden into a full codebase review.
6. Produce a plan-level verdict.
7. If `--create-followups` is present, create follow-up issues/tickets only for concrete material gaps and add a concise review note to the plan-related tracker items when appropriate.

## Follow-up creation policy for `--create-followups`

Only create follow-ups for material, actionable gaps:

- missing milestone issue/ticket
- closed work item that does not satisfy its ExecPlan acceptance intent
- validation evidence gap that blocks confidence
- plan drift requiring explicit correction
- missing architecture/docs update required by the plan
- dependency/sequencing issue that still matters

Do not create tickets for speculative concerns, low-value nits, or findings that already have equivalent open work items.

For `br`, prefer `br create --actor "$ACTOR" ... --deps discovered-from:<related-id> --json` when there is a clear related issue. For `tk`, use the repository's normal `tk create` flow and add the relationship if supported.

## Output format

Use exactly these sections:

# ExecPlan Review Verdict

- Plan:
- Tracker system: tk / br / other
- Verdict: delivered / partial / failed / blocked
- Confidence: high / medium / low
- Summary:
- Follow-ups requested: yes / no

# Milestone Coverage

- Milestone 1:
  - Status:
  - Evidence:
  - Gaps:
- Milestone 2:
  - Status:
  - Evidence:
  - Gaps:

# Derived Work Item Audit

- Work item:
  - Status:
  - Plan alignment:
  - Validation evidence:
  - Notes:

# Implementation Drift

- Drift item:
  - Severity: high / medium / low
  - Evidence:
  - Recommended correction:

# Validation Evidence

- Plan-level validation:
- Missing or weak evidence:
- Commands or checks recommended:

# Follow-up Decisions

- Material follow-ups needed:
- Follow-ups created, if `--create-followups` was requested:
- Findings intentionally not ticketed:

# Recommended Next Actions

- Action 1:
- Action 2:
