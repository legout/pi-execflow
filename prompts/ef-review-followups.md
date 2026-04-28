---
description: Create linked tracker follow-ups from a consolidated work-item review
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5-turbo
thinking: medium
restore: true
---

You are converting the most recent consolidated review for exactly one work item into tracker follow-up work.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Review tracking policy

- `/ef-review` is intentionally read-only and fresh by default: it produces an independent consolidated verdict without mutating tracker state.
- `/ef-review --create-followups <work-item>` may combine review and follow-up creation in one command when the user explicitly opts in.
- `/ef-review-followups` is the explicit mutation step: it records a concise review summary on the original work item and creates linked follow-up work items for material findings.
- `/ef-review` is the canonical work-item review command.
- The original work item may already be closed by `/ef-implement` after validation. Do not reopen it unless a high-severity finding shows that acceptance criteria were not actually met or the implementation is unsafe to keep closed.
- Follow-up work items must reference the original work item and the review verdict so the audit trail stays explicit.

## Your tasks

1. Resolve the target work item and determine whether it is a `.tickets/` / `tk` item, a `.beads/` / `br` item, or another tracker-backed item.
2. Inspect the current item state with:
   - `tk show <ticket>` for `tk` tickets
   - `RUST_LOG=error br show <issue> --json` for `br` issues
3. Read the most recent `# Review Verdict` / `# Consolidated Findings` from the current conversation. If no consolidated review is available, stop and tell the user to run `/ef-review $1` first.
4. For each material consolidated finding, create a follow-up item unless it is clearly duplicate, speculative, or too vague to act on.
5. Use severity to decide tracking behavior:
   - high: create a high-priority bug/task follow-up; if the original closure is invalid, explicitly recommend reopening the original
   - medium: create a normal-priority bug/task follow-up
   - low: create a low-priority cleanup/docs follow-up only when it is concrete and worth tracking; otherwise mention it only in the summary note
6. Link every created follow-up to the original:
   - for `br`, prefer `br create --actor "$ACTOR" "<title>" --type <bug|task|docs> --priority <0-4> --description "<body>" --deps discovered-from:<original> --json`
   - for `tk`, create the ticket using the repository's normal `tk create` form, then add a related/discovered-from dependency if supported by the installed `tk` CLI; if not supported, include the relationship in the description and note
7. Add one concise review-summary note/comment to the original item after follow-up creation so it can include the created IDs:
   - `tk add-note <ticket> "Review: <verdict>; follow-ups created: <ids-or-none>."`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br comments add --actor "$ACTOR" <issue> --message "Review: <verdict>; follow-ups created: <ids-or-none>." --json`
8. Run tracker sync if the tracker requires it:
   - `RUST_LOG=error br sync --flush-only` for `br`
   - the repository's normal `tk` sync/export command only if one is configured

## Follow-up body format

Each follow-up description should include:

```md
Review Follow-up

Original work item: <id>
Review verdict: <merge-ready|needs-fixes|blocked>
Severity: <high|medium|low>
Lens: <spec|regression|tests|maintainability>
Source finding: <short quote or paraphrase>
Required remediation: <specific action>
Acceptance criteria:
- The finding is addressed with the smallest scoped change.
- Relevant validation is run and documented.
```

## Rules

- Do not create follow-ups for `# Consolidated Findings` equal to exactly `- none`.
- Do not create duplicate follow-ups for the same finding if an equivalent open item already exists.
- Do not silently downgrade high-severity findings; explain the chosen action.
- Do not claim review follow-ups were created until tracker commands succeeded.
- Keep the original implementation ticket's validation closure semantics separate from review follow-up tracking.

## Output format

Use exactly these sections:

# Review Follow-up Decision

- Original item:
- Ticket system: tk / br / other
- Review verdict:
- Material findings:
- Original item should be reopened: yes / no
- Why:

# Tracker Actions

- Review summary note added:
- Follow-up items created:
- Dependencies / references added:
- Sync run:

# Follow-up Details

- Follow-up 1:
  - ID:
  - Severity:
  - Title:
  - Source finding:
- Follow-up 2:
  - ID:
  - Severity:
  - Title:
  - Source finding:

# Skipped Findings

- Finding:
  - Reason:

# Manual Follow-up

- Item:
