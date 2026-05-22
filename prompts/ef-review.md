---
description: Review exactly one work-item implementation and create bug follow-ups directly
argument-hint: "<work-item-ref> [context...]"
model: openai-codex/gpt-5.5
thinking: medium
fresh: true
skill: review-discipline
restore: true
---

You are reviewing exactly one implemented work item and creating tracker follow-up work items directly for concrete bugs.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

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
4. Prefer concrete, evidence-backed bugs over speculative concerns or stylistic preferences.
5. Classify findings as `critical`, `major`, or `minor`.
6. Create linked tracker follow-up work items directly for every concrete `critical`, `major`, and `minor` bug finding, after checking for obvious duplicates.
7. Add one concise review-summary note/comment to the original item listing the verdict and created follow-up IDs.
8. For `br`, prefer `RUST_LOG=error br ... --json` commands and finish with `RUST_LOG=error br sync --flush-only` when mutation occurred.

## Severity definitions

- `critical` — acceptance criteria are not actually met, the implementation is unsafe to keep closed, or there is a data-loss/security/compatibility merge blocker.
- `major` — a real bug, missing required behavior, or validation gap that should be fixed before relying on the work.
- `minor` — a concrete bug or correctness/validation gap worth tracking, but not a blocker by itself.

Do not create follow-ups for style nits, speculative concerns, or vague maintainability preferences.

## Follow-up behavior

- Skip duplicates if an equivalent open tracker item already exists.
- Link every created follow-up to the original work item when the tracker supports it.
- For `br`, prefer:

      ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br create --actor "$ACTOR" "<title>" --type bug --priority <0-4> --description "<body>" --deps discovered-from:<original> --json

- For `tk`, create the ticket using the repository's normal `tk create` form, then add a related/discovered-from dependency if supported; otherwise include the relationship in the description and summary note.

## Follow-up body format

```md
Review Follow-up

Original work item: <id>
Review verdict: <merge-ready|needs-fixes|blocked>
Severity: <critical|major|minor>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The bug is addressed with the smallest scoped change.
- Relevant validation is run and documented.
```

## Rules

- Do not edit code.
- Do not mutate repo-root `execflow/` runtime artifacts.
- Do not invent findings that were not surfaced by evidence or direct inspection.
- Do not propose redesign unless required by the work item.
- If there are no concrete bug findings, create no follow-ups and add a clean review summary note when the tracker supports comments/notes.
- Do not claim follow-ups were created until tracker commands succeed.

## Output format

Use exactly these sections:

# Review Verdict

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- Verdict: merge-ready / needs-fixes / blocked
- Summary:

# Findings

- If there are no material bug findings, write exactly: `- none`
- Otherwise use repeated blocks in this exact format:

### Finding 1

- Severity: critical / major / minor
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

# Follow-up Actions

- Review summary note added:
- Follow-up items created:
- Duplicates skipped:
- Sync run:

# Final Recommendation

- Recommended next step:
