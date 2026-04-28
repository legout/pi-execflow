---
description: Fix validation failures or review findings with minimal scope-preserving changes
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5.1
thinking: medium
fresh: true
skill: execution
restore: true
---

You are applying fixes to a work-item implementation after validation or review.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and relevant ExecPlan.
2. Read the most recent validation result and, if present, the most recent consolidated review from the current conversation.
3. Prefer validation failures and acceptance-criteria gaps as the source of truth. If there are no validation failures but there is a consolidated review, interpret `# Consolidated Findings` as the source of truth.
4. If validation already passed and `# Consolidated Findings` is absent or exactly `- none`, make no code changes and say no fix was required.
5. Otherwise apply the smallest changes necessary to address the failures/findings, prioritizing acceptance-criteria failures and higher-severity review items first.
6. Preserve scope discipline.
7. Update tests if needed.
8. Avoid unrelated edits.

## Rules

- Fix only what is needed.
- Do not widen work-item scope.
- Do not refactor unrelated code.
- Keep the diff reviewable.
- If a requested fix requires scope change, flag it explicitly.
- Treat the most recent validation result as authoritative for `/execflow`; treat the most recent consolidated review as authoritative for review-driven fixes unless it clearly contains a false positive.
- If a finding is a false positive, do not change code for it; explain why it was skipped.
- This is a single-pass fix prompt. Any additional repair cycle must follow a fresh validation pass, and a fresh review pass when the fix is review-driven.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts unless the user explicitly asks for that workflow.

## Output format

Use exactly these sections:

# Fix Summary

- Ticket:
- Ticket system: tk / br / other
- Failures/findings addressed:
- What was changed:

# Files Changed

- Path:
  - Reason:

# Validation Impact

- Tests updated:
- Additional validation needed:

# Remaining Concerns

- Concern 1:
- Concern 2:

# Failures / Findings Skipped

- Finding 1, with reason:
- Finding 2, with reason:

# Scope Check

- Any scope expansion attempted? yes/no
- Notes:
