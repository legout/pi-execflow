---
description: Convert an ExecPlan into tracker work items, auto-selecting tk tickets or br issues
argument-hint: "[--tk|--br] [topic]"
model: openai-codex/gpt-5.5, zai/glm-5.1, kimi-coding/kimi-for-coding
thinking: high
skill: work-itemize
restore: true
---

Convert the ExecPlan for `$@` into tracked work items.

Accepted tracker flags:

- `--tk` — force `tk` ticket creation
- `--br` — force `br` issue creation

If no tracker flag is present, auto-select the tracker using the `work-itemize` skill.

Procedure:

1. Parse tracker override flags from `$@`.
2. Determine the topic from the remaining arguments using the `work-itemize` skill's topic resolution rules.
3. Auto-select the tracker from repo state when no explicit flag is present.
4. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
5. Split milestones into dependency-aware work items using the skill's shared ticket/issue shaping rules.
6. Create either:
   - `tk` tickets via `tk create` and `tk dep`, or
   - `br` issues via `br create` and `br dep add`
7. Embed the `ExecPlan Reference` block in every created work item.
8. Report which tracker was selected and list all created work items with dependencies and scheduling hints.

Follow the `work-itemize` skill exactly.

At the end:
- if `tk` was selected, suggest `/execflow <ticket-ref>` for the default validation-only implementation path or `/exec-delegated <ticket-ref>` for larger/noisier work; mention optional external `/execflow-queue` only if that delegated `tk` workflow is available
- if `br` was selected, suggest `/execflow <issue-ref>` for the default validation-only implementation path, `/exec-delegated <issue-ref>` for larger/noisier work, or the focused local prompts (`/resolve`, `/spec`, `/implement`, `/validation-fix`, `/validate`, `/review`, `/review-followups`, `/finalize`)
