---
name: planning
description: Create a minimal work-item implementation plan by combining resolution, scope control, test awareness, and local repo conventions. Use for prompts that identify the smallest safe edit sequence.
---

# Planning

Use this skill when planning the smallest reasonable implementation for one work item.

## Purpose

This composite skill exists so a planning prompt can load one skill while still benefiting from the repo's lower-level work-item heuristics.

## Primary references

Read these sibling skills when you need more detail:

- `../resolve/SKILL.md`
- `../scope/SKILL.md`
- `../repo-conventions/SKILL.md`
- `../testing/SKILL.md`

## Primary objective

Identify the smallest edit sequence likely to satisfy the work item while preserving local consistency.

## Planning priorities

1. Understand the work item and any ExecPlan guidance.
2. Identify likely files to inspect before changing anything.
3. Minimize code churn and file count.
4. Preserve local patterns and test style.
5. Call out risks and out-of-scope work explicitly.

## Rules

- Keep the plan minimal and concrete.
- Prefer modifying existing code paths over introducing new ones.
- Include likely test updates, not just code edits.
- Explicitly state what should not be touched.
- Do not smuggle redesign or cleanup into the plan.

## Completion checklist

Before finishing, verify:

- the plan is grounded in the resolved work item
- likely files and edits are concrete
- test touchpoints are identified
- out-of-scope areas are explicit
- a reviewer would consider the plan appropriately narrow