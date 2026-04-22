---
name: review-suite
description: >
  Consolidate work-item review from multiple lenses: correctness, regression
  risk, test evidence, maintainability, scope discipline, and merge readiness.
  Use for prompts that synthesize specialized review passes into one actionable
  verdict.
---

# Review Suite

Use this skill when performing or consolidating a high-confidence work-item review.

## Purpose

This composite skill is intended for prompts that need a whole-review perspective while still respecting specialized review lenses.

## Primary references

For deeper detail, read these sibling skills:

- `../resolve/SKILL.md`
- `../review-discipline/SKILL.md`
- `../testing/SKILL.md`
- `../validation/SKILL.md`
- `../scope/SKILL.md`
- `../repo-conventions/SKILL.md`

## Primary objective

Produce a final reviewer-oriented verdict that is evidence-based, prioritized, and minimal in remediation.

## Resolution dependency

If the consolidation starts from a raw work-item reference rather than a prior resolved summary, resolve the work item first.

When the tracker system is `br`, use CLI-backed resolution rather than assuming a path in `.beads/`.

## Consolidation rules

- Prefer concrete findings over abstract critique.
- Merge duplicate findings across lenses.
- Preserve the highest severity when multiple lenses identify the same issue.
- Distinguish between proven gaps and speculative concerns.
- If specialized reviews disagree, explain why.
- If no material issues remain, say so plainly.

## Verdict discipline

A merged review verdict should answer:

1. Is the work item compliant?
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
