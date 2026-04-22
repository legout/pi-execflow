---
name: testing
description: Derive high-signal validation from work-item acceptance criteria and assess the quality of test evidence. Use for test planning, validation, and review of test adequacy.
---

# Testing

Use this skill when designing or assessing work-item validation.

## Primary objective

Design or assess tests that directly prove the required behavior with minimal waste.

## Resolution dependency

If the task starts from a work-item reference rather than an already-open work-item document or a prior chain step that already resolved the work item, first read `../resolve/SKILL.md` and follow it.

This matters especially for `.beads/` / `br` workflows, where resolution must use `br` CLI commands rather than file globbing.

## Principles

1. Map every acceptance criterion to at least one validation method.
2. Prefer high-signal tests over broad speculative coverage.
3. Cover happy path, key edges, important failures, and regression risk.
4. Distinguish automated validation from manual validation.
5. Distinguish evidence from assumption.

## Command discovery order

When inferring validation commands, inspect the project in this order:

1. `package.json`
2. `pyproject.toml`, `setup.cfg`, `tox.ini`
3. `Makefile`, `justfile`, task runners
4. CI configs such as `.github/workflows/*` or `.gitlab-ci.yml`

Prefer existing project commands over inventing ad hoc ones.

## Test heuristics

- Prefer tests that prove externally visible behavior.
- Avoid brittle tests that overfit implementation details unless necessary.
- Avoid speculative tests for behavior the ticket does not require.
- Strengthen weak assertions when they do not actually prove the requirement.
- If no reliable automated test is obvious, document the manual check clearly.
- Capture exact test names, files, and commands when discussing failures or gaps.
- After a fix, rerun the most relevant test first, then widen only as needed.
- Do not change test expectations merely to make failures pass unless the ticket or review evidence proves the test itself is wrong.

## Evidence checklist

Before declaring a criterion covered, verify:

- the test targets the right behavior
- the assertion would fail if the behavior were wrong
- the validation is relevant to the work item
- important edge/failure behavior is not silently untested

## Failure analysis checklist

When a test fails, capture:

- exact command run
- failing test name and file, if available
- decisive assertion or error message
- whether the failure is ticket-caused, unrelated, or still unclear
