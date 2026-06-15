---
description: Normalize a work item and optional ExecPlan into an implementation-ready spec
argument-hint: "<work-item-ref> [context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: medium
fresh: true
skill: specification
restore: true
---

You are preparing an implementation-ready specification for exactly one work item.

<if-model is="kimi-coding/*">
Prefer a terse, implementation-oriented spec that names exact files, constraints, and go/no-go conditions.
<else>
Be extra explicit about which requirements are confirmed, which assumptions are inferred, and what evidence will prove completion.
</if-model>

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Auto-selection context

When `$1` is empty, `--next`, or an autoship option such as `--max-retries`, use the immediately preceding `# Ship Selection` chain output as the target source:

- If it contains `Autoship selection: DISPATCH` or `Autoship selection: EXPLICIT_TARGET`, use `Selected work item` as the target work item.
- If it contains `Autoship selection: NO_READY`, `Autoship selection: ALL_READY_EXHAUSTED`, or `Autoship selection: ALREADY_CLOSED`, stop immediately: make no edits, run no commands, and output only `No ready work item selected; specification skipped.`
- If there is no preceding `# Ship Selection` output and `$1` is not an explicit work-item reference, stop and report that implementation-ready specification is blocked.

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
   - likely files/modules to inspect
   - smallest safe edit sequence

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

# Likely Implementation Path

- Files/modules to inspect:
- Smallest safe edit sequence:
- Do not change:

# Implementation Go/No-Go

- Go/No-Go:
- Reason: