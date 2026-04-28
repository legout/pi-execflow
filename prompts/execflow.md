---
description: Fast validation-only work-item execution chain
argument-hint: "<work-item-ref> [context...]"
chain: resolve -> spec -> derive-tests -> impl-plan -> implement -> validation-fix -> finalize
chainContext: summary
restore: true
---

This command runs the default fast work-item implementation workflow.

Flow:

- resolve the work item and plan context
- normalize the spec
- derive the validation plan
- plan the smallest change
- implement the work item
- run `/validation-fix`, which validates and applies minimal scoped fixes in a bounded loop until acceptance criteria pass or progress stops
- add a final work-item note and close only when validation proves the acceptance criteria are met

This command is validation-only: it does not run the parallel review suite and does not claim review happened. Use `/review <work-item-ref>` for a fresh independent review after implementation, and `/review-followups <work-item-ref>` to turn consolidated review findings into linked follow-up work items.
