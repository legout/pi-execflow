---
name: ticket-review-maintenance
description: Review ticket changes for maintainability, local consistency, unnecessary complexity, and likely merge friction. Use for maintainability-focused ticket review prompts.
---

# Ticket Review Maintenance

Use this skill for the maintainability-specific review lens.

## Primary references

Read these sibling skills when you need deeper detail:

- `../ticket-resolution/SKILL.md`
- `../ticket-review-discipline/SKILL.md`
- `../ticket-repo-conventions/SKILL.md`
- `../ticket-scope-control/SKILL.md`

## Primary objective

Assess whether the change fits the codebase cleanly and is likely to merge without reviewer friction.

## Resolution dependency

If the review begins from a ticket reference rather than an already-resolved context, resolve the ticket first using `../ticket-resolution/SKILL.md`.

## Review focus

- local consistency
- unnecessary complexity
- hidden over-engineering
- suspicious change shape
- unrelated churn
- readability and reviewability

## Rules

- Do not nitpick style in isolation.
- Flag issues only when they materially affect maintainability or mergeability.
- Prefer simpler fixes over broader redesign.
- Stay tied to the ticket's scope and real diff shape.
