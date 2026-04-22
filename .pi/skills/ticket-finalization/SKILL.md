---
name: ticket-finalization
description: Update a ticket with a concise execution note and close it only when validation passed and review found no material issues. Use for prompts that finalize ticket status after manual execution chains.
---

# Ticket Finalization

Use this skill when preparing the final ticket update after implementation, validation, and review.

## Purpose

This composite skill exists for the post-execution step where a prompt must translate evidence into a tracker update.

## Primary references

Read these sibling skills for deeper detail when needed:

- `../ticket-resolution/SKILL.md`
- `../ticket-validation/SKILL.md`
- `../ticket-review-suite/SKILL.md`

## Primary objective

Add an accurate ticket note and close the ticket only when the evidence supports closure.

## Finalization policy

1. Be conservative: do not close on assumptions.
2. Close only when validation passed and review is merge-ready / pass with no unresolved material issues.
3. If evidence is partial, missing, or negative, add a note and leave the ticket open.
4. Prefer `Gate: PASS` and `Gate: REVISE` notes for compatibility with this repository's existing ticket workflow.
5. Include only claims supported by actual execution or explicit evidence in context.

## Tracker-specific guidance

For `.tickets/` / `tk` work in this repository:

- use `tk show <ticket>` to inspect the current state
- use `tk add-note <ticket> "..."` to append the final note
- use `tk close <ticket>` only on a true pass outcome

For `.beads/` / `br` work:

- use `RUST_LOG=error br show <ticket> --json` to inspect the current state
- use `ACTOR="${BR_ACTOR:-assistant}"` and then `RUST_LOG=error br comments add --actor "$ACTOR" <ticket> --message "..." --json` to append the final note
- use `RUST_LOG=error br close --actor "$ACTOR" <ticket> --reason "..." --json` only on a true pass outcome

Important: the `br` comment/note equivalent is `br comments add` (there is no `br notes` subcommand in the installed CLI).

For other ticket systems, do not invent a close command. Instead, report the recommended manual follow-up.

## Note-writing rules

A final note or close reason should concisely capture:

- the outcome (`PASS` or `REVISE`)
- the core change
- validation status
- review status
- any remaining follow-up, if the ticket stays open

## Completion checklist

Before finalizing, verify:

- the ticket identity is correct
- the outcome is supported by evidence
- the note text is concise and truthful
- close only happens on a real pass