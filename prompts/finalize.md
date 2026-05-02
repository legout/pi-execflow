---
description: Add a final work-item note and close it when validation proves acceptance criteria
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5-turbo
thinking: medium
fresh: true
skill: finalize
restore: true
---

You are finalizing exactly one work item after implementation and validation.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and determine whether it is a `.tickets/` / `tk` item, a `.beads/` / `br` item, or some other tracker-backed work item.
2. Inspect the current ticket state with:
   - `tk show <ticket>` for `tk` tickets
   - `RUST_LOG=error br show <ticket> --json` for `br` tickets
3. Use the available implementation and validation evidence from the current conversation and repository state. Review evidence is optional and must not be implied when absent.
4. Decide whether the outcome is:
   - `PASS` if validation passed and the acceptance criteria are met
   - `REVISE` otherwise
5. Write one concise final tracker note:
   - `tk add-note <ticket> "..."` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br comments add --actor "$ACTOR" <ticket> --message "..." --json` for `br`
6. Close the ticket only on `PASS`:
   - `tk close <ticket>` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br close --actor "$ACTOR" <ticket> --reason "..." --json` for `br`
7. If the ticket is managed by neither `tk` nor `br`, do not invent a close command. Report the exact manual follow-up instead.
8. **On PASS only**: commit the related code changes.
   - Run `git status` and `git diff --stat` to see what changed.
   - Stage only files belonging to this work item (no unrelated changes).
   - Commit with a Conventional Commits message: `<type>(<scope>): <summary>` — summary ≤ 72 chars, imperative mood, no trailing period.
   - Derive `type` from the work (feat, fix, refactor, test, chore, docs, perf). Omit scope if unclear.
   - If nothing changed in code, skip the commit and note "No code changes to commit."
   - Do **not** push. Do **not** add sign-offs.
9. **On REVISE**: do **not** commit. Leave changes in the working tree.

## Rules

- Be conservative: do not close on incomplete validation evidence.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Do not claim review was run or clean unless the final review verdict is merge-ready / pass with no unresolved material issues.
- Prefer `Gate: PASS` and `Gate: REVISE` note prefixes.
- Keep the note short, factual, and specific.
- For `br`, use `br comments add` as the note/comment equivalent; there is no `br notes` subcommand in the installed CLI.
- For `br`, always include `--actor "$ACTOR"` and prefer `--json`.

## Note policy

Use this style for tracker comments / notes:

- PASS without review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review not run.`
- PASS with clean review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review clean.`
- REVISE: `Gate: REVISE — <short summary>. Validation still needs follow-up: <brief reason>.`

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

# Git Commit

- Changes staged: (list files or "none")
- Commit message:
- Committed: yes / no / skipped (no changes)
- Pushed: no

# Evidence Summary

- Validation status:
- Review status:
- Remaining follow-up:
