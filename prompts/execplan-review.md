---
description: Audit an ExecPlan delivery; create gap follow-ups only with --create-followups
argument-hint: "<plan-slug-or-path> [--create-followups] [context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: review-suite
restore: true
---

Review target type: whole ExecPlan delivery.

Inputs:

- ExecPlan slug, path, or topic: `$1`
- Flags/context: `${@:2}`

Scope:

- resolve the ExecPlan from direct path, `.execflow/plans/<slug>/execplan.md`, or best match under `.execflow/plans/`
- find derived issues/tickets that reference the plan path, topic, milestone names, or ExecPlan sections
- inspect work-item status, descriptions, dependencies, comments, and validation notes
- sample high-risk changed code paths only as needed to verify plan drift or evidence
- check milestone coverage, dependency sequencing, plan drift, acceptance evidence, validation evidence, and required docs/architecture updates

Follow the `review-suite` skill exactly.
Default to read-only. Create tracker follow-ups only when the input includes `--create-followups`.
