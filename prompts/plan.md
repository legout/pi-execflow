---
description: Full planning pipeline - brainstorm if needed, then plan-chain
argument-hint: "<topic>"
restore: true
---

If `$@` is empty, ask the user for a topic before proceeding.

Plan this topic end-to-end: $@

## Step 1: Brainstorm check

1. Derive the topic slug from `$@` (kebab-case, lowercase, max 40 chars).
2. Check if `.execflow/plans/<topic-slug>/brainstorm.md` exists.
3. If it does not exist, run an interactive brainstorming session following the `brainstorm` skill, then write the brainstorm file to `.execflow/plans/<topic-slug>/brainstorm.md`.
4. If it does exist, report that the brainstorm already exists and continue.

## Step 2: Run plan-chain

Run `/plan-chain $@` to execute the non-interactive planning pipeline (architect → plan-create → plan-improve).

## Step 3: Finish

Report the final plan location and suggest running `/create-work-items $@` to auto-select the right tracker.
If the user wants to force the tracker explicitly, mention `/create-tickets $@` for `tk` and `/create-issues $@` for `br`.
