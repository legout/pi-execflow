---
description: Create an ExecPlan from a brainstorm or user brief
argument-hint: "[topic]"
model: openai-codex/gpt-5.4, zai/glm-5.1, kimi-coding/k2p6
thinking: high, high, high
skill: execplan-create
restore: true
---

Create a self-contained ExecPlan for: $@

Procedure:

1. Determine the topic using `$@` first, then topic resolution from the execplan-create skill.
2. If `$@` is not empty, derive `<topic-slug>` from `$@` using kebab-case, lowercase normalization.
3. Read `.execflow/plans/<topic-slug>/brainstorm.md` if it exists for the brainstorm context.
4. Read `ARCHITECTURE.md` if it exists for architectural context.
5. Read `.execflow/PLANS.md` in full for the ExecPlan format spec. If it is missing, stop and tell the user to run `/init-execflow` first.
6. Inspect the repo to understand relevant files, flows, and current complexity.
7. Apply the Ousterhout lens when deciding the plan shape.
8. Prefer independently verifiable vertical milestones by default. Use explicit enabler, migration, prototype, or cleanup milestones only when justified by risk or sequencing.
9. Make milestone prerequisites, related non-blocking slices, parallelizable slices, and serialization/conflict points explicit in the plan prose.
10. Write the ExecPlan to `.execflow/plans/<topic-slug>/execplan.md` following `.execflow/PLANS.md` exactly.

Follow the execplan-create skill exactly for the authoring workflow and anti-patterns.

Report the file path and suggest running `/plan-improve $@` to audit the plan next.
After the plan is solid, suggest `/create-work-items $@` to auto-select the right tracker.
If the user wants to force the tracker explicitly, mention `/create-tickets $@` for `tk` and `/create-issues $@` for `br`.
