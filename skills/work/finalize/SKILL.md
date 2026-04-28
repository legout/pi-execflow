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
2. Close when validation passed and acceptance criteria are met, even if an independent review has not been run.
3. If evidence is partial, missing, or negative, add a note and leave the ticket open.
4. Prefer `Gate: PASS` and `Gate: REVISE` notes for compatibility with this repository's existing workflow.
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

- the outcome (`PASS` or `REVISE`)
- the core change
- validation status
- review status, explicitly `not run` when absent
- any remaining follow-up, if the ticket stays open

## Completion checklist

Before finalizing, verify:

- the work-item identity is correct
- the outcome is supported by evidence
- the note text is concise and truthful
- close only happens on a real pass
