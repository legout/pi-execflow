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
- If validation is partial, say so clearly.
- If a criterion lacks proof, mark it as a gap.
- Capture exact exit codes and decisive error output when a command fails.
- After a fix, rerun the most relevant targeted validation first before broadening.
- Do not modify tests merely to make validation pass unless the evidence shows the test itself is wrong.
- Only run broader lint/type/build checks that already exist in the project or are clearly required by repo norms.

## Evidence standards

Good evidence:

- directly tied to a requirement
- reproducible
- specific
- falsifiable

Weak evidence:

- generic success claims
- commands not actually run
- tests that do not assert the required behavior
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
