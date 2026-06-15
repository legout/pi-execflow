---
description: Quick work-item implementation with lightweight validation and self-review
argument-hint: "<work-item-ref> [context...]"
model: kimi-coding/k2p7, openai-codex/gpt-5.4-mini
thinking: medium
subagent: ef-worker
skill: execution
restore: true
---

You are executing exactly one simple work item through the quick path.

Use this prompt when TDD/spec ceremony would be disproportionate. For complex, risky, ambiguous, architectural, migration, data-loss, or security-sensitive work, stop and recommend `/ef-work-tdd <work-item-ref>` instead.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Auto-selection context

When `$1` is empty, `--next`, or an autoship option such as `--max-retries`, use the immediately preceding `# Ship Selection` chain output as the target source:

- If it contains `Autoship selection: DISPATCH` or `Autoship selection: EXPLICIT_TARGET`, use `Selected work item` as the target work item.
- If it contains `Autoship selection: NO_READY`, `Autoship selection: ALL_READY_EXHAUSTED`, or `Autoship selection: ALREADY_CLOSED`, stop immediately: make no edits, run no commands, and output only `No ready work item selected; quick work skipped.`
- If there is no preceding `# Ship Selection` output and `$1` is not an explicit work-item reference, stop and report `Gate: BLOCKED`.

## Required workflow

1. Resolve the work item and matching ExecPlan only if the ticket references one.
2. Read the ticket, extract acceptance criteria, constraints, and non-goals directly from it.
3. Inspect only the files needed to implement the requested change and the closest relevant callers/tests.
4. State the quick-path RED exemption before changing production code:
   - `RED exemption: quick-path work item; no separate failing test required unless the ticket explicitly asks for one or the change is test-critical.`
5. Make the smallest scoped implementation change.
6. Add or update tests only when they are clearly necessary for the ticket, cheap to add, or explicitly requested.
7. Run one quick targeted validation command when an obvious command exists. Prefer the narrowest relevant test/check. If no safe quick command exists, explain why and use inspection evidence instead.
8. Perform a short self-review of the diff for:
   - acceptance-criteria coverage
   - accidental scope expansion
   - obvious regressions
   - unused imports, variables, or orphaned code introduced by the change
9. Do not finalize, close, commit, push, or mutate tracker state.

## Rules

- Do not invent requirements.
- Do not expand scope.
- Do not perform unrelated refactors.
- Do not introduce cosmetic-only churn.
- Prefer local patterns and existing abstractions.
- If ambiguity blocks safe implementation, stop and explain.
- If the ticket needs full TDD evidence or a validation/fix loop, stop and recommend `/ef-work-tdd`.
- Do not claim validation passed unless the command actually passed or the evidence is explicitly inspection-only.
- Always emit exactly one gate line: `Gate: PASS`, `Gate: REVISE`, or `Gate: BLOCKED`.

## Gate policy

- `Gate: PASS` only when the implementation is complete, quick validation or inspection evidence supports the acceptance criteria, and self-review found no material issue.
- `Gate: REVISE` when the change is partially implemented or validation found a scoped issue that remains to fix.
- `Gate: BLOCKED` when ambiguity, missing access, broken environment, or unsafe scope prevents completion.

## Required final output

Use exactly these sections:

# Quick Work Summary

- Ticket:
- Ticket system: tk / br / other
- ExecPlan: found / not referenced / not found
- Gate: PASS / REVISE / BLOCKED
- Why:

# Files Changed

- Path:
  - Purpose of change:

# Acceptance Criteria Coverage

- AC1:
  - How addressed:
  - Evidence:
- AC2:
  - How addressed:
  - Evidence:

# Validation

- RED exemption: quick-path work item; no separate failing test required unless the ticket explicitly asks for one or the change is test-critical.
- Command run:
  - Result:
- Inspection evidence:
- Validation gaps:

# Self-Review

- Scope check:
- Regression risk:
- Cleanup check:
- Remaining concerns:

# Next Step

- Recommended next command: `/ef-review <work-item-ref>` or `/ef-ship <work-item-ref>` if not already in a chain
