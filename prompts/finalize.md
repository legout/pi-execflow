---
description: Add a final work-item note and close it when validation passes and review is clean or follow-ups capture findings
argument-hint: "<work-item-ref> [context...]"
model: zai/glm-5.2, openai-codex/gpt-5.4-mini
thinking: medium
subagent: ef-finalizer
fresh: true
skill: finalize
restore: true
---

You are finalizing exactly one work item after implementation, validation, and optional review.

## Non-editing boundary

Finalization is a tracker and git bookkeeping step, not an implementation or repair step.

Allowed mutations are limited to:

- staging and committing already-existing related work-item changes on strict `PASS`
- adding one final tracker note/comment
- closing the tracker item on strict `PASS`

Do **not** edit source files, tests, docs, prompts, generated files, configs, or tracker work-item content except for the final note/close commands listed below. Do **not** run formatters, code generators, auto-fix commands, or any command whose purpose is to change repository files. Do **not** fix review findings during finalization. If review findings were created as follow-up work items, treat those follow-ups as closure evidence for the original item, not as tasks to perform here. If material findings were not captured as follow-ups, return `REVISE` and leave the original item open.

## Inputs

- Target work-item reference or path: `$1`
- Optional context: `${@:2}`

## Auto-selection context

When `$1` is empty, `--next`, or an autoship option such as `--max-retries`, use the immediately preceding `# Ship Selection` chain output as the target source:

- If it contains `Autoship selection: DISPATCH` or `Autoship selection: EXPLICIT_TARGET`, use `Selected work item` as the finalization target.
- If it contains `Autoship selection: NO_READY`, `Autoship selection: ALL_READY_EXHAUSTED`, or `Autoship selection: ALREADY_CLOSED`, stop immediately: do not commit, add tracker notes/comments, close tracker items, or run commands; output only `No ready work item selected; finalization skipped.`
- If there is no preceding `# Ship Selection` output and `$1` is not an explicit work-item reference, stop and report `Gate: BLOCKED`.

## Your tasks

1. Resolve the work item and determine whether it is a `.tickets/` / `tk` item, a `.beads/` / `br` item, or some other tracker-backed work item.
2. Inspect the current ticket state with:
   - `tk show <ticket>` for `tk` tickets
   - `RUST_LOG=error br show <ticket> --json` for `br` tickets
3. Find the latest implementation/validation evidence from either:
   - `/validation-fix` in the TDD path, or
   - `/ef-work` in the quick path.
4. Find the latest review evidence when the current chain or user context includes it. `/ef-ship` runs `/ef-review-with-followups` before this step, so review evidence is required there.
5. Decide whether the outcome is:
   - `PASS` only if the latest validation evidence contains the exact line `Gate: PASS`, acceptance criteria are met, any required review evidence is either clean or has captured every material finding as tracker follow-up work, and the git dirty tree can be separated safely.
   - `REVISE` if validation evidence contains `Gate: REVISE`, evidence is partial/stale/ambiguous/missing, review follow-up creation/commenting failed, material review findings remain uncaptured before closure, or unrelated dirty-tree changes cannot be separated from the work item.
   - `BLOCKED` if evidence contains `Gate: BLOCKED` or the work cannot be safely finalized.
   - For branch-ref remediation or merge-ready branch work, require evidence for the published review target when the ticket mentions publishing, a remote branch, a PR/review branch, or merge readiness. Local-only branch pointer changes with `Pushed: no`, missing `origin/<branch>` checks, or validation that only inspects a local branch are `REVISE` unless the work item explicitly says local refs are sufficient.
6. **On strict PASS only**: commit the related code changes before closing the tracker item.
   - Run `git status --short` and `git diff --stat` to see what changed.
   - Classify every changed/untracked file as `related`, `unrelated`, or `ambiguous` before staging.
   - Stage only `related` files belonging to this work item (no unrelated or ambiguous changes).
   - If any tracked or untracked file is `ambiguous`, output `REVISE` instead of committing or closing.
   - Commit with a Conventional Commits message: `<type>(<scope>): <summary>` — summary ≤ 72 chars, imperative mood, no trailing period.
   - Derive `type` from the work (feat, fix, refactor, test, chore, docs, perf). Omit scope if unclear.
   - If nothing changed in code, skip the commit only when `git status --short` is clean or every dirty path is clearly unrelated to the work item and no related code changes are expected; otherwise output `REVISE`.
   - Do **not** push. Do **not** add sign-offs.
   - Do **not** modify files before staging. If files need changes, output `REVISE` instead of making them.
7. Write one concise final tracker note:
   - `tk add-note <ticket> "..."` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br comments add --actor "$ACTOR" <ticket> --message "..." --json` for `br`
8. Close the ticket only on strict `PASS` after the commit step succeeds or is skipped because there are no code changes:
   - `tk close <ticket>` for `tk`
   - `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br close --actor "$ACTOR" <ticket> --reason "..." --json` for `br`
9. If the ticket is managed by neither `tk` nor `br`, do not invent a close command. Report the exact manual follow-up instead.
10. **On REVISE or BLOCKED**: do **not** commit. Leave changes in the working tree.
11. Never create new follow-up tickets/issues in finalization. Follow-up creation belongs to `/ef-review-with-followups`; if required follow-ups are missing or failed, report `REVISE`.

## Evidence and dirty-tree policy

Before any `PASS`, write down an internal checklist from real artifacts:

- selected ticket id and current tracker status
- validation source, exact `Gate: PASS`, and acceptance-criteria evidence
- latest review verdict when review is part of the chain
- review handoff, when present: `Original item may close: yes`
- dirty-tree classification: related, unrelated, and ambiguous paths
- commit result or explicit no-code-change reason

If the latest review output contains a `# Finalization Handoff` section, treat `Original item may close: yes` as the preferred closure signal. If that section says `no`, is internally inconsistent, or reports failed follow-up/comment creation, return `REVISE`. If the section is missing in an older context, fall back to the review verdict and follow-up evidence below, but be explicit that the handoff was missing.

Dirty-tree rules are strict:

- A dirty tree is not automatically a blocker, but every dirty path must be classified before staging.
- Related paths are files whose changes directly implement, validate, or document the selected work item.
- Unrelated paths are files clearly tied to other work and must not be staged.
- Known autoship workflow-state paths (`.pi/execflow-autoship-loop-marker.json`, `.execflow/autoship-progress.json`, and `.execflow/lessons-learned.md`) are unrelated workflow state by default; never stage them for a work-item commit and do not treat them as ambiguous solely because they are dirty.
- Ambiguous paths are any files whose relationship cannot be proven from the work item, spec, implementation summary, validation evidence, or review evidence.
- On `PASS`, stage and commit only related paths. If there are related changes plus ambiguous changes, do not commit or close; return `REVISE`.
- If there are no related code changes, skip the commit only when this is expected (for example tracker-only work or all related changes were already committed) and the remaining dirty paths are clearly unrelated.
- Never close a work item after a failed commit, a skipped commit with unexplained related changes, or an ambiguous dirty tree.

## Closure evidence policy

There are two supported validation sources:

- TDD path evidence from `/validation-fix`: requires `Gate: PASS` plus acceptance-criteria evidence. When RED/GREEN proof or an explicit RED exemption is required by the ticket/spec, it must be present.
- Quick path evidence from `/ef-work`: requires `Gate: PASS`, acceptance-criteria evidence, quick validation or explicit inspection evidence, the standard quick-path RED exemption, and a clean self-review.

Review evidence is optional only when finalizing after `/ef-work` or `/ef-work-tdd` directly. For `/ef-ship` and `/ef-ship-tdd`, review evidence is part of the chain and must support closure. Review supports closure when either:

- the latest review verdict is merge-ready / pass with no unresolved material issues; or
- the latest review ran with follow-up creation enabled, every material finding became a created follow-up or was explicitly skipped as a duplicate of an existing follow-up, and a note/comment was added to the original work item.

Do not close if the latest review is `failed` or `blocked`, required review evidence is missing, follow-up creation/commenting failed, or any material finding remains uncaptured. Do not attempt to resolve those findings here; leave the item open with a concise `REVISE` note.

## Rules

- Be conservative: do not close unless the latest evidence supports closure.
- Do not edit repository files, run auto-fix commands, or repair review findings. Finalization may inspect files and commit already-existing related changes, but must not create new code/content changes.
- Do not claim tests passed unless they actually passed or were explicitly evidenced.
- Do not claim review was clean unless the final review verdict is merge-ready / pass with no unresolved material issues. If review found issues that were converted into follow-ups, say that explicitly instead of calling the review clean.
- Prefer `Gate: PASS`, `Gate: REVISE`, and `Gate: BLOCKED` note prefixes.
- Keep the note short, factual, and specific.
- For `br`, use `br comments add` as the note/comment equivalent; there is no `br notes` subcommand in the installed CLI.
- For `br`, always include `--actor "$ACTOR"` and prefer `--json`.

## Note policy

Use this style for tracker comments / notes:

- PASS without review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review not run.`
- PASS with clean review: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review clean.`
- PASS with review follow-ups: `Gate: PASS — <short summary>. Validation passed; acceptance criteria met. Review findings delegated to follow-ups: <ids>.`
- REVISE: `Gate: REVISE — <short summary>. Validation/review still needs follow-up: <brief reason>.`
- BLOCKED: `Gate: BLOCKED — <short summary>. Cannot finalize safely: <brief reason>.`

For `tk`, write that text with `tk add-note`.
For `br`, write that text with `br comments add --message ...` and use a concise closure reason for `br close` on PASS.

Include only concrete facts that are supported by evidence.

## Output format

Use exactly these sections:

# Finalization Decision

- Ticket:
- Ticket system: tk / br / other
- Outcome: PASS / REVISE / BLOCKED
- Why:

# Tracker Actions

- Note added:
- Ticket closed: yes / no
- Manual follow-up, if any:

# Git Commit

- Repository files modified during finalization: no
- Dirty tree classification: related / unrelated / ambiguous paths, or "clean"
- Changes staged: (list files or "none")
- Commit message:
- Committed: yes / no / skipped (no changes)
- Pushed: no

# Evidence Summary

- Validation source: /ef-work / /validation-fix / explicit user evidence / missing
- Validation status:
- Review status:
- Finalization handoff: original item may close yes / no / missing / n/a
- Remaining follow-up:
