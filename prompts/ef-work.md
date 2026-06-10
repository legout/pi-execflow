---
description: Simplified public validation-only work-item execution chain
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> implement -> validation-fix -> finalize
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-work` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
resolve -> spec -> implement -> validation-fix -> finalize
```

If you see this message, the project-local `.pi/prompts/ef-work.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-sync` or `/init-execflow`, then retry `/ef-work <work-item-ref>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
