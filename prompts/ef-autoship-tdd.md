---
description: Sequentially ship br or tk ready work with /ef-ship-tdd until no eligible work remains
argument-hint: "[--max-retries N] [context...]"
model: zai/glm-5-turbo
thinking: medium
loop: unlimited
fresh: true
converge: true
skill: autoship
restore: true
---

You are running TDD autoship mode (`/ef-autoship-tdd`).

This is an orchestration loop, not an implementation loop. Select the next eligible ready `br` issue or `tk` ticket, record progress, and dispatch the existing `/ef-ship-tdd <issue-or-ticket>` workflow through `run-prompt`. Do not implement, validate, review, commit, or close issues from this prompt.

## Inputs

- Optional flag: `--max-retries N` (default: 2)
- Optional context: `${@:2}`

## Mode

Always pass `--mode ship-tdd` to the autoship state helper.

The only dispatch command allowed is the exact command returned by the helper, and it must begin with `ef-ship-tdd `.

## Workflow for each loop iteration

1. Check that the `run-prompt` tool is available. If it is disabled, stop and tell the user to run `/prompt-tool on`, then retry `/ef-autoship-tdd`.
2. Parse `--max-retries N` and default to 2.
3. Locate the installed `@legout/pi-execflow` package root using the search order from `/ef-sync`.
4. Run `node <package-root>/scripts/autoship-state.mjs next --mode ship-tdd --max-retries <N>` and let the helper auto-detect `br` or `tk`.
5. Parse the helper JSON output.
6. If `status` is `dispatch`, verify the command begins with `ef-ship-tdd ` and call `run-prompt` with exactly that command.
7. If `status` is `stop`, report the stop reason and end without calling `run-prompt`.
8. Read `.execflow/lessons-learned.md` if it exists and append only durable, non-obvious lessons from this iteration's ship output.

## Rules

- Follow the `autoship` skill for full orchestration policy.
- Do not inline the `/ef-ship-tdd` workflow.
- Do not dispatch any command that does not begin with `ef-ship-tdd `.
- Do not mutate tracker state or edit files directly from this orchestrator.
- Do not append routine status updates or transcripts to `.execflow/lessons-learned.md`.

## Output format

Report each iteration with:

- Selected tracker (`br` or `tk`)
- Selected issue or ticket id
- Attempt number / max attempts
- Queued command (when dispatching)
- Progress path: `.execflow/autoship-progress.json`
- Lessons path: `.execflow/lessons-learned.md`
- Stop reason (when stopping)
