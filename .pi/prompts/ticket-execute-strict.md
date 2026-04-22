---
description: Strict end-to-end ticket execution chain with mandatory recheck cycle
argument-hint: "<ticket-ref> [context...]"
chain: ticket-load -> ticket-spec -> ticket-tests -> ticket-plan -> ticket-implement -> ticket-validate -> parallel(ticket-review-spec, ticket-review-regression, ticket-review-tests, ticket-review-maintainability) -> ticket-review-consolidate -> ticket-fix -> ticket-validate -> parallel(ticket-review-spec, ticket-review-regression, ticket-review-tests, ticket-review-maintainability) -> ticket-review-consolidate -> ticket-finalize
chainContext: summary
restore: true
---

This command runs a stricter manual ticket workflow.

Flow:

- resolve the ticket and plan context
- normalize the spec
- derive the test plan
- plan the smallest change
- implement the ticket
- validate the result
- run four specialized reviewer subagents in parallel
- consolidate the first review verdict
- apply the smallest needed fixes
- revalidate
- rerun the parallel review suite
- consolidate the final review verdict
- add a final ticket note and close on a true pass
