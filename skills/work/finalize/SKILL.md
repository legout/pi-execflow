---
name: finalize
description: Update a work item with a concise execution note and close it only when validation proves the acceptance criteria. Use for prompts that finalize work-item status after manual execution chains.
---

# Finalization

Use this skill when preparing the final work-item update after implementation and validation. Review evidence is optional and must be reported honestly when present or absent.

## Purpose

This composite skill exists for the post-execution step where a prompt must translate evidence into a tracker update.

## Primary references

Read these sibling skills for deeper detail when needed:

- `../resolve/SKILL.md`
- `../validation/SKILL.md`
- `../review-suite/SKILL.md` when review evidence is present

## Primary objective

Add an accurate work-item note and close it only when the evidence supports closure.

## Finalization policy

1. Be conservative: do not close on assumptions.
2. Close only when the latest validation evidence contains the exact line `Gate: PASS` and the acceptance criteria are met, even if an independent review has not been run.
3. If evidence is partial, missing, stale, ambiguous, negative, `Gate: REVISE`, or `Gate: BLOCKED`, add a note and leave the ticket open.
4. Prefer `Gate: PASS`, `Gate: REVISE`, and `Gate: BLOCKED` notes for compatibility with this repository's existing workflow.
5. Include only claims supported by actual execution or explicit evidence in context.
6. Do not imply review happened. Use "Review not run" when finalizing from `/ef-implement` without a consolidated review verdict.

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
- review status, explicitly `not run` when absent
- any remaining follow-up, if the ticket stays open

## Git commit policy

On a strict `Gate: PASS` outcome, commit all related changes before closing the tracker item:

1. Run `git status` and `git diff --stat` to confirm what changed.
2. Stage only the files that belong to the work item. Do not stage unrelated changes.
3. Commit with a Conventional Commits message:
   - `<type>(<scope>): <summary>` where summary is ≤ 72 chars, imperative mood, no trailing period.
   - Derive `type` from the work (feat, fix, refactor, test, chore, docs, perf).
   - Derive `scope` from the area/module if clear, otherwise omit.
   - If the work-item title is short enough, it can be adapted into the subject line.
4. If there are no changes to commit (e.g., the work was tracker-only), skip the commit and report "No code changes to commit."
5. Close the tracker item only after the commit succeeds or is skipped because there are no code changes.
6. Do **not** push.
7. Do **not** add sign-offs.
8. On REVISE or BLOCKED, do **not** commit. Leave changes in the working tree for the next iteration.

## Completion checklist

Before finalizing, verify:

- the work-item identity is correct
- the outcome is supported by evidence
- the note text is concise and truthful
- close only happens on strict `Gate: PASS`
- on PASS: related changes are committed; on REVISE/BLOCKED: nothing is committed
