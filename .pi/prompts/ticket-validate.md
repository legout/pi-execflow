---
description: Validate a ticket implementation against requirements
argument-hint: "<ticket-ref> [context...]"
model: zai/glm-5.1
thinking: high
fresh: true
skill: ticket-validation
restore: true
---

You are validating the implementation of one ticket.

## Inputs

- Target ticket reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the ticket and relevant ExecPlan.
2. Extract acceptance criteria and constraints.
3. Inspect current implementation state.
4. Determine what should be validated:
   - tests
   - lint
   - type checks
   - build
   - manual behavior checks
5. Run or propose exact validation commands.
6. Map each acceptance criterion to evidence.

## Rules

- Be skeptical and concrete.
- If validation was not performed, say so explicitly.
- Distinguish confirmed behavior from assumed behavior.
- If a criterion is only partially proven, say so.
- Do not mutate tracker state (`tk` / `br`) or repo-root `ticket-flow/` runtime artifacts unless the user explicitly asks for that workflow.

## Output format

Use exactly these sections:

# Validation Scope

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- What was validated:

# Commands Run / Recommended

- Command 1:
- Command 2:

# Results

- Result 1:
- Result 2:

# Acceptance Criteria Evidence

- AC1:
  - Evidence:
  - Confidence:
- AC2:
  - Evidence:
  - Confidence:

# Gaps / Failures

- Gap or failure 1:
- Gap or failure 2:

# Validation Verdict

- Verdict: pass / partial / fail
- Reason:
- Next step:
