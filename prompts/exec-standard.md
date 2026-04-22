---
description: Standard end-to-end work-item execution chain
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> derive-tests -> impl-plan -> implement -> validate -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate -> finalize
chainContext: summary
restore: true
---

This command runs a standard manual work-item workflow.

Flow:

- resolve the work item and plan context
- normalize the spec
- derive the test plan
- plan the smallest change
- implement the work item
- validate the result
- run four specialized reviewer subagents in parallel
- consolidate the review verdict
- add a final work-item note and close on a true pass
