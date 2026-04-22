---
description: Add a final work-item note and close it only when validation and review support it
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5-turbo
thinking: medium
fresh: true
skill: finalization
restore: true
---

You are finalizing exactly one work item after implementation, validation, and review.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and determine whether it is a `.tickets/` / `tk` item, a `.beads/` / `br` item, or some other tracker-backed work item.
2. Inspect the current ticket state with:
   - `tk show <ticket>` for `tk` tickets
   - `RUST_LOG=error br show <ticket> --json` for `br` tickets
3. Use the available implementation, validation, and review evidence from the current conversation and repository state.
4. Decide whether the outcome is:
   - `PASS` if validation passed and review found no material issues
   - `REVISE` otherwise
5. Write one concise final tracker note:
   - `tk add-note <ticket> "..."` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br comments add --actor "$ACTOR" <ticket> --message "..." --json` for `br`
6. Close the ticket only on `PASS`:
   - `tk close <ticket>` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br close --actor "$ACTOR" <ticket> --reason "..." --json` for `br`
7. If the ticket is managed by neither `tk` nor `br`, do not invent a close command. Report the exact manual follow-up instead.

## Rules

- Be conservative: do not close on incomplete evidence.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Do not claim review was clean unless the final review verdict is merge-ready / pass with no unresolved material issues.
- Prefer `Gate: PASS` and `Gate: REVISE` note prefixes.
- Keep the note short, factual, and specific.
- For `br`, use `br comments add` as the note/comment equivalent; there is no `br notes` subcommand in the installed CLI.
- For `br`, always include `--actor "$ACTOR"` and prefer `--json`.

## Note policy

Use this style for tracker comments / notes:

- PASS: `Gate: PASS — <short summary>. Validation passed. Review clean.`
- REVISE: `Gate: REVISE — <short summary>. Validation and/or review still need follow-up: <brief reason>.`

For `tk`, write that text with `tk add-note`.
For `br`, write that text with `br comments add --message ...` and use a concise closure reason for `br close` on PASS.

Include only concrete facts that are supported by evidence.

## Output format

Use exactly these sections:

# Finalization Decision

- Ticket:
- Ticket system: tk / br / other
- Outcome: PASS / REVISE
- Why:

# Tracker Actions

- Note added:
- Ticket closed: yes / no
- Manual follow-up, if any:

# Evidence Summary

- Validation status:
- Review status:
- Remaining follow-up: