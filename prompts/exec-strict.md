---
description: Strict end-to-end work-item execution chain with mandatory recheck cycle
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> derive-tests -> impl-plan -> implement -> validate -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate -> fix -> validate -> parallel(review-spec, review-regression, review-tests, review-maintainability) -> review-consolidate -> finalize
chainContext: summary
restore: true
---

This command runs a stricter manual work-item workflow.

It includes exactly one explicit repair cycle after the first consolidated review. The `/fix` step is single-pass; any further iteration should happen only after a fresh review run.

Flow:

- resolve the work item and plan context
- normalize the spec
- derive the test plan
- plan the smallest change
- implement the work item
- validate the result
- run four specialized reviewer subagents in parallel
- consolidate the first review verdict
- apply the smallest needed fixes
- revalidate
- rerun the parallel review suite
- consolidate the final review verdict
- add a final work-item note and close on a true pass
