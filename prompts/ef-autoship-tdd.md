---
description: Sequentially ship br or tk ready work with the TDD ship chain until no eligible work remains
argument-hint: "[--max-retries N] [context...]"
chain: ship-tdd-resolve -> spec -> implement -> validation-fix -> ef-review-with-followups -> finalize
chainContext: summary
loop: unlimited
fresh: false
converge: true
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-autoship-tdd` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
ship-tdd-resolve -> spec -> implement -> validation-fix -> ef-review-with-followups -> finalize
```

If you see this message, the project-local `.pi/prompts/ef-autoship-tdd.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-update` or `/ef-init`, then retry `/ef-autoship-tdd [--max-retries N]`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
