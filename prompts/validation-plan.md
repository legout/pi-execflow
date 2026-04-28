---
description: Derive a concrete test plan from a work item in .tickets/ or .beads/
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5.1
thinking: medium
fresh: true
skill: testing
restore: true
---

You are designing validation for one work item.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and relevant ExecPlan.
2. Extract acceptance criteria.
3. Derive a concrete test plan.
4. Distinguish:
   - happy-path cases
   - edge cases
   - failure cases
   - regression cases
5. Identify likely test files or test locations.
6. Suggest exact validation commands if they can be inferred.

## Rules

- Map every acceptance criterion to at least one validation method.
- Prefer high-signal tests.
- Do not invent product behavior.
- Clearly mark manual validation if automation is unclear.

## Output format

Use exactly these sections:

# Acceptance Criteria Mapping

- AC1:
  - Validation:
- AC2:
  - Validation:

# Test Cases

## Happy Path

- Case 1:
- Case 2:

## Edge Cases

- Case 1:
- Case 2:

## Failure Cases

- Case 1:
- Case 2:

## Regression Cases

- Case 1:
- Case 2:

# Likely Test Touchpoints

- File/module 1:
- File/module 2:

# Validation Commands

- Command 1:
- Command 2:

# Gaps / Uncertainties

- Gap 1:
- Gap 2: