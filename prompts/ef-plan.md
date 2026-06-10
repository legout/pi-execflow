---
description: Simplified public planning chain from idea to ExecPlan
argument-hint: "<topic>"
chain: brainstorm -> create-plan -> grill-plan
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-plan` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
brainstorm -> create-plan -> grill-plan
```

If you see this message, the project-local `.pi/prompts/ef-plan.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-sync` or `/init-execflow`, then retry `/ef-plan <topic>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
