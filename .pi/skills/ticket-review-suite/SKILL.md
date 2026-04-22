---
name: ticket-review-suite
description: Consolidate ticket review from multiple lenses: correctness, regression risk, test evidence, maintainability, scope discipline, and merge readiness. Use for prompts that synthesize specialized review passes into one actionable verdict.
---

# Ticket Review Suite

Use this skill when performing or consolidating a high-confidence ticket review.

## Purpose

This composite skill is intended for prompts that need a whole-review perspective while still respecting specialized review lenses.

## Primary references

For deeper detail, read these sibling skills:

- `../ticket-resolution/SKILL.md`
- `../ticket-review-discipline/SKILL.md`
- `../ticket-testing/SKILL.md`
- `../ticket-validation/SKILL.md`
- `../ticket-scope-control/SKILL.md`
- `../ticket-repo-conventions/SKILL.md`

## Primary objective

Produce a final reviewer-oriented verdict that is evidence-based, prioritized, and minimal in remediation.

## Resolution dependency

If the consolidation starts from a raw ticket reference rather than a prior resolved summary, resolve the ticket first.

When the ticket system is `br`, use CLI-backed resolution rather than assuming a path in `.beads/`.

## Consolidation rules

- Prefer concrete findings over abstract critique.
- Merge duplicate findings across lenses.
- Preserve the highest severity when multiple lenses identify the same issue.
- Distinguish between proven gaps and speculative concerns.
- If specialized reviews disagree, explain why.
- If no material issues remain, say so plainly.

## Verdict discipline

A merged review verdict should answer:

1. Is the ticket compliant?
2. Is there any regression or compatibility risk?
3. Is the validation convincing?
4. Is the diff appropriately scoped?
5. Is the change maintainable enough to merge?
6. What is the smallest next action?

## Completion checklist

Before finishing, verify:

- findings are de-duplicated
- severity reflects impact
- acceptance-criteria status is clear
- evidence gaps are explicit
- the final recommendation is unambiguous
