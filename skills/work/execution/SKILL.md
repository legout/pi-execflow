---
name: execution
description: Implement or fix a work item using minimal diffs while preserving scope, local conventions, and testability. Use for prompts that change code or apply validation/review fixes.
---

# Execution

Use this skill when implementing or fixing a resolved work item.

## Purpose

This is a composite skill for code-changing prompts that need implementation guidance plus scope and repo-fit guardrails.

## Primary references

Read these sibling skills when the task needs deeper detail:

- `../resolve/SKILL.md`
- `../implement/SKILL.md`
- `../scope/SKILL.md`
- `../repo-conventions/SKILL.md`
- `../testing/SKILL.md`
- `../validation/SKILL.md`

## Primary objective

Deliver the smallest correct diff that satisfies the work item and can be validated clearly.

## Resolution dependency

If the prompt starts from a work-item reference rather than a previously resolved context, resolve the work item first using `../resolve/SKILL.md`.

This is especially important for `.beads/` / `br` workflows, where there may be no file-backed work-item path.

## Execution rules

1. Resolve the work item before editing.
2. Inspect surrounding code first.
3. Prefer local consistency over novelty.
4. Keep test changes tightly tied to acceptance criteria.
5. Avoid unrelated tracker or workflow state mutations unless explicitly requested.
6. If ambiguity blocks safe progress, stop and surface it.
7. Do not modify tests merely to make failures disappear; fix the underlying implementation unless the review explicitly identifies a test defect.

## Fix workflow

When fixing validation failures or review findings:

- triage validation failures and acceptance-criteria gaps before review-only improvements; then address high severity before medium before low
- address the smallest real issue first
- keep each fix tied to a concrete finding
- revalidate the affected behavior after each logical fix batch
- do not widen scope under the banner of cleanup
- do not over-fix adjacent code that was not part of the finding
- if a finding is a false positive, skip it explicitly and explain why
- if a finding would require architectural work beyond a minimal fix, flag it rather than silently expanding scope

## Verification heuristics

When the current prompt explicitly owns validation (for example `/validation-fix` or `/worker-validation-fix`), after applying fixes prefer this order:

1. rerun the most relevant targeted test or command for the changed behavior
2. rerun broader checks only when needed for confidence or required by repo norms
3. record what was verified versus what remains recommended

When the current prompt is a pure implementation step (for example `/implement` or `/worker-implement`), do not execute validation commands; instead record what should be run by the later validation step.

## Completion checklist

Before declaring completion, verify:

- the requested behavior is implemented or fixed
- the diff remains scoped
- validation expectations are clear
- any remaining uncertainty is documented
- any skipped findings are justified concretely
