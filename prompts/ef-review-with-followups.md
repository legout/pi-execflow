---
description: Review exactly one work-item implementation and always create tracker follow-ups
argument-hint: "<work-item-ref> [context...]"
model: openai-codex/gpt-5.5
thinking: medium
subagent: reviewer
fresh: true
skill: review-suite
restore: true
---

Review target type: one implemented work item.

Inputs:

- Work item: `$1`
- Flags/context: `--create-followups ${@:2}`

Scope:

- resolve the work item, tracker system, and optional ExecPlan
- inspect the implementation and validation evidence
- check work-item compliance, ExecPlan compliance if present, acceptance criteria completion, accidental scope expansion, missing required behavior, regression risk, and merge readiness
- produce separate judgments for spec compliance, code quality, and validation evidence before the overall verdict

Follow the `review-suite` skill exactly.
Follow-up creation is enabled by this wrapper. Treat this prompt as if the input includes `--create-followups`; create tracker follow-ups for concrete, actionable findings after checking for obvious duplicates.
