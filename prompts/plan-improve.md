---
description: Deep-audit and improve an existing ExecPlan with code-grounded improvements
argument-hint: "[topic]"
model: openai-codex/gpt-5.5, openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: high
skill: execplan-improve
loop: 3
rotate: true
fresh: true
converge: true
restore: true
---

Improve the ExecPlan for: $@

<if-model is="openai-codex/*">
Focus on the highest-leverage blockers first and keep the rewrite tight, but still reflect every material change across the living sections.
<else>
Be extra explicit about missing dependencies, hidden execution blockers, validation proof, and cross-section consistency when rewriting the plan.
</if-model>

Use `$@` as the primary topic selector. If `$@` is empty, auto-detect from existing ExecPlans.

On each iteration, follow the execplan-improve skill workflow exactly:
- Parse the ExecPlan
- Deep-read referenced files
- Explore adjacent code
- Audit against the 7 criteria
- Rewrite only when there are substantive code-grounded improvements
- Score the usefulness of this pass

Important convergence rule:
If there are no substantive code-grounded improvements left, do not modify the ExecPlan file at all. That no-change outcome should end the loop naturally.

After each pass, report the Fixed, Added, Strengthened, and Flagged items along with the usefulness score.
If the loop converges early, the plan is ready for `/create-work-items $@`.
If the user wants to force the tracker explicitly, mention `/create-tickets $@` in `tk` repos and `/create-issues $@` in `br` repos.
