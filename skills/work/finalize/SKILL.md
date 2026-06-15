---
name: finalize
description: Update a work item with a concise execution note and close it only when validation and review evidence prove the acceptance criteria. Use for prompts that finalize work-item status after manual execution chains.
---

# Finalization

Use this skill when preparing the final work-item update after implementation and validation. Review evidence is required when the execution chain includes review, and optional otherwise.

## Purpose

This composite skill exists for the post-execution step where a prompt must translate evidence into a tracker update.

## Primary references

Read these sibling skills for deeper detail when needed:

- `../resolve/SKILL.md`
- `../validation/SKILL.md`
- `../review-suite/SKILL.md` when review evidence is present

## Primary objective

Add an accurate work-item note and close it only when the evidence supports closure.

## Non-editing boundary

Finalization is a tracker and git bookkeeping step, not an implementation or repair step.

Allowed mutations are limited to:

- staging and committing already-existing related work-item changes on strict `PASS`
- adding one final tracker note/comment
- closing the tracker item on strict `PASS`

Do **not** edit source files, tests, docs, prompts, generated files, configs, or tracker work-item content except for the final note/close commands listed below. Do **not** run formatters, code generators, auto-fix commands, or any command whose purpose is to change repository files. Do **not** fix review findings during finalization. If review findings were created as follow-up work items, treat those follow-ups as closure evidence for the original item, not as tasks to perform here. If material findings were not captured as follow-ups, return `REVISE` and leave the original item open.

## Finalization policy

1. Be conservative: do not close on assumptions.
2. Close only when the latest validation evidence contains the exact line `Gate: PASS`, the acceptance criteria are met, required review evidence either is clean or has converted every material finding into tracker follow-ups, and the git dirty tree can be separated safely.
3. Accept two validation sources:
   - `/validation-fix` evidence from the TDD path.
   - `/ef-work` evidence from the quick path.
4. If evidence is partial, missing, stale, ambiguous, negative, `Gate: REVISE`, or `Gate: BLOCKED`, add a note and leave the ticket open.
5. Prefer `Gate: PASS`, `Gate: REVISE`, and `Gate: BLOCKED` notes for compatibility with this repository's existing workflow.
6. Include only claims supported by actual execution or explicit evidence in context.
7. Do not imply review happened. Use "Review not run" when finalizing from `/ef-work` or `/ef-work-tdd` without a consolidated review verdict.
8. Never create new follow-up tickets/issues in finalization. Follow-up creation belongs to `/ef-review-with-followups`; if required follow-ups are missing or failed, report `REVISE`.
9. Treat an ambiguous dirty tree as `REVISE`, not as a reason to stage broadly or close without a commit.

## Review handoff requirements

When the latest review output contains a `# Finalization Handoff` section, prefer it over inference:

- `Original item may close: yes` supports closure only when validation and dirty-tree requirements also pass.
- `Original item may close: no`, missing follow-up coverage, or failed original-item commenting requires `REVISE`.
- If a ship chain includes review but no handoff section is present, fall back to the review verdict and follow-up evidence, but mention `Finalization handoff: missing` in the final output.

## Closure evidence requirements

For the TDD path, closure requires:

- `Gate: PASS` from `/validation-fix`
- acceptance-criteria evidence
- RED/GREEN proof when required by the spec or ticket, or an explicit RED exemption
- regression validation status, even if broader validation was not run

For the quick path, closure requires:

- `Gate: PASS` from `/ef-work`
- acceptance-criteria evidence
- quick validation command output or explicit inspection evidence
- the quick-path RED exemption
- a self-review with no material scope, regression, or cleanup concern

Review evidence is optional only when the user directly runs `/finalize` after `/ef-work` or `/ef-work-tdd`. When a chain includes review, such as `/ef-ship` or `/ef-ship-tdd`, closure also requires the latest review evidence to support one of these outcomes:

- clean review: merge-ready/pass with no unresolved material findings
- follow-up review: findings were found, `--create-followups` was enabled, every material finding was converted into a created follow-up or explicitly skipped as a duplicate of an existing follow-up, and a note/comment was added to the original work item

Do not close on `failed`, `blocked`, missing required review evidence, or review findings that were not captured as follow-up work. If review found issues but follow-up creation or original-item commenting failed, add a REVISE note and leave the item open. Do not attempt to resolve those findings here.

## Tracker-specific guidance

For `.tickets/` / `tk` work in this repository:

- use `tk show <item>` to inspect the current state
- use `tk add-note <item> "..."` to append the final note
- use `tk close <item>` only on a true pass outcome

For `.beads/` / `br` work:

- use `RUST_LOG=error br show <item> --json` to inspect the current state
- use `ACTOR="${BR_ACTOR:-assistant}"` and then `RUST_LOG=error br comments add --actor "$ACTOR" <item> --message "..." --json` to append the final note
- use `RUST_LOG=error br close --actor "$ACTOR" <item> --reason "..." --json` only on a true pass outcome

Important: the `br` comment/note equivalent is `br comments add` (there is no `br notes` subcommand in the installed CLI).

For other tracker systems, do not invent a close command. Instead, report the recommended manual follow-up.

## Note-writing rules

A final note or close reason should concisely capture:

- the outcome (`PASS`, `REVISE`, or `BLOCKED`)
- the core change
- validation status
- quick-path exemption or TDD RED/GREEN evidence when available
- regression validation status
- review status, explicitly `not run` when absent
- created or duplicate follow-up IDs when review findings were delegated
- any remaining follow-up, if the ticket stays open

## Git commit policy

On a strict `Gate: PASS` outcome, commit already-existing related changes before closing the tracker item. Do not modify files before staging; if files need changes, output `REVISE` instead of making them.

1. Run `git status --short` and `git diff --stat` to confirm what changed.
2. Classify every dirty path before staging:
   - `related`: directly implements, validates, or documents the selected work item.
   - `unrelated`: clearly belongs to other work and must not be staged.
   - `ambiguous`: cannot be proven related or unrelated from the work item/spec/evidence.
3. Stage only `related` files. Do not stage unrelated or ambiguous changes.
4. If any dirty path is ambiguous, return `REVISE` and leave the item open.
5. If there are no related code changes, skip the commit only when this is expected and all remaining dirty paths are clearly unrelated.
6. Commit with a Conventional Commits message:
   - `<type>(<scope>): <summary>` where summary is ≤ 72 chars, imperative mood, no trailing period.
   - Derive `type` from the work (feat, fix, refactor, test, chore, docs, perf).
   - Derive `scope` from the area/module if clear, otherwise omit.
   - If the work-item title is short enough, it can be adapted into the subject line.
7. If there are no changes to commit (e.g., the work was tracker-only), skip the commit and report "No code changes to commit."
8. Close the tracker item only after the commit succeeds or is skipped because there are no related code changes.
9. Do **not** push.
10. Do **not** add sign-offs.
11. On REVISE or BLOCKED, do **not** commit. Leave changes in the working tree for the next iteration.
12. Do **not** edit files, run auto-fix commands, or repair review findings as part of committing.

## Completion checklist

Before finalizing, verify:

- the work-item identity is correct
- the outcome is supported by evidence
- the note text is concise and truthful
- close only happens on strict `Gate: PASS`
- close only happens with valid quick-path evidence or valid TDD validation evidence
- when review is part of the chain, review evidence is clean or all material findings were captured as follow-ups with an original-item note/comment
- review follow-ups are treated as delegated future work, not work to perform during finalization
- no repository files were modified during finalization
- on PASS: already-existing related changes are committed; on REVISE/BLOCKED: nothing is committed
