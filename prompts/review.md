---
description: Run specialized reviewer subagents in parallel and consolidate one final verdict
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate
chainContext: summary
restore: true
---

This command runs the read-only review suite for exactly one work item.

It uses prompt-template delegated `parallel(...)` execution. This requires `pi-subagents` to be installed and prompt-template delegation to know the subagent runtime root. If `pi-subagents` is installed as a Pi package rather than under `~/.pi/agent/extensions/subagent`, start Pi with `PI_SUBAGENT_RUNTIME_ROOT` pointing at the package root reported by `pi list`.

Flow:

- resolve the work item and any matching ExecPlan first
- run spec-compliance review in a fresh reviewer subagent
- run regression / compatibility review in a fresh reviewer subagent
- run test-adequacy review in a fresh reviewer subagent
- run maintainability review in a fresh reviewer subagent
- consolidate the findings into one final verdict in the main session

The review command does not mutate tracker state. After reviewing, use `/review-followups <work-item-ref>` to record the review summary on the original item and create linked follow-up work items for material findings.
