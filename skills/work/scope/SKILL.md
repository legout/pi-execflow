---
name: scope
description: Keep changes tightly within work-item scope and prevent opportunistic expansion. Use for any manual prompt that risks widening the diff.
---

# Scope Control

Use this skill whenever a task could drift beyond the current work item.

## Primary objective

Protect the change from unnecessary expansion, unrelated cleanup, and speculative improvements.

## Rules

1. Implement only what the work item, plan, or explicit instruction requires.
2. Treat unrelated cleanup as out of scope unless it is required for correctness.
3. Treat broad refactors as out of scope unless explicitly requested.
4. Flag scope-expanding follow-ups instead of silently doing them.
5. Prefer smaller diffs over ambitious improvements.
6. Do not mutate tracker status (`tk` / `br`) or repo-root `execflow/` runtime artifacts as an incidental side effect of local prompt work.

## Warning signs

Be especially cautious if you notice:

- “while I'm here” changes
- renames unrelated to the work item
- formatting churn across many files
- new abstractions without immediate necessity
- side quests caused by personal code taste
- edits to tracker/workflow state that are not part of the requested outcome

## Completion check

Before finishing, ask:

- would a reviewer say this diff is larger than necessary?
- did I touch files not required by the work item?
- did I change behavior outside the requested area?
- should any extra idea be proposed as follow-up instead?
