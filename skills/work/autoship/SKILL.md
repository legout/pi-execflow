---
name: autoship
description: Sequentially drain ready br issues or tk tickets through the existing ship chains with retry limits and progress state.
---

# Autoship

Use this skill when working on `/ef-autoship` or `/ef-autoship-tdd` behavior.

Autoship is implemented as a prompt chain loop, not as a nested `run-prompt` orchestrator. The chain selects one ready item, ships it through the normal work/review/finalize path, then repeats until the selector reports no eligible ready work or all ready work is exhausted by retry limits.

## Commands

- `/ef-autoship [--max-retries N]` runs the quick chain:
  `ship-resolve -> ef-work -> ef-review-with-followups -> finalize`
- `/ef-autoship-tdd [--max-retries N]` runs the TDD chain:
  `ship-tdd-resolve -> spec -> implement -> validation-fix -> ef-review-with-followups -> finalize`
- `/ef-ship [<work-item-ref>|--next] [--max-retries N]` uses the same quick chain.
- `/ef-ship-tdd [<work-item-ref>|--next] [--max-retries N]` uses the same TDD chain.

## Selection

`ship-resolve` and `ship-tdd-resolve` own ready-work selection.

- Explicit work-item reference → resolve that item directly.
- Empty input, `--next`, or autoship options → call `scripts/autoship-state.mjs next`.
- Quick mode must pass `--mode ship`.
- TDD mode must pass `--mode ship-tdd`.
- Parse only `--max-retries N`; default is `2`; reject non-integer, negative, or values greater than `20`.

The helper records attempts in `.execflow/autoship-progress.json` and ensures `.execflow/lessons-learned.md` exists. `--max-retries 2` means up to three total attempts per issue in one autoship run: one initial attempt plus two retries.

On next-ready `dispatch`, selector prompts must also write `.pi/execflow-autoship-loop-marker.json` using the `write` tool. This harmless marker is not tracker state; it exists because prompt-template loop convergence currently detects productive iterations through `write`/`edit` tool calls, while delegated subagent and shell mutations may report `changed: false`. Do not write this marker on `stop` results, so the no-work iteration still converges cleanly.

## Stop behavior

When the selector returns `status: stop`, it must emit a no-work `# Ship Selection` result. Downstream chain steps must treat that as a clean no-op:

- no edits
- no validation/review commands
- no commits
- no tracker notes/comments
- no tracker closure

This no-op iteration lets the chain loop converge without relying on nested prompt dispatch.

## Persisted validation gate

The TDD chain (`ship-tdd-resolve -> spec -> implement -> validation-fix -> ef-review-with-followups -> finalize`) can re-dispatch a work item whose implementation already exists. When that happens the `/validation-fix` transcript may not carry forward into the fresh-context `/finalize` step, and the finalizer used to return `REVISE` purely for lack of a visible `Gate: PASS` — burning retries and, on the last attempt, aborting.

To make closure resilient, `/validation-fix` persists its gate to `.execflow/validation-gate.json` via `scripts/validation-gate.mjs write` (invoked through `bash`, so prompt-template loop convergence is unaffected), and `/finalize` consults it via `scripts/validation-gate.mjs verify`. A persisted `PASS` gate is only `closable` when both the recorded commit and the source dirty-tree hash still match the current tree — i.e. the code being closed on is byte-identical to the code that was validated. The gate file is gitignored workflow state; never stage or commit it.

Both leaf prompts degrade gracefully: if the helper is missing or errors, they fall back to the in-transcript gate and the normal `REVISE`/`BLOCKED` rules, so the chain is never broken by a persistence failure.

## What autoship must not do

- Do not call `run-prompt` from inside autoship.
- Do not inline a separate `/ef-ship` or `/ef-ship-tdd` command.
- Do not bypass the normal work/review/finalize chain.
- Do not mutate tracker state from selector prompts except through the existing progress file created by `autoship-state.mjs`; the `.pi/execflow-autoship-loop-marker.json` convergence marker is allowed because it is local prompt-loop state, not tracker state.
- Do not append routine status updates, raw transcripts, or duplicates to `.execflow/lessons-learned.md`.

## Lessons learned

At the start of each selected work iteration, downstream steps may read `.execflow/lessons-learned.md` if it exists.

Append only durable, non-obvious lessons discovered from ship output. Before appending, scan existing entries and skip substantively identical lessons.
