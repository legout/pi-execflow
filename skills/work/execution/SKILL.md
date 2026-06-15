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
8. For testable behavior, do not make production implementation changes until RED proof exists in the current work context.
9. If RED is exempt, ensure the exemption is explicit before implementation and keep the change limited to the exempted scope.
10. Treat parallel execution and worktree isolation as optional safety tools, never as default automation.
11. Preserve the active prompt runtime. Do not delete, move, or overwrite `.pi/`, `.pi/prompts/`, `.pi/agents/`, `.execflow/`, or prompt-template runtime files unless the work item explicitly targets pi-execflow scaffolding.
12. Do not rewrite the active checkout during ship/autoship execution. Avoid `git checkout`, `git switch`, `git reset --hard`, `git clean`, and equivalent commands in the current worktree; these can remove prompt overlays and break the next chain iteration. For branch-ref remediation, prefer ref-only commands such as `git branch -f <branch> <ref>` or `git update-ref`, or use a separate isolated worktree.

## Worktree and parallel execution discipline

Before using or recommending a separate worktree, detect the current isolation state instead of assuming a normal checkout. Check the current path, branch, and `git worktree list` when available. If the current session is already inside a harness-managed or unknown worktree, preserve it and do not create cleanup steps for it.

For work items about repairing, rebasing, or repointing a branch, do not check out that branch in the active worktree. Prefer ref-only updates (`git branch -f`, `git update-ref`) when they satisfy the work item. If content inspection on the other branch is required, use `git show <branch>:<path>`, `git diff <base>...<branch>`, or a separate worktree. This preserves `.pi/prompts` and other chain runtime overlays for subsequent autoship iterations.

Before starting isolated work, verify a clean baseline with `git status --short` unless the user explicitly instructs you to continue with existing changes. If the baseline is dirty, stop and separate user changes from the work item rather than hiding them inside the implementation.

Do not implement two work items in parallel when they edit the same files, generated outputs, package manifests, schema migrations, central registries, public interfaces, or global configuration unless the work item or ExecPlan names the stable contract that makes the split safe. Shared serialization points require sequential work or explicit coordination.

When parallel work is used, each branch or worktree should be reviewed and validated independently, then merged sequentially into the integration branch. Do not batch-merge multiple parallel slices before review. Do not delete, prune, or clean up worktrees you did not create in the current workflow, and never remove harness-owned worktrees.

## RED/GREEN execution discipline

Before editing production code for testable behavior, confirm the spec or work item includes one of:

- `RED proof`: an exact failing test/command/assertion/manual check and expected failure signal
- `RED exemption`: a concrete reason such as docs-only, planning-only, exploratory spike, or untestable environment constraint
- `RED/GREEN: unknown`: in this case, stop and ask for clarification or route back to specification

For testable behavior, the implementation phase should create or select the RED proof first and record the expected failure. If the current prompt is a pure implementation step that must not execute validation commands, write the exact RED command/check for `/validation-fix` to run before any GREEN claim. Do not claim RED evidence was observed unless it was actually run in the current context.

GREEN means the smallest production change that makes the RED proof pass. Avoid broad refactors, unrelated cleanup, or additional behavior until the targeted proof is green. Treat later full-suite, lint, build, typecheck, and smoke checks as regression validation, not substitutes for the initial RED proof.

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

When the current prompt explicitly owns validation (for example `/validation-fix`), after applying fixes prefer this order:

1. rerun the most relevant targeted test or command for the changed behavior
2. rerun broader checks only when needed for confidence or required by repo norms
3. record what was verified versus what remains recommended

When the current prompt is a pure implementation step (for example `/implement`), do not execute validation commands; instead record what should be run by the later validation step.

## Completion checklist

Before declaring completion, verify:

- the requested behavior is implemented or fixed
- the diff remains scoped
- validation expectations are clear
- RED proof or RED exemption is clear for testable behavior
- GREEN implementation is minimal and tied to the specified proof
- any worktree or parallel-execution assumptions were checked against the current checkout and shared-file boundaries
- any remaining uncertainty is documented
- any skipped findings are justified concretely
