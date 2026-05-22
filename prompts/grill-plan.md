---
description: Interactively pressure-test an ExecPlan before work-item creation
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: grill-plan
restore: true
---

Grill the ExecPlan for: $@

<if-model is="openai-codex/*">
Be relentless but concise: identify the highest-leverage ambiguity, inspect code before asking, recommend an answer, and ask exactly one question.
<else>
Be extra explicit about why each question matters, what code evidence supports your recommendation, and which ExecPlan section will be updated after the answer.
</if-model>

Use `$@` as the primary topic selector. If `$@` is empty, auto-detect from existing ExecPlans.

Procedure:

1. Determine the topic using topic resolution from the grill-plan skill.
2. Read `.execflow/PLANS.md` in full. If it is missing, stop and tell the user to run `/init-execflow` first.
3. Read `.execflow/plans/<topic-slug>/execplan.md` in full.
4. Read `.execflow/plans/<topic-slug>/brainstorm.md` if it exists.
5. Inspect referenced files, adjacent code, tests, docs, and commands before asking the user anything.
6. Identify the highest-leverage unresolved decision, contradiction, fuzzy term, missing edge case, weak acceptance criterion, milestone sequencing risk, or work-item splitting ambiguity.
7. Ask exactly one focused question at a time. Include your recommended answer and the code/plan evidence behind it.
8. When the user answers, update the ExecPlan immediately in the smallest necessary sections while preserving `.execflow/PLANS.md` compliance.
9. Continue until material plan ambiguities are resolved or the user asks to stop.

Follow the grill-plan skill exactly.

When finished or paused, report the ExecPlan path, decisions resolved, sections updated, unresolved questions, and suggest `/improve-plan $@` next.
