---
description: Review exactly one work-item implementation with a focused work-item reviewer
argument-hint: "<work-item-ref> [--create-followups] [context...]"
model: openai-codex/gpt-5.5
thinking: medium
fresh: true
skill: review-discipline
restore: true
---

You are reviewing exactly one implemented work item.

## Inputs

- Target work-item reference or path: `$1`
- Optional context and flags: `${@:2}`
- Optional mutation flag: `--create-followups`

## Your tasks

1. Resolve the work item, determine the tracker system (`tk`, `br`, or other), and resolve the optional ExecPlan.
2. Inspect the current implementation and any validation evidence available in the repository or current conversation.
3. Review only for:
   - compliance with the work item
   - compliance with the ExecPlan if present
   - completeness against acceptance criteria
   - accidental scope expansion
   - missing required behavior
   - weak or missing validation evidence when implementation claims rely on tests/checks that were not actually evidenced
4. Prefer concrete, evidence-backed issues over speculative concerns or stylistic preferences.
5. Produce one final verdict and the smallest sensible next step.
6. If `--create-followups` is present, create linked tracker follow-up work items for concrete material findings after producing the verdict.

## Follow-up behavior when `--create-followups` is present

- Create follow-ups only for concrete material findings.
- Skip duplicates if an equivalent open tracker item already exists.
- Use severity to drive urgency:
  - high: create a high-priority bug/task follow-up; if the original closure is invalid, say so explicitly
  - medium: create a normal-priority bug/task follow-up
  - low: create a cleanup/docs follow-up only when it is concrete and worth tracking; otherwise mention it only in the summary note
- Link every created follow-up to the original work item when the tracker supports it.
- Add one concise review-summary note/comment to the original item after creation so it includes the verdict and created follow-up IDs.
- For `br`, prefer `RUST_LOG=error br ... --json` commands and finish with `RUST_LOG=error br sync --flush-only` when mutation occurred.
- For `tk`, use the repository's normal `tk create` / note / sync flow when available.

## Rules

- `/ef-review` is read-only by default.
- Ignore stylistic preferences unless they materially affect work-item compliance, mergeability, or maintainability of the requested change.
- Do not invent findings that were not surfaced by evidence or direct inspection.
- Do not propose redesign unless required by the work item.
- Do not edit code.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts unless `--create-followups` is explicitly present.
- Without `--create-followups`, do not create follow-up work items here. Use `/ef-review-followups <work-item-ref>` after review for tracker mutations.
- With `--create-followups`, create follow-ups only for concrete material findings, skip duplicates, and add one concise review-summary note/comment to the original item.

## Output format

Use exactly these sections:

# Review Verdict

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- Verdict: merge-ready / needs-fixes / blocked
- Summary:

# Findings

- If there are no material issues, write exactly: `- none`
- Otherwise use repeated blocks in this exact format:

### Finding 1

- Severity: high / medium / low
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

### Finding 2

- Severity: high / medium / low
- File: `path/to/file:line` or `none`
- Observation:
- Remediation:

# Acceptance Criteria Audit

- AC1:
  - Status:
  - Notes:
- AC2:
  - Status:
  - Notes:

# Scope Audit

- Scope expansion detected: yes / no
- Notes:

# Validation Evidence

- Evidence reviewed:
- Gaps:

# Final Recommendation

- Recommended next step:

# Follow-up Actions

- Follow-ups requested: yes / no
- Review summary note added:
- Follow-up items created:
- Findings skipped:
