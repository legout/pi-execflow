---
description: Add a final work-item note and close it when validation and review evidence prove acceptance criteria
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5-turbo
thinking: medium
fresh: true
skill: finalize
restore: true
---

You are finalizing exactly one work item after implementation, validation, and optional review.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and determine whether it is a `.tickets/` / `tk` item, a `.beads/` / `br` item, or some other tracker-backed work item.
2. Inspect the current ticket state with:
   - `tk show <ticket>` for `tk` tickets
   - `RUST_LOG=error br show <ticket> --json` for `br` tickets
3. Find the latest implementation/validation evidence from either:
   - `/validation-fix` in the TDD path, or
   - `/ef-work` in the quick path.
4. Find the latest review evidence when the current chain or user context includes it. `/ef-ship` runs `/ef-review-with-followups` before this step, so review evidence is required there.
5. Decide whether the outcome is:
   - `PASS` only if the latest validation evidence contains the exact line `Gate: PASS`, acceptance criteria are met, and any required review evidence is merge-ready / pass with no unresolved material findings.
   - `REVISE` if validation evidence contains `Gate: REVISE`, review says `needs-fixes`, evidence is partial/stale/ambiguous/missing, or material follow-up remains before closure.
   - `BLOCKED` if evidence contains `Gate: BLOCKED` or the work cannot be safely finalized.
6. **On strict PASS only**: commit the related code changes before closing the tracker item.
   - Run `git status` and `git diff --stat` to see what changed.
   - Stage only files belonging to this work item (no unrelated changes).
   - Commit with a Conventional Commits message: `<type>(<scope>): <summary>` — summary ≤ 72 chars, imperative mood, no trailing period.
   - Derive `type` from the work (feat, fix, refactor, test, chore, docs, perf). Omit scope if unclear.
   - If nothing changed in code, skip the commit and note "No code changes to commit."
   - Do **not** push. Do **not** add sign-offs.
7. Write one concise final tracker note:
   - `tk add-note <ticket> "..."` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br comments add --actor "$ACTOR" <ticket> --message "..." --json` for `br`
8. Close the ticket only on strict `PASS` after the commit step succeeds or is skipped because there are no code changes:
   - `tk close <ticket>` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br close --actor "$ACTOR" <ticket> --reason "..." --json` for `br`
9. If the ticket is managed by neither `tk` nor `br`, do not invent a close command. Report the exact manual follow-up instead.
10. **On REVISE or BLOCKED**: do **not** commit. Leave changes in the working tree.

## Closure evidence policy

There are two supported validation sources:

- TDD path evidence from `/validation-fix`: requires `Gate: PASS` plus acceptance-criteria evidence. When RED/GREEN proof or an explicit RED exemption is required by the ticket/spec, it must be present.
- Quick path evidence from `/ef-work`: requires `Gate: PASS`, acceptance-criteria evidence, quick validation or explicit inspection evidence, the standard quick-path RED exemption, and a clean self-review.

Review evidence is optional only when finalizing after `/ef-work` or `/ef-work-tdd` directly. When review evidence is present, do not close if the latest review verdict is `needs-fixes`, `failed`, `blocked`, or includes unresolved critical/major material findings. For `/ef-ship` and `/ef-ship-tdd`, review evidence is part of the chain and must support closure.

## Rules

- Be conservative: do not close unless the latest evidence supports closure.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Do not claim review was clean unless the final review verdict is merge-ready / pass with no unresolved material issues.
- Prefer `Gate: PASS`, `Gate: REVISE`, and `Gate: BLOCKED` note prefixes.
- Keep the note short, factual, and specific.
- For `br`, use `br comments add` as the note/comment equivalent; there is no `br notes` subcommand in the installed CLI.
- For `br`, always include `--actor "$ACTOR"` and prefer `--json`.

## Note policy

Use this style for tracker comments / notes:

- PASS without review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review not run.`
- PASS with clean review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review clean.`
- REVISE: `Gate: REVISE — <short summary>. Validation/review still needs follow-up: <brief reason>.`
- BLOCKED: `Gate: BLOCKED — <short summary>. Cannot finalize safely: <brief reason>.`

For `tk`, write that text with `tk add-note`.
For `br`, write that text with `br comments add --message ...` and use a concise closure reason for `br close` on PASS.

Include only concrete facts that are supported by evidence.

## Output format

Use exactly these sections:

# Finalization Decision

- Ticket:
- Ticket system: tk / br / other
- Outcome: PASS / REVISE / BLOCKED
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

- Validation source: /ef-work / /validation-fix / explicit user evidence / missing
- Validation status:
- Review status:
- Remaining follow-up:
