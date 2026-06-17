---
description: Create an ExecPlan from a brainstorm or user brief
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, zai/glm-5.2
thinking: high
skill: create-plan
restore: true
---

Create a self-contained ExecPlan for: $@

<if-model is="openai-codex/*">
Optimize for the clearest boundary simplification and the strongest milestone narrative, without repeating obvious scaffolding.
<else>
Be extra explicit about user-visible outcomes, repo-relative file paths, milestone prerequisites, and why the chosen sequencing is simpler than the alternatives.
</if-model>

Procedure:

1. Determine the topic using `$@` first, then topic resolution from the create-plan skill.
2. If `$@` is not empty, derive `<topic-slug>` from `$@` using kebab-case, lowercase normalization.
3. Read `.execflow/plans/<topic-slug>/brainstorm.md` if it exists for the brainstorm context.
4. Read `ARCHITECTURE.md` if it exists for architectural context, but do not require it.
5. Read `.execflow/PLANS.md` in full for the ExecPlan format spec. If it is missing, stop and tell the user to run `/ef-init` first.
6. Inspect the repo to understand relevant files, flows, and current complexity.
7. Apply the Ousterhout lens when deciding the plan shape.
8. Prefer independently verifiable vertical milestones by default. Use explicit enabler, migration, prototype, or cleanup milestones only when justified by risk or sequencing.
9. Make milestone prerequisites, related non-blocking slices, parallelizable slices, and serialization/conflict points explicit in the plan prose.
10. Write the ExecPlan to `.execflow/plans/<topic-slug>/execplan.md` following `.execflow/PLANS.md` exactly.

Follow the create-plan skill exactly for the authoring workflow and anti-patterns.

Report the file path. If this prompt is running as part of `/ef-plan`, continue to the next chain step. If it is running directly as an internal leaf, suggest `/ef-plan $@` for the supported planning workflow or `/ef-tasks $@` after the plan is ready.
