---
description: Run specialized work-item reviews in parallel and consolidate into one final verdict
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate
chainContext: summary
restore: true
---

This command runs the review suite for exactly one work item.

Flow:

- resolve the work item and any matching ExecPlan first
- run spec-compliance review in a reviewer subagent
- run regression / compatibility review in a reviewer subagent
- run test-adequacy review in a reviewer subagent
- run maintainability review in a reviewer subagent
- consolidate the findings into one final verdict
