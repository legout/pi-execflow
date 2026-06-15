---
description: Review exactly one work-item implementation and always create tracker follow-ups
argument-hint: "<work-item-ref> [context...]"
model: openai-codex/gpt-5.5
thinking: high
subagent: ef-reviewer
fresh: true
skill: review-suite
restore: true
---

Review target type: one implemented work item.

Inputs:

- Work item: `$1`
- Flags/context: `--create-followups ${@:2}`

Auto-selection context:

When `$1` is empty, `--next`, or an autoship option such as `--max-retries`, use the immediately preceding `# Ship Selection` chain output as the target source:

- If it contains `Autoship selection: DISPATCH` or `Autoship selection: EXPLICIT_TARGET`, use `Selected work item` as the review target.
- If it contains `Autoship selection: NO_READY`, `Autoship selection: ALL_READY_EXHAUSTED`, or `Autoship selection: ALREADY_CLOSED`, stop immediately: do not inspect diffs, create follow-ups, add comments, or run commands; output only `No ready work item selected; review skipped.`
- If there is no preceding `# Ship Selection` output and `$1` is not an explicit work-item reference, stop and report the missing target.

Scope:

- resolve the work item, tracker system, and optional ExecPlan
- inspect the implementation and validation evidence
- check work-item compliance, ExecPlan compliance if present, acceptance criteria completion, accidental scope expansion, missing required behavior, regression risk, and merge readiness
- produce separate judgments for spec compliance, code quality, and validation evidence before the overall verdict

Follow the `review-suite` skill exactly.
Follow-up creation is enabled by this wrapper. Treat this prompt as if the input includes `--create-followups`; create tracker follow-ups for concrete, actionable findings after checking for obvious duplicates.
