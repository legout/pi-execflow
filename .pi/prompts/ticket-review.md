---
description: Run specialized ticket reviews in parallel and consolidate them into one final verdict
argument-hint: "<ticket-ref> [context...]"
chain: ticket-load -> parallel(ticket-review-spec, ticket-review-regression, ticket-review-tests, ticket-review-maintainability) -> ticket-review-consolidate
chainContext: summary
restore: true
---

This command runs the review suite for exactly one ticket.

Flow:

- resolve the ticket and any matching ExecPlan first
- run spec-compliance review in a reviewer subagent
- run regression / compatibility review in a reviewer subagent
- run test-adequacy review in a reviewer subagent
- run maintainability review in a reviewer subagent
- consolidate the findings into one final verdict
