---
description: Run specialized reviewer subagents in parallel and consolidate one final verdict
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate
chainContext: summary
restore: true
---
ERROR: This prompt body should never be executed.

`/review` must be handled by `pi-prompt-template-model` as a chain prompt using:

```text
resolve -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate
```

If you see this message, the project-local `.pi/prompts/review.md` overlay is missing, stale, or not being handled by `pi-prompt-template-model`.
Run `/refresh-prompts` or `/init-execflow`, then retry `/review <work-item-ref>`.

Do not implement, edit files, validate, review, plan, or mutate tracker state from this fallback prompt body.
