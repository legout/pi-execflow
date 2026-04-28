---
description: Delegated validation-only work-item execution chain
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> derive-tests -> impl-plan -> exec-worker-implement -> exec-worker-validation-fix -> finalize
chainContext: summary
restore: true
---

This command runs the delegated work-item implementation workflow.

Flow:

- resolve the work item and plan context in the parent session
- normalize the spec in the parent session
- derive the validation plan in the parent session
- plan the smallest change in the parent session
- delegate implementation to a fresh worker subagent using the implementation model
- delegate validation/fix to a fresh worker subagent using the validation/fix model and bounded convergence loop
- add a final work-item note and close only when validation proves the acceptance criteria are met

This command is validation-only: it does not run the review suite and does not claim review happened. Use `/review <work-item-ref>` for a fresh independent parallel review after implementation, and `/review-followups <work-item-ref>` to turn consolidated review findings into linked follow-up work items.

The worker steps do not mutate tracker state. Finalization remains in the parent session.
