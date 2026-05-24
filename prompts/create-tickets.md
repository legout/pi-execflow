---
description: Convert an ExecPlan into dependency-aware tk tickets with ExecPlan references
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: work-itemize
restore: true
---

Convert the ExecPlan for `$@` into `tk` tickets.

This is the tracker-specific form of `/create-work-items --tk $@`.

Procedure:

1. Force `tk` mode regardless of repository auto-selection.
2. Determine the topic from `$@` using the `work-itemize` skill's topic resolution rules.
3. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
4. Split milestones into dependency-aware tickets using the `work-itemize` shared shaping rules.
5. Ensure `tk` is available and the repo has a `.tickets/` workspace. If not, stop and suggest `/init-execflow --tk`.
6. Create tickets with `tk create`, embed the required ExecPlan Reference block, and set hard dependencies with `tk dep`.
7. Report all created tickets with ID, title, kind, priority, dependencies, and important scheduling hints.

Follow the `work-itemize` skill exactly. Do not implement code or modify the ExecPlan.

Suggest `/ef-implement <ticket-ref>` for implementation. Suggest `/ef-review <ticket-ref> --create-followups` only when the user wants review findings to create tracker tickets automatically.
