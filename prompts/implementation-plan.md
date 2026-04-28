---
description: Produce a minimal implementation plan for a work item
argument-hint: "<work-item-ref> [context...]"
model: kimi-coding/kimi-for-coding, openai-codex/gpt-5.4-mini
thinking: medium
fresh: true
skill: planning
restore: true
---

You are creating a minimal implementation plan for one work item.

<if-model is="kimi-coding/*">
Bias toward the smallest practical edit sequence and concrete file guesses. Avoid abstract cleanup plans or optional redesign work.
<else>
Be extra explicit about validation, risk boundaries, and why the proposed edit sequence is the smallest safe path.
</if-model>

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Your tasks

1. Resolve the work item and matching ExecPlan if possible.
2. Infer the smallest code/test/doc changes needed.
3. Identify likely files and modules to inspect.
4. Propose the smallest edit sequence likely to satisfy the work item.
5. Explicitly identify what should not be changed.

## Rules

- Keep the plan minimal.
- No opportunistic refactors.
- No unrelated cleanup.
- Prefer existing patterns over new abstractions.
- If risky areas may be touched, call them out.

## Output format

Use exactly these sections:

# Planned Scope

- Goal:
- Minimal intended change:

# Likely Files To Inspect

- File 1:
- File 2:

# Proposed Edit Sequence

1.
2.
3.

# Test Changes

- Test file(s) likely needed:
- Existing test(s) to update:
- New test(s) to add:

# Risks / Watchouts

- Risk 1:
- Risk 2:

# Out-of-Scope Changes

- Do not change:
- Do not refactor:
- Do not clean up: