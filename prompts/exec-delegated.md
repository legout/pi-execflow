---
description: Delegated validation-only work-item execution chain
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> validation-plan -> implementation-plan -> worker-implement -> worker-validation-fix -> finalize
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/exec-delegated` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
resolve -> spec -> validation-plan -> implementation-plan -> worker-implement -> worker-validation-fix -> finalize
```

If you see this message, the project-local `.pi/prompts/exec-delegated.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/refresh-prompts` or `/init-execflow`, then retry `/exec-delegated <work-item-ref>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
