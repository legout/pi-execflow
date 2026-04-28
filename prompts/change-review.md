---
description: Review arbitrary branch, diff, or path-scoped code changes
argument-hint: "[--base <ref>] [--create-followups] [paths/context...]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: review-suite
restore: true
---

You are reviewing a set of code changes that may not map to a single execflow work item.

## Inputs

- Optional base ref flag: `--base <ref>`
- Optional mutation flag: `--create-followups`
- Optional paths or freeform review focus: `$@`

## Scope

This is a broad engineering review of the current change set, branch diff, or requested paths.
It is not a ticket acceptance gate. If the user wants one work-item review, recommend `/ef-review <work-item>`.

Review for:

- correctness and real bugs
- regression and compatibility risk
- test adequacy and weak validation evidence
- maintainability and local consistency
- architecture boundary problems
- security, data-loss, or migration hazards where applicable
- merge readiness

## Required workflow

1. Determine the review target:
   - if `--base <ref>` is present, inspect the diff against that ref
   - if paths are present, review those paths and relevant diffs
   - otherwise review current uncommitted changes and/or current branch diff using repository evidence
2. Keep findings concrete and evidence-backed. Prefer exact files and lines when available.
3. De-duplicate related findings into actionable groups.
4. Do not mutate tracker state unless `--create-followups` is present.
5. If `--create-followups` is present, create tickets/issues only for high/medium actionable findings and only after checking for obvious duplicates.

## Follow-up creation policy for `--create-followups`

- High severity: create a bug/task follow-up unless an equivalent open item exists.
- Medium severity: create a follow-up when the finding is concrete and merge-relevant.
- Low severity: do not create a follow-up by default; include it in notes unless the user explicitly asked to track low-severity items.
- If more than five follow-ups would be created, stop after listing candidates and ask for confirmation instead of creating tracker noise.

For `br`, prefer `br create --actor "$ACTOR" ... --json`. For `tk`, use the repository's normal `tk create` flow. Include the reviewed base/ref/path context in every follow-up description.

## Output format

Use exactly these sections:

# Change Review Verdict

- Review target:
- Base/ref:
- Verdict: merge-ready / needs-fixes / blocked / informational
- Confidence: high / medium / low
- Summary:
- Follow-ups requested: yes / no

# Findings

- If there are no material issues, write exactly: `- none`
- Otherwise use repeated blocks:

### Finding 1

- Severity: high / medium / low
- Category: correctness / regression / tests / maintainability / architecture / security / other
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

# Validation and Test Evidence

- Evidence reviewed:
- Missing evidence:
- Recommended commands:

# Follow-up Decisions

- Follow-ups created, if `--create-followups` was requested:
- Findings intentionally not ticketed:
- Duplicate or existing items found:

# Recommended Next Actions

- Action 1:
- Action 2:
