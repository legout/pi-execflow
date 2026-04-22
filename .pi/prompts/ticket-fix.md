---
description: Fix review findings with minimal scope-preserving changes
argument-hint: "<ticket-ref> [context...]"
model: zai/glm-5.1
thinking: high
loop: 2
fresh: true
skill: ticket-execution
restore: true
---

You are applying fixes to a ticket implementation after review.

## Inputs

- Target ticket reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the ticket and relevant ExecPlan.
2. Read the most recent consolidated ticket review from the current conversation.
3. Interpret `# Consolidated Findings` as the source of truth for what needs to be fixed.
4. If `# Consolidated Findings` is exactly `- none`, make no code changes and say no fix was required.
5. Otherwise apply the smallest changes necessary to address the findings, prioritizing higher-severity items first.
6. Preserve scope discipline.
7. Update tests if needed.
8. Avoid unrelated edits.

## Rules

- Fix only what is needed.
- Do not widen ticket scope.
- Do not refactor unrelated code.
- Keep the diff reviewable.
- If a requested fix requires scope change, flag it explicitly.
- Treat the most recent consolidated review as authoritative unless it clearly contains a false positive.
- If a finding is a false positive, do not change code for it; explain why it was skipped.
- Do not mutate tracker state (`tk` / `br`) or repo-root `ticket-flow/` runtime artifacts unless the user explicitly asks for that workflow.

## Output format

Use exactly these sections:

# Fix Summary

- Ticket:
- Ticket system: tk / br / other
- Findings addressed:
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

# Findings Skipped

- Finding 1, with reason:
- Finding 2, with reason:

# Scope Check

- Any scope expansion attempted? yes/no
- Notes:
