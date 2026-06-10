---
description: Simplified public command for converting an ExecPlan into tracked work items
argument-hint: "[--tk|--br] [topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: work-itemize
restore: true
---

Convert the ExecPlan for `$@` into tracked work items.

This is the supported public command for deriving tracked work items from an ExecPlan.

Accepted tracker flags:

- `--tk` — force `tk` ticket creation
- `--br` — force `br` issue creation

If no tracker flag is present, auto-select the tracker using the `work-itemize` skill.

Procedure:

1. Parse tracker override flags from `$@`.
2. Determine the topic from the remaining arguments using the `work-itemize` skill's topic resolution rules.
3. Auto-select the tracker from repo state when no explicit flag is present.
4. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
5. Split milestones into dependency-aware, independently verifiable work items using the skill's shared shaping rules.
6. Create either:
   - `tk` tickets via `tk create` and `tk dep`, or
   - `br` issues via `br create` and `br dep add`
7. Embed the `ExecPlan Reference` block in every created work item.
8. Report which tracker was selected and list all created work items with dependencies, validation expectations, and scheduling hints.

Follow the `work-itemize` skill exactly. Do not implement code or modify the ExecPlan.

Suggest `/ef-work <ticket-or-issue-ref>` for implementation. Suggest `/ef-review <ticket-or-issue-ref> --create-followups` only when the user wants review findings to create tracker work items automatically.
