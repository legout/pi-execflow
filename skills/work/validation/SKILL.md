---
name: validation
description: Validate work-item changes using concrete evidence, exact commands, and explicit gap reporting. Use for validation prompts and review passes that audit proof.
---

# Validation

Use this skill when determining whether a work-item implementation is actually proven correct.

## Primary objective

Determine whether the implementation is actually proven correct, not merely plausible.

## Resolution dependency

If the task starts from a work-item reference rather than an already-resolved context, first read `../resolve/SKILL.md` and resolve the tracker system correctly.

For `.beads/` / `br` work, do not assume a file-backed work-item path exists.

## Validation priorities

1. Acceptance criteria evidence
2. Relevant automated tests
3. Lint/type/build health where applicable
4. Manual verification where automation is insufficient
5. Explicit reporting of gaps

## RED/GREEN evidence classes

Classify validation evidence explicitly:

- `RED proof`: evidence that the selected test/command/assertion/manual check failed before the production change for the expected reason.
- `GREEN proof`: evidence that the same targeted proof passed after the minimal implementation change.
- `Regression validation`: broader tests, lint, typecheck, build, smoke checks, or manual checks that show existing behavior still holds.
- `RED exemption`: explicit reason RED proof is not required, such as docs-only work, planning-only work, exploratory spike, or an untestable environment constraint, plus the alternate evidence used.

For testable behavior, `Gate: PASS` requires RED proof and GREEN proof, not only broad regression validation. If RED proof is missing and no exemption is recorded, the outcome is `Gate: REVISE` even if the final test suite passes.

## Command discovery order

When choosing validation commands, inspect the project in this order:

1. `package.json`
2. `pyproject.toml`, `setup.cfg`, `tox.ini`
3. `Makefile`, `justfile`, task runners
4. CI configs such as `.github/workflows/*` or `.gitlab-ci.yml`

Prefer established project commands over custom one-off commands.

## Rules

- Prefer exact commands over generic advice.
- Distinguish executed validation from recommended validation.
- Distinguish passing evidence from unverified assumptions.
- Distinguish RED proof, GREEN proof, regression validation, and RED exemptions.
- If validation is partial, say so clearly.
- If a criterion lacks proof, mark it as a gap.
- For branch-ref remediation or merge-ready branch work, validate the artifact named by the work item. If the requirement mentions publishing, a remote branch, a PR/review branch, or merge readiness, fetch and inspect `origin/<branch>` when available; local-only branch refs are insufficient for `Gate: PASS` unless the work item explicitly says local validation is enough.
- Capture exact exit codes and decisive error output when a command fails.
- After a fix, rerun the most relevant targeted validation first before broadening.
- Do not modify tests merely to make validation pass unless the evidence shows the test itself is wrong.
- Only run broader lint/type/build checks that already exist in the project or are clearly required by repo norms.
- Do not treat a final passing command as RED proof unless the pre-change failing run and expected failure signal are recorded.

## Gate output

When reporting validation for a work item, include a gate line and evidence summary:

```text
Gate: PASS | REVISE | BLOCKED
RED proof: <command/check + expected failure, or exemption reason>
GREEN proof: <same targeted command/check passing, or not applicable with reason>
Regression validation: <broader commands/checks run, or not run>
Gaps: <missing evidence, or none>
```

Use `Gate: PASS` only when all acceptance criteria are proven and either RED/GREEN evidence exists for testable behavior or a RED exemption is explicit and justified.

## Evidence standards

Good evidence:

- directly tied to a requirement
- reproducible
- specific
- falsifiable
- labeled as RED, GREEN, regression, or exemption evidence

Weak evidence:

- generic success claims
- commands not actually run
- tests that do not assert the required behavior
- final passing tests with no recorded RED proof or exemption for testable behavior
- hand-wavy should-work reasoning

## Stuck detection

Report validation as stuck or blocked when:

- the same failure repeats with no meaningful progress
- multiple attempts converge on the same unresolved blocker
- no reliable validation command exists and the gap cannot be closed from repo context

When stuck, report:

- the command(s) attempted
- the repeated or decisive failure signal
- what would be needed to continue safely
