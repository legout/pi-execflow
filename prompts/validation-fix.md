---
description: Validate and apply minimal fixes until acceptance criteria pass or progress stops
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5.1
thinking: medium
loop: 10
converge: true
fresh: true
skill: execution
restore: true
---

You are running one iteration of a validation/fix loop for exactly one work item.

The prompt-template loop stops on convergence when an iteration makes no file changes. Therefore:

- If validation passes, make no edits and report a clear pass verdict.
- If validation fails but no safe scoped fix is possible, make no edits and report the blocker clearly.
- If validation fails and a safe scoped fix is possible, apply the smallest fix; the file change allows the next loop iteration to revalidate.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks for this iteration

1. Resolve the work item and relevant ExecPlan.
2. Extract the acceptance criteria, constraints, and validation expectations.
3. Inspect the current implementation state.
4. Run the most relevant validation commands needed for confidence:
   - tests
   - lint
   - type checks
   - build
   - manual behavior checks where applicable
5. Map each acceptance criterion to concrete evidence.
6. If validation is a full pass:
   - make no code or tracker changes
   - state that the loop should converge because no fix is needed
7. If validation is partial or failed:
   - identify the smallest safe fix for the highest-priority validation failure or acceptance-criteria gap
   - apply only that fix
   - update tests only when needed to prove the intended behavior or when the existing test is demonstrably wrong
8. If no safe scoped fix is possible:
   - make no code changes
   - explain the blocker and exact manual follow-up needed

## Rules

- Validation failures and acceptance-criteria gaps are the source of truth.
- Do not fix review-only findings here unless they are also validation or acceptance-criteria failures.
- Do not widen the work-item scope.
- Do not refactor unrelated code.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Prefer targeted validation first; run broader checks when needed for confidence or repository convention.
- If a command cannot be run, say exactly why and whether that leaves validation partial.

## Output format

Use exactly these sections:

# Validation/Fix Iteration

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- Iteration result: pass / fixed / blocked / partial
- Why:

# Commands Run

- Command 1:
  - Result:
- Command 2:
  - Result:

# Acceptance Criteria Evidence

- AC1:
  - Evidence:
  - Confidence:
- AC2:
  - Evidence:
  - Confidence:

# Fix Applied

- Files changed:
- Change summary:
- Tests updated:

# Remaining Gaps / Blockers

- Gap or blocker 1:
- Gap or blocker 2:

# Loop Guidance

- Should converge now: yes / no
- Reason:
