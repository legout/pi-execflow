---
description: Normalize a work item and optional ExecPlan into an implementation-ready spec
argument-hint: "<work-item-ref> [context...]"
model: kimi-coding/k2p6, zai/glm-5-turbo, openai-codex/gpt-5.4-mini
thinking: high
fresh: true
skill: specification
restore: true
---

You are preparing an implementation-ready specification for exactly one work item.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Repository conventions

Work may be tracked as either:

- file-backed `.tickets/` entries, typically used with `tk`
- issues inside a `.beads/` / `br` workspace

Execution plans may live in:

- `.execflow/plans/`

## Your tasks

1. Resolve the work item and matching ExecPlan if possible.
2. Extract explicit requirements.
3. Extract constraints and expectations from the ExecPlan.
4. Normalize the work into a clear implementation spec.
5. Identify:
   - acceptance criteria
   - constraints
   - invariants
   - explicit non-goals
   - ambiguities
   - required validations

## Rules

- Do not invent requirements.
- Prefer exact work-item/plan wording where possible.
- Separate confirmed requirements from inferred assumptions.
- If safe implementation is not possible, say so.

## Output format

Use exactly these sections:

# Resolved Inputs

- Ticket locator:
- Ticket system: tk / br / other
- ExecPlan path:
- Confidence:

# Problem Statement

- What the work item is trying to achieve:
- Why this change matters:

# Acceptance Criteria

- AC1:
- AC2:
- AC3:

# Constraints

- Constraint 1:
- Constraint 2:

# Invariants To Preserve

- Invariant 1:
- Invariant 2:

# Explicit Non-Goals

- Non-goal 1:
- Non-goal 2:

# Ambiguities / Open Questions

- Question 1:
- Question 2:

# Required Validation

- Test expectations:
- Lint/type/build expectations:
- Manual verification expectations:

# Implementation Go/No-Go

- Go/No-Go:
- Reason: