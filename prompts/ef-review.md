---
description: Review exactly one work-item implementation; create bug follow-ups only with --create-followups
argument-hint: "<work-item-ref> [--create-followups] [context...]"
model: openai-codex/gpt-5.5
thinking: medium
fresh: true
skill: review-suite
restore: true
---

Review target type: one implemented work item.

Inputs:

- Work item: `$1`
- Flags/context: `${@:2}`

Scope:

- resolve the work item, tracker system, and optional ExecPlan
- inspect the implementation and validation evidence
- check work-item compliance, ExecPlan compliance if present, acceptance criteria completion, accidental scope expansion, missing required behavior, regression risk, and merge readiness

Follow the `review-suite` skill exactly.
Default to read-only. Create tracker follow-ups only when the input includes `--create-followups`.
