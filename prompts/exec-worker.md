---
description: Delegated worker chain for implementation and validation/fix
argument-hint: "<work-item-ref> [context...]"
chain: exec-worker-implement -> exec-worker-validation-fix
chainContext: summary
restore: true
---

This command delegates implementation and validation/fix work to worker subagents.

Flow:

- run `/exec-worker-implement` in a fresh worker subagent using the implementation model
- run `/exec-worker-validation-fix` in a fresh worker subagent using the validation/fix model and bounded convergence loop

This command does not mutate tracker state and does not finalize the work item. Use `/finalize <work-item-ref>` after validation evidence supports closure.

Note: `/exec-delegated` inlines these two worker steps instead of nesting `/exec-worker`, because prompt-template chain nesting is not supported.
