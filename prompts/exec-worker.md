---
description: Delegated worker chain for implementation and validation/fix
argument-hint: "<work-item-ref> [context...]"
chain: exec-worker-implement -> exec-worker-validation-fix
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/exec-worker` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
exec-worker-implement -> exec-worker-validation-fix
```

If you see this message, the project-local `.pi/prompts/exec-worker.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/refresh-prompts` or `/init-execflow`, then retry `/exec-worker <work-item-ref>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
