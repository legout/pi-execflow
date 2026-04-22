---
name: review-maintenance
description: Review work-item changes for maintainability, local consistency, unnecessary complexity, and likely merge friction. Use for maintainability-focused review prompts.
---

# Review Maintenance

Use this skill for the maintainability-specific review lens.

## Primary references

Read these sibling skills when you need deeper detail:

- `../resolve/SKILL.md`
- `../review-discipline/SKILL.md`
- `../repo-conventions/SKILL.md`
- `../scope/SKILL.md`

## Primary objective

Assess whether the change fits the codebase cleanly and is likely to merge without reviewer friction.

## Resolution dependency

If the review begins from a work-item reference rather than an already-resolved context, resolve the work item first using `../resolve/SKILL.md`.

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
- Stay tied to the work item's scope and real diff shape.
