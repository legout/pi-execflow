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
- If no ExecPlan exists, tell the user to run `/create-plan` first and stop.
- If multiple ExecPlans exist in `.execflow/plans/`, list them and ask which to split.
- The tracker must be explicitly forced with `--tk` or `--br`, or resolvable from repo context.

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

       Primary tracker selected during init-execflow: `tk`

   or:

       Primary tracker selected during init-execflow: `br`

   Use that value if present.
4. If both tracker workspaces exist and no primary tracker can be determined from `.execflow/AGENTS.md`, stop and ask the user to rerun with `--tk` or `--br`.
5. If neither tracker workspace exists, tell the user to run `/init-execflow --tk` or `/init-execflow --br` first and stop.

## Shared shaping rules

### Prefer the ExecPlan task graph

If the ExecPlan has a `Task Graph`, use it as the primary source for work-item boundaries and dependencies. Treat the milestone list as supporting context, not the only splitting source.

Extract, when present:

- task ids, titles, and task kinds
- hard prerequisites and dependency direction
- related-but-not-blocking links
- vertical slices and observable behavior per task
- likely files, shared boundaries, registries, generated files, migrations, or configuration files
- validation commands and expected proof
- RED/GREEN expectations or explicit exemptions
- out-of-scope notes

If the `Task Graph` conflicts with milestone prose, stop and ask for clarification unless the contradiction is obviously a wording issue that can be resolved from nearby plan text. Do not silently choose a dependency direction.

### Default: one work item per independently verifiable milestone

If no useful `Task Graph` exists, derive work items from independently verifiable milestones. If a milestone already represents a coherent, independently verifiable slice, make it one tracked work item.

An independently verifiable milestone should name the behavior, command, artifact, or documentation state that proves completion. If the milestone lacks observable proof, include a validation clarification in the work item instead of pretending the proof is obvious.

### Prefer vertical slices when splitting

If a milestone contains multiple end-to-end slices, use cases, workflows, or contract-visible behaviors, split it along those slice boundaries before considering file-count-based splits.

A vertical tracer-bullet work item should prove one behavior through the smallest meaningful path across the system. It is better to create three small end-to-end items than one horizontal item for all prompts, all docs, all tests, or all refactors when those pieces can land independently.

Avoid horizontal work items such as "update all models", "rewrite all tests", or "refactor all commands" unless the plan classifies them as `enabler`, `migration`, `prototype`, or `cleanup` and explains why they cannot be sliced vertically.

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

- Preserve explicit `Task Graph` dependency direction first.
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

### Conservative parallel and worktree hints

Parallel execution hints are optional scheduling metadata, not permission to run tasks concurrently by default.

Set `Parallel-safe with` only when the ExecPlan or code evidence shows the tasks do not edit the same files, generated outputs, package manifests, schema migrations, central registries, public interfaces, global configuration, or other shared serialization points. If two tasks touch a shared boundary, mark them as `Conflicts with` or add a hard dependency unless the plan names a stable contract that makes parallel edits safe.

Set `Suggested worktree isolation` conservatively:

- `required` when the work is large, risky, or intentionally parallel and must not share a checkout with other edits
- `recommended` when the task touches several files or shared conventions but can still be done sequentially
- `optional` for small, low-risk, single-checkout work

When recommending or requiring worktree isolation, include notes that implementers must detect whether they are already isolated, verify a clean baseline before starting, and must not delete or clean up harness-owned or unknown worktrees.

### Required work-item body fields

Each created work item body must include the ExecPlan Reference block and enough local context to execute the item without rereading every sibling item.

After the ExecPlan Reference block, include these sections when the plan provides the information or it can be inferred safely:

```md
## Acceptance Criteria

- <observable behavior or artifact>

## Implementation Scope

- Likely files: <repo-relative paths or unknown>
- In scope: <smallest behavior slice>
- Out of scope: <explicit exclusions from the ExecPlan/task graph>

## Validation

- Commands: <exact commands, manual proof, or "to be determined during specification">
- RED/GREEN: required | exempt: <reason> | unknown: clarify before implementation

## Scheduling Hints

- Kind: vertical-slice | enabler | migration | cleanup | prototype
- Depends on: <ids, task names, milestone names, or none>
- Related to: <ids, task names, milestone names, or none>
- Conflicts with: <ids, task names, milestone names, or none>
- Parallel-safe with: <ids, task names, milestone names, or none/unknown>
- Serialization points: <shared boundary that should not be changed concurrently>
- Suggested worktree isolation: required | recommended | optional
- Worktree notes: <existing-isolation check, clean-baseline requirement, cleanup limits, or none>
```

Use `unknown: clarify before implementation` rather than inventing validation commands, RED/GREEN status, likely files, or parallel safety. For docs-only, planning-only, exploratory, or untestable work, record a RED/GREEN exemption with a reason.

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

Append the scheduling fields after the ExecPlan Reference block, either as part of `## Scheduling Hints` or the broader required work-item body described above:

```md
## Scheduling Hints

- Kind: vertical-slice | enabler | migration | cleanup | prototype
- Depends on: <ids, milestone names, or none>
- Related to: <ids, milestone names, or none>
- Conflicts with: <ids, milestone names, or none>
- Parallel-safe with: <ids, milestone names, or none/unknown>
- Serialization points: <shared boundary that should not be changed concurrently>
- Suggested worktree isolation: required | recommended | optional
- Worktree notes: <existing-isolation check, clean-baseline requirement, cleanup limits, or none>
```

## tk mode behavior

When the selected tracker is `tk`:

1. Create work items with `tk create`.
2. Set hard dependencies with `tk dep <id> <dep-id>`.
3. Report created ticket IDs and scheduling hints.
4. Suggest `/ef-work <ticket-ref>` for the quick implementation workflow, `/ef-work-tdd <ticket-ref>` when TDD/spec validation is warranted, and `/ef-review <ticket-ref>` for read-only review. Mention `/ef-review <ticket-ref> --create-followups` when tracker follow-ups are desired. Mention optional external `/execflow-queue` only if that delegated `tk` workflow is available.

## br mode behavior

When the selected tracker is `br`:

1. Ensure `.beads/` exists.
2. Use `ACTOR="${BR_ACTOR:-assistant}"` and prefer `RUST_LOG=error br ... --json`.
3. Create work items with `br create`.
4. Set hard dependencies with:

       ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br dep add <child-id> <parent-id> --type blocks --actor "$ACTOR" --json

5. Encode soft links as `related` dependencies only when the plan makes them explicit enough to justify it. Otherwise keep them in the issue description.
6. Finish with:

       ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br sync --flush-only

7. Report created issue IDs and scheduling hints.
8. Suggest `/ef-work <issue-ref>` for the quick implementation workflow, `/ef-work-tdd <issue-ref>` when TDD/spec validation is warranted, `/ef-review <issue-ref>` for read-only review, and `/ef-review <issue-ref> --create-followups` when tracker follow-ups are desired.

## Hard rules

- Do not modify the ExecPlan.
- Do not implement code.
- Do not close or mutate unrelated existing work items.
- Prefer dependency accuracy over mechanical milestone ordering.
- Do not invent parallel safety when the plan or codebase evidence is unclear.
- Do not recommend parallel execution for tasks that share files, registries, migrations, generated outputs, public interfaces, manifests, or global config unless a stable contract makes the split safe.
- Every created work item MUST include an ExecPlan Reference block.
- Every created work item MUST include acceptance criteria, scope/out-of-scope notes, validation expectations, RED/GREEN status or exemption, and scheduling/conflict hints when that information is available.
- Prefer `unknown: clarify before implementation` over fabricated likely files, commands, dependencies, or parallel safety.
- Never tell an implementer to remove, prune, or clean up worktrees unless the work item explicitly created that worktree and can prove it is not harness-owned.
- If the tracker cannot be resolved confidently, stop and ask rather than guessing.
