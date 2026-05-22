---
description: Review arbitrary branch, diff, or path-scoped code changes and create bug follow-ups directly
argument-hint: "[--base <ref>] [paths/context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: review-suite
restore: true
---

You are reviewing a set of code changes that may not map to a single execflow work item, and creating tracker follow-up work items directly for concrete bugs.

## Inputs

- Optional base ref flag: `--base <ref>`
- Optional paths or freeform review focus: `$@`

## Scope

This is a broad engineering review of the current change set, branch diff, or requested paths.
It is not a ticket acceptance gate. If the user wants one work-item review, recommend `/ef-review <work-item>`.

Review for:

- correctness and real bugs
- regression and compatibility risk
- test adequacy and weak validation evidence
- maintainability issues that create concrete bugs or merge blockers
- architecture boundary problems that create concrete bugs or merge blockers
- security, data-loss, or migration hazards where applicable
- merge readiness

## Required workflow

1. Determine the review target:
   - if `--base <ref>` is present, inspect the diff against that ref
   - if paths are present, review those paths and relevant diffs
   - otherwise review current uncommitted changes and/or current branch diff using repository evidence
2. Determine tracker system (`tk`, `br`, or other) from repository evidence.
3. Keep findings concrete and evidence-backed. Prefer exact files and lines when available.
4. De-duplicate related findings into actionable groups.
5. Classify findings as `critical`, `major`, or `minor`.
6. Create tracker follow-up work items directly for every concrete bug finding in those severities, after checking for obvious duplicates.
7. If more than five follow-ups would be created, stop after listing candidates and ask for confirmation instead of creating tracker noise.
8. For `br`, run `RUST_LOG=error br sync --flush-only` when mutation occurred.

## Severity definitions

- `critical` — data-loss/security/compatibility merge blocker, or a change that makes the branch unsafe to merge.
- `major` — real correctness bug, regression, missing required behavior, or validation gap that should be fixed before relying on the change.
- `minor` — concrete bug or correctness/validation gap worth tracking, but not a blocker by itself.

Do not create follow-ups for style nits or speculative concerns.

## Follow-up body format

```md
Change Review Follow-up

Review target: <base/ref/path/context>
Severity: <critical|major|minor>
Category: <correctness|regression|tests|maintainability|architecture|security|other>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The finding is addressed with the smallest safe change.
- Relevant validation is run and documented.
```

## Output format

Use exactly these sections:

# Change Review Verdict

- Review target:
- Base/ref:
- Verdict: merge-ready / needs-fixes / blocked / informational
- Confidence: high / medium / low
- Summary:

# Findings

- If there are no material bug findings, write exactly: `- none`
- Otherwise use repeated blocks:

### Finding 1

- Severity: critical / major / minor
- Category: correctness / regression / tests / maintainability / architecture / security / other
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

# Validation and Test Evidence

- Evidence reviewed:
- Missing evidence:
- Recommended commands:

# Follow-up Actions

- Candidate follow-ups over limit: yes / no
- Follow-up items created:
- Duplicates skipped:
- Sync run:

# Recommended Next Actions

- Action 1:
- Action 2:
