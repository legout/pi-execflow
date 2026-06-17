---
description: Resolve an explicit work item or select the next ready item for /ef-ship-tdd
argument-hint: "[<work-item-ref>|--next] [--max-retries N] [context...]"
model: openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding
thinking: low
fresh: true
skill: resolve
restore: true
---

You are selecting the single work item for one `/ef-ship-tdd` chain iteration.

## Inputs

- Target work-item reference, `--next`, or empty: `$1`
- Optional flags/context: `${@:2}`

## Selection modes

Use **next-ready mode** when no explicit work-item reference is provided:

- `$1` is empty
- `$1` is `--next`
- `$1` is an autoship option such as `--max-retries`

Use **explicit-target mode** for any other `$1` value.

## Next-ready mode

1. Parse only `--max-retries N`; default to `2`.
2. Reject non-integer, negative, or values greater than `20`.
3. Locate the installed `@legout/pi-execflow` package root using this search order:
   1. `$PWD`
   2. `$PWD/.pi/git/github.com/legout/pi-execflow`
   3. `$HOME/.pi/agent/git/github.com/legout/pi-execflow`
4. Run exactly:
   `node <package-root>/scripts/autoship-state.mjs next --mode ship-tdd --max-retries <N>`
5. Parse the helper JSON conservatively.
6. If `status` is `dispatch`, select `issueId` as the work-item reference for this chain iteration.
7. In next-ready mode only, after a `dispatch` result and before final output, call the `write` tool to write `.pi/execflow-autoship-loop-marker.json` with a small JSON object containing at least `mode`, `issueId`, `attempt`, `maxAttempts`, and `progressPath` from the helper result. This marker is intentionally outside tracker state; it exists only so prompt-template convergence sees a file write on productive dispatch iterations.
8. If `status` is `stop`, this chain iteration is the clean loop stop condition. Do not resolve or select any work item and do not write the convergence marker.

## Explicit-target mode

Resolve `$1` using the normal work-item resolution rules:

1. If `$1` is an existing file path, use it directly and treat it as a file-backed ticket.
2. Determine tracker preference from repository state:
   - only `.beads/` exists → prefer `br`
   - only `.tickets/` exists → prefer `tk`
   - both exist → prefer the tracker declared in `.execflow/AGENTS.md`, then `.execflow/settings.yml`
3. Resolve against the preferred tracker first:
   - `tk` → search `.tickets/` for exact ID match, exact filename match, then slug/title similarity
   - `br` → try `RUST_LOG=error br show "$1" --json`, then `RUST_LOG=error br search "$1" --json` or `RUST_LOG=error br list --json`
4. If still unresolved and the other tracker exists, try the other tracker as a fallback.
5. If multiple plausible matches remain, stop and list candidates.
6. If the explicit target is already closed/done, treat this as a no-op stop condition for loop convergence.

## ExecPlan lookup

For a selected work item, search `.execflow/plans/` for the best matching plan using:

- ticket ID
- filename similarity
- title/slug similarity
- references in plan content

## Output format

Use exactly one of these statuses.

### Selected work

# Ship Selection

- Autoship selection: DISPATCH / EXPLICIT_TARGET
- Selected work item:
- Ticket system: tk / br / other
- Attempt: N / M, or n/a
- Progress path: `.execflow/autoship-progress.json`, or n/a
- Lessons path: `.execflow/lessons-learned.md`, or n/a
- Convergence marker: `.pi/execflow-autoship-loop-marker.json` written / not written

# Ticket Summary

- Title:
- Plain-language summary:
- Key visible requirements:

# ExecPlan Resolution

- Matching plan path:
- Resolution confidence:
- If none found, say: `No matching ExecPlan found`

# Downstream Instruction

Downstream chain steps must use `Selected work item` as their target when their `$1` is empty, `--next`, or an autoship option.

### No work selected

# Ship Selection

- Autoship selection: NO_READY / ALL_READY_EXHAUSTED / ALREADY_CLOSED
- Selected work item: none
- Ticket system: tk / br / other / none
- Stop reason:
- Exhausted issue ids, if any:
- Progress path: `.execflow/autoship-progress.json`, or n/a
- Lessons path: `.execflow/lessons-learned.md`, or n/a
- Convergence marker: not written

# Downstream Instruction

No work item was selected. Downstream chain steps must make no edits, run no validation/review/finalization commands, add no comments, create no commits, and close no tracker items. This is a clean no-op loop stop condition.
