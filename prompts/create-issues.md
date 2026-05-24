---
description: Convert an ExecPlan into dependency-aware br issues with ExecPlan references
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: work-itemize
restore: true
---

Convert the ExecPlan for `$@` into `br` issues.

This is the tracker-specific form of `/create-work-items --br $@`.

Procedure:

1. Force `br` mode regardless of repository auto-selection.
2. Determine the topic from `$@` using the `work-itemize` skill's topic resolution rules.
3. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
4. Split milestones into dependency-aware issues using the `work-itemize` shared shaping rules.
5. Ensure `br` is available and the repo has a `.beads/` workspace. If not, stop and suggest `/init-execflow --br`.
6. Create issues with `br create`, embed the required ExecPlan Reference block, set hard dependencies with `br dep add`, and finish with `RUST_LOG=error br sync --flush-only` when mutation occurred.
7. Report all created issues with ID, title, kind, priority, dependencies, and important scheduling hints.

Follow the `work-itemize` skill exactly. Do not implement code or modify the ExecPlan.

Suggest `/ef-implement <issue-ref>` for implementation. Suggest `/ef-review <issue-ref> --create-followups` only when the user wants review findings to create tracker issues automatically.
