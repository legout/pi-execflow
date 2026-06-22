---
description: Validate and apply minimal fixes until acceptance criteria pass or progress stops
argument-hint: "<work-item-ref> [context...]"
model: kimi-coding/k2p7, minimax/MiniMax-M3, openai-codex/gpt-5.4-mini
thinking: medium
subagent: ef-validation-fix
loop: 5
converge: true
fresh: true
skill: execution
restore: true
---

You are running one iteration of a validation/fix loop for exactly one work item.

This is the validation/fix loop used by the TDD-oriented `/ef-work-tdd` and `/ef-ship-tdd` chains. The earlier `/implement` step may edit code and tests, but it should not run tests, lint, type checks, builds, or manual verification.

The prompt-template loop stops on convergence when an iteration makes no file changes. Therefore:

- If validation passes, make no edits and report `Gate: PASS`.
- If validation fails but no safe scoped fix is possible, make no edits and report `Gate: BLOCKED`.
- If validation fails and a safe scoped fix is possible, apply the smallest fix and report `Gate: REVISE`; the file change allows the next loop iteration to revalidate.

A no-change `/implement` (for example on a re-dispatched work item whose implementation already exists) is **not** a reason to skip validation. Always run at least one validation iteration and emit a gate; the `/finalize` step runs in fresh context and may have no other validation evidence to close on.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Auto-selection context

When `$1` is empty, `--next`, or an autoship option such as `--max-retries`, use the immediately preceding `# Ship Selection` chain output as the target source:

- If it contains `Autoship selection: DISPATCH` or `Autoship selection: EXPLICIT_TARGET`, use `Selected work item` as the target work item.
- If it contains `Autoship selection: NO_READY`, `Autoship selection: ALL_READY_EXHAUSTED`, or `Autoship selection: ALREADY_CLOSED`, stop immediately: make no edits, run no validation commands, and output only `No ready work item selected; validation skipped.`
- If there is no preceding `# Ship Selection` output and `$1` is not an explicit work-item reference, stop and report `Gate: BLOCKED`.

## Your tasks for this iteration

1. Resolve the work item and relevant ExecPlan.
2. Extract the acceptance criteria, constraints, and validation expectations.
3. Inspect the current implementation state.
4. Run the most relevant validation commands needed for confidence:
   - tests
   - lint
   - type checks
   - build
   - manual behavior checks where applicable
5. Map each acceptance criterion to concrete evidence.
   - For branch-ref remediation or merge-ready branch work, validate the artifact the work item actually asks to publish or review. When the ticket names a branch that may have an `origin/<branch>` counterpart, run `git fetch origin` when a remote exists, inspect `origin/<branch>` as well as the local ref, and compare the requested base against the published ref. Do not report `Gate: PASS` from local-only branch state when the remote/review branch still has the failing diff or has not been checked.
6. If validation is a full pass:
   - make no code or tracker changes
   - state that the loop should converge because no fix is needed
7. If validation is partial or failed:
   - identify the smallest safe fix for the highest-priority validation failure or acceptance-criteria gap
   - apply only that fix
   - update tests only when needed to prove the intended behavior or when the existing test is demonstrably wrong
8. If no safe scoped fix is possible:
   - make no code changes
   - explain the blocker and exact manual follow-up needed

## Rules

- Validation failures and acceptance-criteria gaps are the source of truth.
- Do not fix review-only findings here unless they are also validation or acceptance-criteria failures.
- Do not widen the work-item scope.
- Do not refactor unrelated code.
- Do not mutate tracker state (`tk` / `br`) or repo-root `execflow/` runtime artifacts.
- Do not delete, move, or overwrite `.pi/`, `.pi/prompts/`, `.pi/agents/`, `.execflow/`, or prompt-template runtime files unless this work item explicitly targets pi-execflow scaffolding.
- Do not rewrite the active checkout with `git checkout`, `git switch`, `git reset --hard`, `git clean`, or equivalent commands during a ship/autoship chain. For branch-ref validation or remediation, prefer `git show`, `git diff`, `git branch -f`, or `git update-ref`; if a branch checkout is truly required, use a separate isolated worktree after inspecting `git worktree list`.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Prefer targeted validation first; run broader checks when needed for confidence or repository convention.
- If a command cannot be run, say exactly why and whether that leaves validation partial.
- The final validation verdict must include exactly one gate line: `Gate: PASS`, `Gate: REVISE`, or `Gate: BLOCKED`.
- Do not loop, retry, or re-derive evidence to chase a missing artifact. Run validation once, emit exactly one gate, and persist it as described below.

## Persisting the gate for the finalizer

The `/finalize` step runs in fresh context and often cannot see this iteration's transcript directly — most notably when the chain re-dispatches a work item whose implementation already exists and no fresh gate is emitted in-band. To make closure resilient, persist your gate **every iteration, including `Gate: PASS` with no code edits**.

After you have determined the gate, run exactly this via `bash` (not the `write`/`edit` tools, so this does not affect prompt-template loop convergence):

1. Resolve the package root:
   `root="$PWD"; [ -f "$root/scripts/validation-gate.mjs" ] || root="$PWD/.pi/git/github.com/legout/pi-execflow"; [ -f "$root/scripts/validation-gate.mjs" ] || root="$HOME/.pi/agent/git/github.com/legout/pi-execflow"`
2. Persist the gate:
   `node "$root/scripts/validation-gate.mjs" write --issue <id> --system <tk|br|other> --gate <PASS|REVISE|BLOCKED> --summary "<one-line evidence summary, <=200 chars>"`

Use the selected work item's id for `<id>` and the matching tracker for `<system>`. The helper records the current commit and a hash of the source dirty tree so the finalizer can tell whether the code it is closing on is still the code you validated.

If the helper script cannot be located or errors, skip persistence and continue with the in-transcript `Gate:` line as the primary evidence. Do not fail validation, loop, or retry because the gate file could not be written.

## Output format

Use exactly these sections:

# Validation/Fix Iteration

- Ticket:
- Ticket system: tk / br / other
- ExecPlan:
- Gate: PASS / REVISE / BLOCKED
- Iteration result: pass / fixed / blocked / partial
- Why:

# Commands Run

- Command 1:
  - Result:
- Command 2:
  - Result:

# Acceptance Criteria Evidence

- AC1:
  - Evidence:
  - Confidence:
- AC2:
  - Evidence:
  - Confidence:

# Fix Applied

- Files changed:
- Change summary:
- Tests updated:

# Remaining Gaps / Blockers

- Gap or blocker 1:
- Gap or blocker 2:

# Loop Guidance

- Should converge now: yes / no
- Reason:
