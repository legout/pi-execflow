---
description: Quick work-item implementation, follow-up-creating review, and conservative finalization
argument-hint: "[<work-item-ref>|--next] [--max-retries N] [context...]"
chain: ship-resolve -> ef-work -> ef-review-with-followups -> finalize
chainContext: summary
loop: unlimited
fresh: true
converge: true
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-ship` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
ship-resolve -> ef-work -> ef-review-with-followups -> finalize
```

If you see this message, the project-local `.pi/prompts/ef-ship.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-sync` or `/init-execflow`, then retry `/ef-ship [<work-item-ref>|--next]`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
