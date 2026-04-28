---
description: Non-interactive planning chain - architect, create ExecPlan, improve until convergence
argument-hint: "[topic]"
chain: architect -> plan-create -> plan-improve
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/plan-chain` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
architect -> plan-create -> plan-improve
```

If you see this message, the project-local `.pi/prompts/plan-chain.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/refresh-prompts` or `/init-execflow`, then retry `/plan-chain [topic]`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
