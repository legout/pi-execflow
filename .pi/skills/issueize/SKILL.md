---
name: issueize
description: >
  Convert an ExecPlan's milestones into br issues. Sets dependencies,
  priorities, and embeds ExecPlan references so issue workers can read plan
  context during implementation. Use when converting a plan into actionable
  br issues.
---

# Issueize: ExecPlan → br Issues

Convert an ExecPlan's milestones into actionable `br` issues with dependencies, priorities, and ExecPlan references.

The goal is not mechanical milestone-to-issue conversion. The goal is a set of issues that are independently implementable where possible, dependency-accurate, and safe to schedule.

## Required inputs

- An ExecPlan must exist at `.ticket-flow/plans/<topic-slug>/execplan.md`.
- A `br` workspace must exist at `.beads/`.
- If no ExecPlan exists, tell the user to run `/plan-create` first and stop.
- If `.beads/` does not exist, tell the user to run `/ticket-flow-init --br` first and stop.
- If multiple ExecPlans exist in `.ticket-flow/plans/`, list them and ask which to issueize.

## Primary references

For `br` command discipline and workspace behavior, also follow the installed `br` skill when it is available in the Pi environment.

This skill already inlines the critical `br` rules it depends on, so execution should still be possible even when that external skill is unavailable.

## Topic resolution

1. If the user provides a topic argument, convert it to `<topic-slug>` (kebab-case, lowercase) before resolving plan paths.
2. If no argument, scan `.ticket-flow/plans/` for directories containing `execplan.md`. If exactly one match, use that directory name as `<topic-slug>`.
3. If multiple matches, list them and ask which to issueize.
4. If no matches, tell the user to create an ExecPlan first and stop.

## Command discipline

Use `br` carefully and consistently:

- prefer `ACTOR="${BR_ACTOR:-assistant}"`
- prefer `RUST_LOG=error br ... --json`
- never assume `.beads/` is a directory of per-issue markdown files
- finish by flushing JSONL with `RUST_LOG=error br sync --flush-only`
- do not run unrelated `br` triage, ready, or closure commands in this step

## Behavior

1. Read `.ticket-flow/plans/<topic-slug>/execplan.md` in full.
2. Parse all milestones from the Milestones section.
3. Extract any explicit dependency, sequencing, parallelism, related-work, conflict-risk, enabler, migration, cleanup, or prototype cues from milestone prose and the rest of the ExecPlan.
4. For each milestone, determine issue granularity (see Smart Issueization Rules).
5. For each resulting issue, create a `br` issue using `br create` with:
   - Title from the milestone name
   - Description from the milestone prose, concrete steps, and acceptance criteria
   - Priority based on milestone ordering
   - The ExecPlan Reference block
   - Issue type / scheduling hints when relevant
6. Set hard dependencies from explicit prerequisites first, then from inferred blocking relationships, and only fall back to milestone ordering when the plan provides no better dependency signal.
7. Report all created issues with their IDs.

## ExecPlan Reference Block

Every issue created by this skill MUST include this block in its description:

```md
## ExecPlan Reference

- Plan: `.ticket-flow/plans/<topic-slug>/execplan.md`
- Milestone: <milestone number and title>
- Read these sections before implementing:
  - "Context and Orientation" for repo layout and terms
  - Milestone <N> for this issue's scope
  - "Interfaces and Dependencies" for types and contracts
  - "Decision Log" for any decisions already made
```

When useful, append this optional block after the ExecPlan Reference block:

```md
## Scheduling Hints

- Kind: vertical-slice | enabler | migration | cleanup | prototype
- Depends on: <issue ids, milestone names, or none>
- Related to: <issue ids, milestone names, or none>
- Conflicts with: <issue ids, milestone names, or none>
- Parallel-safe with: <issue ids, milestone names, or none/unknown>
- Serialization points: <shared boundary that should not be changed concurrently>
- Suggested worktree isolation: required | recommended | optional
```

Use it when the plan makes the scheduling intent clear enough to be helpful.

Interpretation:

- `Depends on` is a hard scheduling constraint and should be reflected in `br dep add ... --type blocks` dependencies.
- `Related to` is a soft link for context and traceability only; encode it as a `related` dependency only when the plan makes the relationship explicit enough to justify it. Otherwise leave it in the description only.
- `Conflicts with` means the issues may be logically independent but are poor candidates for concurrent implementation because they likely collide in files, tests, shared contracts, schema, or merge behavior.
- `Parallel-safe with` is a positive signal that concurrent work is acceptable.
- `Suggested worktree isolation` indicates whether concurrent work should happen in separate worktrees to reduce risk.

## Smart Issueization Rules

### Default: one issue per independently verifiable milestone

If a milestone already represents a coherent, independently verifiable slice, make it one issue.

### Prefer vertical slices when splitting

If a milestone contains multiple end-to-end slices, use cases, workflows, or contract-visible behaviors, split it along those slice boundaries before considering file-count-based splits.

Prefer issues like:

- `create item end-to-end`
- `list items end-to-end`
- `migrate callers to new adapter`

over issues like:

- `update data layer`
- `update service layer`
- `update UI layer`

### Merge small adjacent milestones

If a milestone is a tiny enabler, migration follow-up, or cleanup step and the adjacent milestone is also small and tightly coupled, merge them into a single issue when that yields a more reviewable unit. The merged issue references both milestones.

### Split large milestones

If a milestone is too large for one issue, first split it into 2-3 vertical issues. Only if no meaningful vertical split exists, split by bounded implementation areas with explicit sequential dependencies. Each split issue references the same milestone but covers a distinct, reviewable subset.

### Classify issue kind

Classify each resulting issue as one of:

- `vertical-slice` — delivers observable or contract-visible behavior end-to-end
- `enabler` — introduces a seam, contract, or infrastructure prerequisite
- `migration` — moves callers or data from old path to new path
- `cleanup` — removes obsolete paths or temporary compatibility code
- `prototype` — validates feasibility before wider rollout

Prefer `vertical-slice` issues unless the plan evidence clearly calls for another kind.

### Map issue kind to `br` type conservatively

Use these defaults unless the plan clearly points elsewhere:

- `vertical-slice` → `feature` when it adds user-visible behavior, otherwise `task`
- `enabler` → `task`
- `migration` → `task`
- `cleanup` → `task` or `docs` if the work is documentation-only
- `prototype` → `task`

Do not create `epic` issues unless the ExecPlan clearly calls for a parent grouping issue.

### Priority assignment

Map milestone ordering to `br` priorities conservatively:

- First milestone → `1` (high)
- Second milestone → `2` (medium)
- Later milestones → `2` or `3` depending on criticality
- Pure follow-up cleanup can be `3` or `4`

### Dependency ordering

Build a dependency DAG, not an automatic chain.

- Use explicit plan prerequisites first.
- `enabler` issues usually block the vertical slices that rely on them.
- `cleanup` issues usually depend on all slices that still rely on the old path.
- If two issues touch the same serialization point, prefer an explicit dependency unless the plan says they are safe in parallel.
- If the plan explicitly says milestones are parallel-safe, do not add unnecessary dependencies.
- Only fall back to milestone ordering when the plan gives no better dependency signal.

### Soft links and conflict hints

Track non-blocking relationships separately from hard dependencies.

- Use `Related to` for issues that share context, belong to the same slice family, or are likely to be reviewed together, but do not require ordering.
- Use `Conflicts with` for issues that should usually not be implemented concurrently even if neither logically depends on the other.
- Prefer `Conflicts with` when issues touch the same shared contract, schema migration area, registry, package manifest, central config, or broad integration tests.
- Do not convert `Related to` or `Conflicts with` into blocking dependencies unless the ExecPlan clearly states they are true prerequisites.

## Dependency commands

For blocking dependencies between created issues, use:

    ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br dep add <child-id> <parent-id> --type blocks --actor "$ACTOR" --json

For soft links that are explicit and helpful enough to encode, you may use:

    ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br dep add <issue-id> <related-id> --type related --actor "$ACTOR" --json

When in doubt, keep soft scheduling hints in the issue description rather than encoding them as graph edges.

## Issue description format

For each issue, include:

1. The milestone's goal, work, and result as prose.
2. The concrete steps relevant to this milestone.
3. Observable acceptance criteria from the plan's Validation and Acceptance section.
4. The ExecPlan Reference block.
5. Optional scheduling hints when they clarify dependencies, related work, conflict risk, or parallel-safety.

## Output

- Report the number of issues created.
- List each issue with: ID, title, kind, priority, dependencies, and any related/conflict hints that matter for scheduling.
- Note the ExecPlan path for traceability.

## Hard rules

- Do not modify the ExecPlan.
- Do not implement code.
- Do not close or modify unrelated existing issues.
- Prefer dependency accuracy over mechanical milestone ordering.
- Do not invent parallel safety when the plan or codebase evidence is unclear; use conservative dependencies instead.
- Do not turn soft links into hard dependencies unless the plan or codebase evidence makes the prerequisite relationship real.
- Every issue MUST have an ExecPlan Reference block.
- If `br` is not available, tell the user to install it and stop.
- Always finish with `RUST_LOG=error br sync --flush-only` after creating or linking issues.
