---
description: Sequentially ship br or tk ready work with the quick ship chain until no eligible work remains
argument-hint: "[--max-retries N] [context...]"
chain: ship-resolve -> ef-work -> ef-review-with-followups -> finalize
chainContext: summary
loop: unlimited
fresh: true
converge: true
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-autoship` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
ship-resolve -> ef-work -> ef-review-with-followups -> finalize
```

If you see this message, the project-local `.pi/prompts/ef-autoship.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-sync` or `/init-execflow`, then retry `/ef-autoship [--max-retries N]`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
