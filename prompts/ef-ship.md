---
description: Quick work-item implementation, follow-up-creating review, and conservative finalization
argument-hint: "<work-item-ref> [context...]"
chain: ef-work -> ef-review-with-followups -> finalize
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/ef-ship` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
ef-work -> ef-review-with-followups -> finalize
```

If you see this message, the project-local `.pi/prompts/ef-ship.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/ef-sync` or `/init-execflow`, then retry `/ef-ship <work-item-ref>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
