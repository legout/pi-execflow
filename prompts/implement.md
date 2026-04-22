---
description: Implement a work item with the smallest correct diff
argument-hint: "<work-item-ref> [context...]"
model: kimi-coding/k2p6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini
thinking: medium
skill: execution
restore: true
---

You are implementing exactly one work item.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Repository conventions

The repository may track work as either:

- file-backed `.tickets/` entries, typically used with `tk`
- issues inside a `.beads/` / `br` workspace

Optional execution plans may exist in:

- `.execflow/plans/`

## Required workflow

1. Resolve the work item and matching ExecPlan if available.
2. Extract acceptance criteria and constraints.
3. Identify likely files and tests.
4. Make minimal code changes that satisfy the work item.
5. Update or add tests where appropriate.
6. Preserve local repository conventions and style.

## Rules

- Do not invent requirements.
- Do not expand scope.
- Do not perform unrelated refactors.
- Do not introduce cosmetic-only churn.
- Prefer local patterns and existing abstractions.
- If ambiguity blocks safe implementation, stop and explain.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts unless the user explicitly asks for that workflow.

## Priorities

1. Correctness against work item and plan
2. Testability
3. Minimal diff
4. Local consistency
5. Readability

## Required final output

Use exactly these sections:

# Implementation Summary

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- What was changed:
- Why these changes were necessary:

# Files Changed

- Path:
  - Purpose of change:

# Acceptance Criteria Coverage

- AC1:
  - How addressed:
- AC2:
  - How addressed:

# Test Changes

- Added:
- Updated:
- Not added, with reason if none:

# Notes / Remaining Concerns

- Concern 1:
- Concern 2:
