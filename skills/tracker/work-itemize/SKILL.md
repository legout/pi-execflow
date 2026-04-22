---
name: work-itemize
description: >
  Convert an ExecPlan's milestones into tracked work items, automatically
  selecting tk tickets or br issues from repo context unless the user forces a
  tracker with --tk or --br. Use when the user wants one entrypoint that works
  across both tracker backends.
---

# Work Itemize: ExecPlan → tk tickets or br issues

Convert an ExecPlan's milestones into actionable tracked work items with dependencies, priorities, and ExecPlan references.

The goal is not mechanical milestone-to-work-item conversion. The goal is a set of work items that are independently implementable where possible, dependency-accurate, and safe to schedule.

## Required inputs

- An ExecPlan must exist at `.execflow/plans/<topic-slug>/execplan.md`.
- If no ExecPlan exists, tell the user to run `/plan-create` first and stop.
- If multiple ExecPlans exist in `.execflow/plans/`, list them and ask which to split.
- The tracker must be explicitly forced with `--tk` or `--br`, or resolvable from repo context.

## Primary references

For tracker-specific details, also follow:

- `../ticketize/SKILL.md`
- `../issueize/SKILL.md`

## Tracker override parsing

1. If the input contains `--tk`, force `tk` mode.
2. If the input contains `--br`, force `br` mode.
3. If both `--tk` and `--br` are present, stop and ask the user to choose one.
4. Remove the tracker flag(s) before topic resolution.

## Topic resolution

1. If remaining user arguments contain a topic, convert it to `<topic-slug>` (kebab-case, lowercase) before resolving plan paths.
2. If no topic remains, scan `.execflow/plans/` for directories containing `execplan.md`. If exactly one match, use that directory name as `<topic-slug>`.
3. If multiple matches remain, list them and ask which plan to split.
4. If no matches remain, tell the user to create an ExecPlan first and stop.

## Tracker auto-selection

When no explicit tracker flag is provided, determine the tracker conservatively:

1. If `.tickets/` exists and `.beads/` does not exist, select `tk`.
2. If `.beads/` exists and `.tickets/` does not exist, select `br`.
3. If both exist, inspect `.execflow/AGENTS.md` for a line like:

       Primary tracker selected during init: `tk`

   or:

       Primary tracker selected during init: `br`

   Use that value if present.
4. If both tracker workspaces exist and no primary tracker can be determined from `.execflow/AGENTS.md`, stop and ask the user to rerun with `--tk` or `--br`.
5. If neither tracker workspace exists, tell the user to run `/init --tk` or `/init --br` first and stop.

## Shared shaping rules

### Default: one work item per independently verifiable milestone

If a milestone already represents a coherent, independently verifiable slice, make it one tracked work item.

### Prefer vertical slices when splitting

If a milestone contains multiple end-to-end slices, use cases, workflows, or contract-visible behaviors, split it along those slice boundaries before considering file-count-based splits.

### Merge small adjacent milestones

If a milestone is a tiny enabler, migration follow-up, or cleanup step and the adjacent milestone is also small and tightly coupled, merge them into a single tracked work item when that yields a better review unit.

### Split large milestones conservatively

If a milestone is too large for one work item, first split it into 2-3 vertical work items. Only if no meaningful vertical split exists, split by bounded implementation areas with explicit sequential dependencies.

### Classify work item kind

Classify each resulting work item as one of:

- `vertical-slice`
- `enabler`
- `migration`
- `cleanup`
- `prototype`

Prefer `vertical-slice` unless the plan evidence clearly points elsewhere.

### Dependency ordering

Build a dependency DAG, not an automatic chain.

- Use explicit plan prerequisites first.
- `enabler` work items usually block the vertical slices that rely on them.
- `cleanup` work items usually depend on all slices that still rely on the old path.
- If two work items touch the same serialization point, prefer an explicit dependency unless the plan says they are safe in parallel.
- If the plan explicitly says milestones are parallel-safe, do not add unnecessary dependencies.
- Only fall back to milestone ordering when the plan gives no better dependency signal.

### Soft links and conflict hints

Track non-blocking relationships separately from hard dependencies.

- Use `Related to` for work items that share context or are likely to be reviewed together.
- Use `Conflicts with` for work items that should usually not be implemented concurrently.
- Do not convert soft links into hard dependencies unless the plan or codebase evidence makes the prerequisite relationship real.

## ExecPlan Reference Block

Every created work item MUST include this block in its description:

```md
## ExecPlan Reference

- Plan: `.execflow/plans/<topic-slug>/execplan.md`
- Milestone: <milestone number and title>
- Read these sections before implementing:
  - "Context and Orientation" for repo layout and terms
  - Milestone <N> for this work item's scope
  - "Interfaces and Dependencies" for types and contracts
  - "Decision Log" for any decisions already made
```

When useful, append this optional block after the ExecPlan Reference block:

```md
## Scheduling Hints

- Kind: vertical-slice | enabler | migration | cleanup | prototype
- Depends on: <ids, milestone names, or none>
- Related to: <ids, milestone names, or none>
- Conflicts with: <ids, milestone names, or none>
- Parallel-safe with: <ids, milestone names, or none/unknown>
- Serialization points: <shared boundary that should not be changed concurrently>
- Suggested worktree isolation: required | recommended | optional
```

## tk mode behavior

When the selected tracker is `tk`:

1. Follow the ticketization rules from `skills/tracker/ticketize/SKILL.md`.
2. Create work items with `tk create`.
3. Set hard dependencies with `tk dep <id> <dep-id>`.
4. Report created ticket IDs and scheduling hints.
5. Suggest `/execflow`, `/execflow-queue`, or `/exec-standard <ticket-ref>` next.

## br mode behavior

When the selected tracker is `br`:

1. Follow the issueization rules from `skills/tracker/issueize/SKILL.md`.
2. Ensure `.beads/` exists.
3. Use `ACTOR="${BR_ACTOR:-assistant}"` and prefer `RUST_LOG=error br ... --json`.
4. Create work items with `br create`.
5. Set hard dependencies with:

       ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br dep add <child-id> <parent-id> --type blocks --actor "$ACTOR" --json

6. Encode soft links as `related` dependencies only when the plan makes them explicit enough to justify it. Otherwise keep them in the issue description.
7. Finish with:

       ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br sync --flush-only

8. Report created issue IDs and scheduling hints.
9. Suggest `/exec-standard <issue-ref>` or focused prompts (`/resolve`, `/spec`, `/implement`, `/validate`, `/review`, `/finalize`) next.

## Hard rules

- Do not modify the ExecPlan.
- Do not implement code.
- Do not close or mutate unrelated existing work items.
- Prefer dependency accuracy over mechanical milestone ordering.
- Do not invent parallel safety when the plan or codebase evidence is unclear.
- Every created work item MUST include an ExecPlan Reference block.
- If the tracker cannot be resolved confidently, stop and ask rather than guessing.
