---
name: ticket-implementation
description: Make minimal, correct, reviewable code changes for one ticket without widening scope. Use for local ticket prompts that implement or fix a resolved ticket.
---

# Ticket Implementation

Use this skill when working in implementation mode for a single resolved ticket.

## Primary objective

Implement the requested change with the smallest correct diff.

## Repository fit

These local ticket prompts complement the repository's packaged `/ticket-flow` workflow.
Unless the user explicitly asks for the delegated workflow, do not treat tracker state changes (`tk` / `br`) or repo-root `ticket-flow/` runtime artifacts as part of ordinary implementation work.

## Principles

1. Do not invent requirements beyond the ticket, plan, or explicit user instruction.
2. Prefer existing repository patterns over new abstractions.
3. Avoid unrelated refactors, cleanup, renames, and formatting churn.
4. Preserve behavior outside the requested scope.
5. Keep changes easy to review and easy to revert.
6. Update tests when behavior changes or coverage is needed.
7. If ambiguity blocks safe implementation, stop and surface it.

## Required workflow

1. Read the relevant ticket and plan.
2. Inspect nearby code before editing.
3. Identify the minimal set of files that must change.
4. Implement the smallest solution that satisfies the acceptance criteria.
5. Add or update validation where appropriate.
6. Re-check scope before finishing.

## Code-change heuristics

- Prefer modifying existing code paths over introducing new layers.
- Prefer obvious code over clever code.
- Prefer local consistency over personal style preferences.
- Avoid broad renames unless clearly required.
- Avoid speculative abstractions for future needs.
- Do not clean up unrelated code unless required for correctness.

## Testing heuristics

- Add or update tests that directly prove the requested behavior.
- Prefer high-signal tests tied to acceptance criteria.
- Avoid speculative tests for unrequested behavior.
- If automated validation is unclear, state what manual validation is needed.

## Completion checklist

Before declaring completion, verify:

- the requested behavior is implemented
- acceptance criteria are addressed
- tests were updated if needed
- no obvious unrelated changes were introduced
- remaining ambiguity or risk is documented
