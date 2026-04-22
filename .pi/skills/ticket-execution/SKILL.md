---
name: ticket-execution
description: Implement or fix a ticket using minimal diffs while preserving scope, local conventions, and testability. Use for prompts that change code or apply review fixes.
---

# Ticket Execution

Use this skill when implementing or fixing a resolved ticket.

## Purpose

This is a composite skill for code-changing ticket prompts that need implementation guidance plus scope and repo-fit guardrails.

## Primary references

Read these sibling skills when the task needs deeper detail:

- `../ticket-resolution/SKILL.md`
- `../ticket-implementation/SKILL.md`
- `../ticket-scope-control/SKILL.md`
- `../ticket-repo-conventions/SKILL.md`
- `../ticket-testing/SKILL.md`
- `../ticket-validation/SKILL.md`

## Primary objective

Deliver the smallest correct diff that satisfies the ticket and can be validated clearly.

## Resolution dependency

If the prompt starts from a ticket reference rather than a previously resolved ticket context, resolve the ticket first using `../ticket-resolution/SKILL.md`.

This is especially important for `.beads/` / `br` workflows, where there may be no file-backed ticket path.

## Execution rules

1. Resolve the ticket before editing.
2. Inspect surrounding code first.
3. Prefer local consistency over novelty.
4. Keep test changes tightly tied to acceptance criteria.
5. Avoid unrelated tracker or workflow state mutations unless explicitly requested.
6. If ambiguity blocks safe progress, stop and surface it.
7. Do not modify tests merely to make failures disappear; fix the underlying implementation unless the review explicitly identifies a test defect.

## Fix workflow

When fixing review findings:

- triage by severity first: high before medium before low
- address the smallest real issue first
- keep each fix tied to a concrete finding
- revalidate the affected behavior after each logical fix batch
- do not widen scope under the banner of cleanup
- do not over-fix adjacent code that was not part of the finding
- if a finding is a false positive, skip it explicitly and explain why
- if a finding would require architectural work beyond a minimal fix, flag it rather than silently expanding scope

## Verification heuristics

After applying fixes, prefer this order:

1. rerun the most relevant targeted test or command for the changed behavior
2. rerun broader checks only when needed for confidence or required by repo norms
3. record what was verified versus what remains recommended

## Completion checklist

Before declaring completion, verify:

- the requested behavior is implemented or fixed
- the diff remains ticket-scoped
- validation expectations are clear
- any remaining uncertainty is documented
- any skipped findings are justified concretely
