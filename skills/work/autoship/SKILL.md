---
name: autoship
description: Sequentially dispatch existing pi-execflow ship commands for br ready issues, with retry limits, progress state, and lessons learned.
---

# Autoship

Use this skill when running `/ef-autoship` or `/ef-autoship-tdd`.

Autoship is an orchestration loop, not a work-implementation loop. It selects the next eligible ready `br` issue, records progress in `.execflow/autoship-progress.json`, and dispatches the existing `ef-ship <issue>` or `ef-ship-tdd <issue>` command through the `run-prompt` tool. It must never inline implementation, validation, review, commit, or tracker-close logic.

## Mode

- `/ef-autoship` runs in `ship` mode and must pass `--mode ship` to the state helper.
- `/ef-autoship-tdd` runs in `ship-tdd` mode and must pass `--mode ship-tdd` to the state helper.

## Inputs

Parse the slash-command arguments. The only supported flag is `--max-retries N`.

- If omitted, default to `--max-retries 2`.
- Reject non-integer, negative, or values greater than 20 with an actionable error.
- `--max-retries 2` means up to three total attempts per issue in one autoship run (one initial attempt plus two retries).

## Fail-closed setup check

Before doing anything else, verify the `run-prompt` tool is available.

- If it is unavailable or disabled, stop immediately.
- Do not inline the `/ef-ship` or `/ef-ship-tdd` workflow.
- Tell the user to run `/prompt-tool on` and then retry autoship.

## Locate the package script

Find the installed `@legout/pi-execflow` package root using the same search order used by `/ef-sync`:

1. `$PWD`
2. `$PWD/.pi/git/github.com/legout/pi-execflow`
3. `$HOME/.pi/agent/git/github.com/legout/pi-execflow`

Use the first root that contains `scripts/autoship-state.mjs`.

## Select the next issue

Run the state helper:

```text
node <package-root>/scripts/autoship-state.mjs next --mode <ship|ship-tdd> --max-retries <N>
```

The helper prints a single JSON object to stdout. Parse it conservatively; treat non-JSON output as an error.

## Dispatch policy

Only the exact command returned by the state helper may be queued. Verify the prefix before calling `run-prompt`:

- In `ship` mode, the command must begin with `ef-ship `.
- In `ship-tdd` mode, the command must begin with `ef-ship-tdd `.

If the helper returns `{"status": "dispatch", "command": ...}`, call `run-prompt` with exactly that command string and no extra arguments.

If the helper returns `{"status": "stop", ...}`, do not call `run-prompt`. Report the stop reason (`no-ready-issues` or `all-ready-issues-exhausted`), the exhausted issue ids when provided, and end the iteration.

## What autoship must not do

- Do not implement, edit, validate, review, plan, or mutate tracker state from this orchestrator.
- Do not commit, push, or close issues.
- Do not dispatch any command that does not match the helper output.
- Do not dispatch commands that do not begin with the correct `ef-ship` or `ef-ship-tdd` prefix for the current mode.

## Lessons learned

At the start of each loop iteration, read `.execflow/lessons-learned.md` if it exists.

- Append only durable, non-obvious lessons discovered from prior ship output.
- Do not append routine status updates, raw transcripts, or duplicate entries.
- Before appending, scan existing entries and skip the new entry if a substantively identical lesson is already recorded.

## Output format

Report the result of each iteration using these fields:

- Selected issue id
- Attempt number and max attempts
- Queued command (only when `status` is `dispatch`)
- Progress file path (`.execflow/autoship-progress.json`)
- Lessons file path (`.execflow/lessons-learned.md`)
- Stop reason (only when `status` is `stop`)
