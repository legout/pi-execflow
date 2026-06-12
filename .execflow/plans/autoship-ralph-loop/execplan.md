# Add sequential autoship commands for ready br issues

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan follows `.execflow/PLANS.md` from the repository root. Any future revision must remain self-contained and must keep this document aligned with that file.

## Purpose / Big Picture

After this change, a user working in a repository initialized with pi-execflow can run one command that keeps shipping ready `br` issues sequentially until there is no eligible ready work left. The new commands do not invent a second implementation workflow. They select the next issue from `br ready --json`, then dispatch the existing `/ef-ship <issue>` or `/ef-ship-tdd <issue>` workflow through `pi-prompt-template-model`'s `run-prompt` tool. This matters because `/ef-ship` and `/ef-ship-tdd` already encode pi-execflow's conservative implementation, review, finalization, commit, and close policy; autoship should coordinate those workflows, not duplicate them.

The user-visible result is two new public commands:

    /ef-autoship [--max-retries N] [context...]
    /ef-autoship-tdd [--max-retries N] [context...]

The quick command dispatches `ef-ship <ready-issue-id>`. The TDD command dispatches `ef-ship-tdd <ready-issue-id>`. Both commands default to `--max-retries 2`, meaning one initial attempt plus two retries, for three total attempts per issue in one autoship run. Both commands require the user to enable the external `run-prompt` tool first with:

    /prompt-tool on

The simplest boundary is a deterministic state helper plus one autoship skill. The helper owns queue selection, retry counting, and progress state. The skill owns the agent-facing orchestration policy and lessons-learned rules. The prompts stay shallow: they choose mode, model, loop behavior, and inject the skill. This concentrates the hard sequencing in one small module instead of spreading queue and retry policy across two prompt bodies.

## Progress

- [x] (2026-06-12) Read `.execflow/PLANS.md` in full and used it as the authoring contract.
- [x] (2026-06-12) Read the approved brainstorm at `.execflow/plans/autoship-ralph-loop/brainstorm.md`.
- [x] (2026-06-12) Checked for `ARCHITECTURE.md`; it is not present in this repository.
- [x] (2026-06-12) Inspected relevant prompt, skill, script, README, settings, and validation flows.
- [x] (2026-06-12) Authored this initial ExecPlan.
- [x] (2026-06-12) Implemented the deterministic autoship state helper and validation coverage for retry selection and invalid retry handling.
- [ ] Add the shared autoship skill that defines orchestration, retry, progress, and lessons policy.
- [ ] Add `/ef-autoship` as the quick sequential autoship command.
- [ ] Add `/ef-autoship-tdd` as the TDD sequential autoship command.
- [ ] Update settings, README, package validation, and any resource-sync expectations.
- [ ] Validate the package and manually smoke-test autoship dispatch in a `br`-initialized fixture or target repository.

## Surprises & Discoveries

- Observation: Static `chain:` prompt templates cannot directly express this feature because the next issue id is dynamic and chain nesting is unsupported.
  Evidence: Existing `/ef-ship` and `/ef-ship-tdd` are chain prompts in `prompts/ef-ship.md` and `prompts/ef-ship-tdd.md`; `pi-prompt-template-model` documentation says chain steps cannot reference another chain template.

- Observation: The right way to literally dispatch existing slash-command behavior from an agent turn is the `run-prompt` tool, but it is disabled by default.
  Evidence: `pi-prompt-template-model` exposes `/prompt-tool on`; its `tool-manager.ts` returns `run-prompt tool is disabled. User must run /prompt-tool on to enable.` when disabled.

- Observation: This package currently has no native runtime extension entrypoint, only prompts, skills, scripts, and template files.
  Evidence: `package.json` lists `pi.prompts` and `pi.skills`, and no `pi.extensions` key.

- Observation: The repository has no `ARCHITECTURE.md` file.
  Evidence: `test -f ARCHITECTURE.md` produced no path.

## Decision Log

- Decision: The MVP is sequential only.
  Rationale: Parallel issue execution needs conflict analysis, worktree isolation, merge sequencing, and supervision policy. The first useful improvement is to reliably drain one ready issue at a time without repeating failed attempts forever.
  Date/Author: 2026-06-12 / planning agent and user

- Decision: Autoship will literally dispatch existing `ef-ship` and `ef-ship-tdd` prompt commands through `run-prompt`.
  Rationale: Reusing the existing ship commands preserves the current finalization, review, commit, and tracker-close policy. Inlining those steps inside autoship would create a second policy surface and increase change amplification.
  Date/Author: 2026-06-12 / planning agent and user

- Decision: `--max-retries 2` means two retries after the initial attempt, or three total attempts per issue in one autoship run.
  Rationale: This matches common retry terminology and the user's explicit clarification.
  Date/Author: 2026-06-12 / user

- Decision: Use a deterministic state helper rather than making prompt text parse and mutate progress state directly.
  Rationale: Queue selection, retry accounting, and progress persistence are error-prone sequencing details. Putting them behind one script creates a deeper module and lets the prompt remain a policy wrapper.
  Date/Author: 2026-06-12 / planning agent

- Decision: Use `.execflow/autoship-progress.json` for machine-readable progress state and `.execflow/lessons-learned.md` for human-readable reusable lessons.
  Rationale: Retry state must be parsed deterministically across fresh prompt-loop iterations. JSON is safer than asking an LLM to parse a markdown log. Lessons are prose and should remain markdown.
  Date/Author: 2026-06-12 / planning agent

## Outcomes & Retrospective

Milestone 1 is implemented. `scripts/autoship-state.mjs` now supports `next --mode ship|ship-tdd --max-retries N`, defaults retries to 2, computes `maxAttempts` as retries plus one, rejects invalid retry values, preserves `br ready --limit 0 --json` order, skips exhausted ready issues, writes `.execflow/autoship-progress.json`, and initializes `.execflow/lessons-learned.md` when missing.

Validation coverage is wired through `scripts/validate-package.mjs`, which now requires the helper to exist and runs `node scripts/autoship-state.mjs --self-test`. The self-test uses fixture ready JSON rather than a live `.beads/` workspace and covers default retry semantics, `--max-retries 0`, exhausted issue skipping, first-eligible ordering, empty ready queues, `ship-tdd` command generation, and invalid negative, non-integer, and oversized retry values.

RED/GREEN evidence for Milestone 1: an intentional RED check with `scripts/autoship-state.mjs` temporarily absent produced `pi-execflow validation failed` with `Missing scripts/autoship-state.mjs`; after restoring the helper, `node scripts/autoship-state.mjs --self-test` passed and `npm run validate-package` passed with `pi-execflow validation passed (18 prompt files checked).` A temporary `br` workspace smoke test selected the first ready issue and wrote `.execflow/autoship-progress.json`. Live `run-prompt` dispatch remains intentionally outside Milestone 1 and belongs to the later autoship prompt/skill milestones.

## Context and Orientation

This repository is `@legout/pi-execflow`, a GitHub-installed Pi package. It ships prompt templates under `prompts/`, skills under `skills/`, package scripts under `scripts/`, and project initialization templates under `execflow/`. Target repositories run `/init-execflow`, which copies prompt overlays into `.pi/prompts/` and template files into `.execflow/`. The package is validated with:

    npm run validate-package

The current public workflow is documented in `README.md`. The relevant existing prompt templates are:

- `prompts/ef-ship.md`: a chain wrapper whose frontmatter is `chain: ef-work -> ef-review-with-followups -> finalize`. It is the quick ship path for one issue.
- `prompts/ef-ship-tdd.md`: a chain wrapper whose frontmatter is `chain: resolve -> spec -> implement -> validation-fix -> ef-review-with-followups -> finalize`. It is the TDD-oriented ship path for one issue.
- `prompts/ef-work.md`: the quick single-work-item implementation prompt using `skill: execution`.
- `prompts/validation-fix.md`: the validation/fix loop prompt. It already uses `loop: 5`, `converge: true`, and `fresh: true` for one issue.
- `prompts/finalize.md`: the conservative finalization prompt. It inspects the tracker, commits only on strict PASS, adds a tracker note, and closes the issue only when evidence supports closure.
- `prompts/ef-sync.md`: a deterministic maintenance prompt that refreshes prompt overlays and syncs model frontmatter.

The relevant existing scripts are:

- `scripts/init-execflow.mjs`: copies missing package prompt and execflow templates into a target project and removes retired prompt overlays.
- `scripts/refresh-prompts.mjs`: overwrites target `.pi/prompts/*.md` from the package prompt source and runs model sync.
- `scripts/sync-models.mjs`: rewrites `model:` and `thinking:` frontmatter for prompts configured in `.execflow/settings.yml` or `execflow/settings.yml`. Prompts with model/thinking frontmatter must be listed in the settings file.
- `scripts/validate-package.mjs`: validates prompt frontmatter, settings consistency, skill references, tracker defaults, and README/package constraints.

The relevant existing settings file is `execflow/settings.yml`. It defines model and thinking anchors and a `prompts:` mapping for model-owning prompt files. Chain wrappers are intentionally omitted because they do not own model selection. The new autoship prompts are not chain wrappers; they are model-owning orchestration prompts, so they must be added to `execflow/settings.yml` under `prompts:`.

The `br` tracker is the default tracker in this repository. A ready issue is an issue returned by:

    ACTOR="${BR_ACTOR:-assistant}" RUST_LOG=error br ready --limit 0 --json --actor "$ACTOR"

The command lists open, unblocked, not-deferred issues. The default `br ready` sort policy is hybrid: P0/P1 first by creation time, then other priorities by creation time. The autoship MVP should preserve that tracker order rather than adding a separate priority system.

The external `pi-prompt-template-model` extension matters because it owns prompt loops and the `run-prompt` tool. Prompt loops can use `loop: unlimited`, `fresh: true`, and `converge: true` so that every loop iteration starts from a fresh summarized context. The `run-prompt` tool can queue a prompt command such as `ef-ship issue-id` after the current agent turn. The user must enable it with `/prompt-tool on`; autoship must fail closed with that setup instruction if the tool is unavailable.

## Domain Language

Autoship means a sequential autonomous loop that selects a ready `br` issue and dispatches an existing pi-execflow ship command for it.

A ship command is either `ef-ship <issue>` or `ef-ship-tdd <issue>`. These are prompt-template command names passed to `run-prompt` without a leading slash. The user-facing slash commands are `/ef-ship` and `/ef-ship-tdd`.

A ready issue is an issue returned by `br ready --json`. In `br`, ready means open, unblocked, and not deferred.

An eligible issue is a ready issue that has not exhausted the current autoship run's retry budget.

An attempt is one dispatch of `ef-ship <issue>` or `ef-ship-tdd <issue>`.

A retry is an additional attempt after the initial attempt. With `--max-retries 2`, the maximum number of attempts for one issue in one autoship run is three.

The autoship state helper is the new deterministic script that reads `br ready`, reads and writes `.execflow/autoship-progress.json`, selects the next eligible issue, and prints the prompt command that should be dispatched.

The progress file is `.execflow/autoship-progress.json`. It is machine-readable state, not a human-authored plan. It records the active or most recent autoship run, mode, max retry budget, issue attempt counts, last selected issue, and stop reason.

The lessons learned file is `.execflow/lessons-learned.md`. It is a human-readable markdown file for durable, non-obvious lessons discovered during autoship runs. It is not a raw transcript and should not receive noisy entries after every attempt.

Fresh context means every autoship loop iteration should start from a summarized context rather than raw conversation history. This prevents one issue's implementation details from leaking into the next issue's implementation context. Durable state that must survive across issues belongs in `.execflow/autoship-progress.json` and `.execflow/lessons-learned.md`.

## Scope and Non-Goals

This plan adds sequential autoship for the `br` tracker only. It does not add `tk` queue draining. It does not add parallel execution. It does not require `pi-boomerang` or `pi-intercom`. It does not add a native Pi extension entrypoint. It does not change the behavior of `/ef-ship`, `/ef-ship-tdd`, `/ef-work`, `/validation-fix`, or `/finalize` except to document how autoship dispatches them.

This plan will add two public prompt templates, one shared skill, and one deterministic helper script. It will update settings, README documentation, and package validation. Runtime progress and lessons files will be created by autoship in target repositories when needed; they do not need to be copied by `/init-execflow` as canonical templates.

This plan intentionally avoids adding a `--limit` flag in the MVP. A maximum-issues-per-run flag may be useful later, but it is not necessary to satisfy the approved brainstorm. The only new runtime flag required by this plan is `--max-retries N`.

This plan intentionally preserves `br ready` ordering. Autoship should select the first eligible issue in the JSON output after filtering exhausted issues. It should not invent a separate priority or aging policy.

## User Stories / Observable Scenarios

A user initializes a project with pi-execflow and `br`, enables prompt dispatch, and runs:

    /prompt-tool on
    /ef-autoship

Autoship reads `br ready --json`, selects the first eligible issue, records an attempt in `.execflow/autoship-progress.json`, and calls `run-prompt` with a command like:

    ef-ship my-project-123

When that shipped issue closes, the next autoship loop iteration refreshes `br ready --json`. If more issues are ready, it dispatches the next one. If no ready issues remain, it stops and reports that the queue is drained.

A user who wants TDD/spec discipline runs:

    /prompt-tool on
    /ef-autoship-tdd

This follows the same queue and retry behavior, but dispatches:

    ef-ship-tdd my-project-123

If a ready issue remains ready after a ship attempt, autoship retries it. With the default retry budget, it may attempt the same issue three total times in one run. After the third attempt, if the issue is still ready, autoship marks it exhausted for that run and moves on to the next ready issue. This prevents infinite loops on a validation failure, review failure, blocked finalization, or repeated model mistake.

If the user runs:

    /ef-autoship --max-retries 0

then each selected issue gets exactly one attempt in that autoship run. If an issue remains ready after that attempt, autoship marks it exhausted for the run and moves on.

If `run-prompt` is disabled or unavailable, autoship must not attempt to inline the ship workflow. It must stop with a setup message telling the user to run `/prompt-tool on` and then retry autoship.

If an attempt reveals a durable lesson such as a repeated validation command issue, a project-specific tracker gotcha, or a non-obvious rule that should prevent future failed attempts, autoship appends a concise entry to `.execflow/lessons-learned.md`. It must not append generic summaries like “issue shipped” or noisy per-attempt transcripts.

## Complexity Dividend

Today, a user must manually coordinate the queue: run `br ready`, choose an issue, run `/ef-ship` or `/ef-ship-tdd`, inspect whether it closed, remember failed attempts, avoid repeating the same issue forever, and decide when to stop. The user pays this sequencing cost every time they want to drain multiple ready issues.

After this work, the user-facing interface becomes one command per ship mode. Queue selection, retry accounting, progress state, and stop conditions move into the autoship state helper and skill. The existing ship commands remain the deep implementation boundary for one issue. The new autoship boundary hides the outer loop without spreading issue-selection policy into `/ef-ship` itself.

The special cases that disappear from the user's mental model are: remembering how many times a still-ready issue has been attempted, manually skipping exhausted issues, and manually refreshing ready work after each ship attempt. Future changes become easier because retry policy and progress state live in one helper script, while per-issue shipping policy remains in the existing ship prompts.

## Task Graph

Milestone 1 is an enabler and true prerequisite for the public autoship commands. It adds the deterministic state helper and validation coverage for retry selection. It touches `scripts/autoship-state.mjs`, `scripts/validate-package.mjs`, and possibly small helper code inside the validation script. Because it creates the boundary used by both public commands, it should be implemented before Milestones 2 and 3.

Milestone 2 is the first vertical slice: quick autoship through `/ef-autoship`. It depends on Milestone 1. It adds the shared `autoship` skill if that was not already added in Milestone 1, adds `prompts/ef-autoship.md`, adds the prompt to `execflow/settings.yml`, and updates package validation enough to recognize the new public command. It is related to Milestone 3 but not conceptually blocked by TDD autoship.

Milestone 3 is the second vertical slice: TDD autoship through `/ef-autoship-tdd`. It depends on Milestone 1 and reuses the same skill and helper. It edits the same shared files as Milestone 2: `execflow/settings.yml`, `README.md`, and `scripts/validate-package.mjs`. For that reason, Milestones 2 and 3 should be merged sequentially even though their behavior slices are related and mostly independent.

Milestone 4 is a final integration and documentation pass. It validates package consistency, updates README usage and setup instructions, and performs a manual smoke test in a `br`-initialized target repository or fixture. It depends on Milestones 2 and 3.

Parallel execution is unsafe for the MVP because all implementation slices touch shared package registries and documentation: `execflow/settings.yml`, `README.md`, `scripts/validate-package.mjs`, and the public prompt namespace under `prompts/`. Future parallel autoship is out of scope and must be designed separately around worktree isolation and the scheduling hints already produced by work-itemization.

## TDD Strategy

The state helper is testable without a live Pi session. Start Milestone 1 by adding failing validation coverage for `scripts/autoship-state.mjs` behavior. Because this repository uses deterministic validation rather than a test framework, the expected RED proof should be one of these forms: add a self-test mode to the new script and wire it into `scripts/validate-package.mjs`, or add validation helper cases directly to `validate-package.mjs`. Before the helper is implemented, `npm run validate-package` should fail because the autoship helper or its required behavior is missing. After implementation, it should pass.

The required state-helper behaviors to prove are: default `maxRetries` is 2; `--max-retries 0` allows exactly one total attempt; an issue with attempts equal to `maxRetries + 1` is skipped as exhausted; the first non-exhausted ready issue is selected in `br ready` order; and invalid negative or non-integer retry values fail with an actionable error.

Prompt dispatch through `run-prompt` cannot be fully proven by package validation because it depends on a live Pi session and an optional external tool. The prompt files can still be validated statically: they must reference `skill: autoship`, must have model/thinking settings entries, must document the fail-closed behavior when `run-prompt` is unavailable, and must dispatch `ef-ship` or `ef-ship-tdd` rather than reimplementing those workflows. The live dispatch behavior needs a manual smoke test after package validation.

Docs-only README updates are exempt from RED proof, but they must be covered by `npm run validate-package` and manual inspection.

## Plan of Work

Milestone 1: add the autoship state boundary. Create `scripts/autoship-state.mjs`. This script is the only code that should parse autoship retry arguments, inspect ready issues, choose the next eligible issue, and mutate progress state. It should be an ESM Node script matching the repository style: `import ... from "node:*"`, double quotes, semicolons, and actionable stderr errors followed by `process.exit(1)` for invalid input.

The script should support a primary command shaped like:

    node scripts/autoship-state.mjs next --mode ship --max-retries 2
    node scripts/autoship-state.mjs next --mode ship-tdd --max-retries 2

For package validation and self-tests, it may also support an internal fixture option such as `--ready-json-file <path>` or a `--self-test` mode. If an internal test option is added, document in a comment that it exists for deterministic package validation and is not part of the public workflow.

The script should run from the target repository root. It should ensure `.execflow/` exists before writing state. It should create `.execflow/lessons-learned.md` if missing, with a heading and a short rule that entries must be durable and non-obvious. It should create or update `.execflow/autoship-progress.json` with a schema like:

    {
      "version": 1,
      "activeRun": {
        "id": "autoship-2026-06-12T12-34-56Z",
        "mode": "ship",
        "startedAt": "2026-06-12T12:34:56.000Z",
        "maxRetries": 2,
        "maxAttempts": 3,
        "status": "running",
        "attemptsByIssue": {
          "repo-123": {
            "attempts": 1,
            "lastCommand": "ef-ship repo-123",
            "lastSelectedAt": "2026-06-12T12:35:00.000Z",
            "lastSeenReady": true
          }
        },
        "lastIssueId": "repo-123",
        "lastCommand": "ef-ship repo-123",
        "stopReason": null
      },
      "completedRuns": []
    }

The exact timestamp values will differ. Keep the schema small. The implementation should not store raw prompt transcripts or long model outputs in this JSON file.

On `next`, the script should call `br ready --limit 0 --json` with `ACTOR` defaulting to `${BR_ACTOR:-assistant}` and `RUST_LOG=error` in the environment. It should parse the ready issue JSON conservatively. During implementation, run `br ready --help` and, in a `br` workspace, inspect a real `br ready --json` sample to confirm the issue id field. The selected id must be the stable issue identifier accepted by `br show <id>` and by existing `/ef-ship <id>` commands. If the JSON shape is unexpected, fail with an error that includes the top-level JSON type and the fields seen on the first item.

The script should reconcile the previous selected issue each time it runs. If `activeRun.lastIssueId` is no longer present in the refreshed ready set, mark that issue's `lastSeenReady` false. If it is still ready, keep it true and let the retry budget decide whether another attempt is allowed.

The script should select the first ready issue whose attempt count is less than `maxRetries + 1`. When it selects one, it should increment that issue's attempt count, write state to `.execflow/autoship-progress.json`, and print a compact JSON object to stdout:

    {
      "status": "dispatch",
      "runId": "autoship-...",
      "mode": "ship",
      "issueId": "repo-123",
      "attempt": 1,
      "maxAttempts": 3,
      "command": "ef-ship repo-123",
      "progressPath": ".execflow/autoship-progress.json",
      "lessonsPath": ".execflow/lessons-learned.md"
    }

For TDD mode, `command` must be `ef-ship-tdd <id>`.

If there are no ready issues, the script should mark the active run stopped with `stopReason: "no-ready-issues"` and print:

    { "status": "stop", "reason": "no-ready-issues" }

If there are ready issues but all are exhausted for the current run, it should mark the run stopped with `stopReason: "all-ready-issues-exhausted"` and print the exhausted ids:

    { "status": "stop", "reason": "all-ready-issues-exhausted", "exhaustedIssueIds": ["repo-123"] }

If `--max-retries` is omitted, the script must use 2. If `--max-retries` is negative, non-integer, or greater than a conservative cap such as 20, fail with an actionable error. The cap prevents accidental unbounded loops caused by mistyped flags.

Add validation coverage to `scripts/validate-package.mjs`. At minimum, validation should fail if `scripts/autoship-state.mjs` is missing after this plan is implemented, and should exercise the state-helper retry selection with fixture ready data. Keep this deterministic and independent of a real `.beads/` workspace.

Milestone 2: add the shared autoship skill and quick autoship command. Create `skills/work/autoship/SKILL.md` with frontmatter name `autoship`. The skill should be the agent-facing deep module for autoship orchestration. It should tell the agent to parse `--max-retries N`, default to 2, fail closed if the `run-prompt` tool is unavailable, locate the installed package script using the same root search pattern used by `prompts/ef-sync.md`, run `scripts/autoship-state.mjs next --mode ship --max-retries <N>`, inspect the helper JSON, and call the `run-prompt` tool with the returned `command` only when `status` is `dispatch`.

The skill must explicitly forbid inline implementation, validation, review, tracker closing, or committing from the autoship orchestrator. Those actions belong to the dispatched `ef-ship` or `ef-ship-tdd` command. The skill should also define the lessons policy: read `.execflow/lessons-learned.md` at the start of each iteration if it exists; append only reusable, non-obvious lessons learned from prior ship output; do not append routine status, transcripts, or duplicated lessons.

Create `prompts/ef-autoship.md`. Its frontmatter should be model-owning, not a chain. Use the orchestration model and thinking level from settings. The checked-in prompt should look like the local style used by other prompts:

    ---
    description: Sequentially ship br ready issues with /ef-ship until no eligible work remains
    argument-hint: "[--max-retries N] [context...]"
    model: zai/glm-5-turbo
    thinking: medium
    loop: unlimited
    fresh: true
    converge: true
    skill: autoship
    restore: true
    ---

The body should state that this command runs quick autoship mode and must pass `--mode ship` to the state helper. It should say that the only dispatch command allowed is the exact command returned by the helper, which should begin with `ef-ship `. It should include an output format for the orchestrator's own response: selected issue, attempt number, command queued, progress path, lessons path, or stop reason. It should not include the full `/ef-ship` implementation policy.

Add `ef-autoship` to `execflow/settings.yml` under `prompts:` using `*orchestration_model` and `*orchestration_thinking`. Run `npm run setup-models` after editing settings so prompt frontmatter stays synchronized.

Milestone 3: add TDD autoship using the same boundary. Create `prompts/ef-autoship-tdd.md` with the same loop/fresh/converge/skill/restore shape as the quick prompt. Its description should name `/ef-ship-tdd`. Its body should state that this command runs TDD autoship mode and must pass `--mode ship-tdd` to the state helper. It should only dispatch commands beginning with `ef-ship-tdd `.

Add `ef-autoship-tdd` to `execflow/settings.yml` using the orchestration model and thinking anchors. Extend `scripts/validate-package.mjs` so both autoship prompts are included in any public prompt checks added by the implementation, reference the `autoship` skill, have model/thinking settings entries, and do not use `chain:`. This is important because these prompts own orchestration model selection and are allowed to use `loop: unlimited`; treating them as chain wrappers would reintroduce the original dynamic-dispatch problem.

Milestone 4: update documentation and validate end to end. Update `README.md` so the core workflow list includes `/ef-autoship` and `/ef-autoship-tdd`. In the execution section, add a short autoship subsection explaining setup, defaults, and safety behavior. The docs must say that autoship requires:

    /prompt-tool on

Then show:

    /ef-autoship
    /ef-autoship --max-retries 0
    /ef-autoship-tdd --max-retries 2

Document that `--max-retries 2` means three total attempts for one issue in the same autoship run. Document that autoship uses `br ready --json` and preserves `br` ready ordering. Document that parallel autoship is intentionally not part of the MVP.

Update README's prompt taxonomy and settings examples so the two autoship prompts are listed as public model-owning orchestration prompts, not chain wrappers. The docs should keep existing GitHub-install wording and must not introduce npm publishing or install instructions.

Run validation from the repository root:

    npm run validate-package

Expect output ending with a pass line similar to:

    pi-execflow validation passed (20 prompt files checked).

The exact prompt count should increase from 18 to 20 after adding the two prompt files.

Finally, perform a manual smoke test in a real or temporary target repository initialized with `br` if practical. The minimum smoke test is not to ship production work blindly; create or use a harmless ready issue whose acceptance criteria are trivial, enable `/prompt-tool on`, run one autoship command, and observe that autoship calls `run-prompt` with the expected command and updates `.execflow/autoship-progress.json`. If a live Pi smoke test is not available in the implementation environment, record that gap in this plan's `Outcomes & Retrospective` and provide exact manual steps for the user.

## Concrete Steps

Start in the repository root:

    cd /home/volker/coding/pi-execflow

Before editing, confirm the current validation baseline:

    npm run validate-package

Expected current output before this plan is implemented:

    pi-execflow validation passed (18 prompt files checked).

Implement Milestone 1. Add the state helper and validation coverage. Run the package validation after adding the RED check and before completing the helper if practical; it should fail because the helper behavior is missing. Then complete the helper and run:

    npm run validate-package

Expected result after Milestone 1 is complete is a pass, still with 18 prompt files unless prompt files have already been added.

Implement Milestone 2. Add `skills/work/autoship/SKILL.md`, `prompts/ef-autoship.md`, and the `ef-autoship` settings entry. Run:

    npm run setup-models
    npm run validate-package

Expected result after only the quick prompt is added is a pass with 19 prompt files checked.

Implement Milestone 3. Add `prompts/ef-autoship-tdd.md`, add the `ef-autoship-tdd` settings entry, and extend validation for both autoship prompts. Run:

    npm run setup-models
    npm run validate-package

Expected result is a pass with 20 prompt files checked.

Implement Milestone 4. Update `README.md` and run final validation:

    npm run validate-package

If the implementation environment permits a live Pi smoke test in a safe `br` repository, run:

    /prompt-tool on
    /ef-autoship --max-retries 0

Observe that the autoship prompt selects a ready issue, queues `ef-ship <id>` through `run-prompt`, and writes `.execflow/autoship-progress.json`. For TDD mode, run:

    /prompt-tool on
    /ef-autoship-tdd --max-retries 0

Observe that the queued command begins with `ef-ship-tdd `.

## Validation and Acceptance

Package validation is mandatory. The final implementation is not complete until this command passes from the repository root:

    npm run validate-package

The expected final pass line should mention 20 prompt files checked. If the exact wording changes because validation is enhanced, the output must still clearly state that pi-execflow validation passed.

The deterministic state helper must have validation coverage for retry semantics. Acceptance requires proof that default max retries is 2, that max attempts equals max retries plus one, that exhausted issues are skipped, that first eligible ready issue order is preserved, and that invalid retry inputs fail. This proof can live in `scripts/validate-package.mjs` or in a self-test mode invoked by that script.

Static prompt acceptance requires these file-level facts:

- `prompts/ef-autoship.md` exists, references `skill: autoship`, uses `loop: unlimited`, uses `fresh: true`, and does not use `chain:`.
- `prompts/ef-autoship-tdd.md` exists with the same structural properties.
- `execflow/settings.yml` contains `ef-autoship` and `ef-autoship-tdd` entries using orchestration model/thinking anchors.
- `skills/work/autoship/SKILL.md` exists and has frontmatter `name: autoship`.
- `README.md` documents `/prompt-tool on`, `/ef-autoship`, `/ef-autoship-tdd`, `--max-retries`, and the sequential-only MVP limitation.

Runtime acceptance requires a safe smoke test when possible. In a `br`-initialized target repository with one harmless ready issue, `/ef-autoship --max-retries 0` should queue exactly one `ef-ship <id>` command and create or update `.execflow/autoship-progress.json`. If the issue remains ready after the attempt, a subsequent autoship iteration should not exceed one attempt because max retries is zero. With default retries, the same issue should not exceed three attempts in one active run.

Because `run-prompt` is external and disabled by default, a smoke test should also verify fail-closed setup behavior. With `/prompt-tool off`, running autoship should not inline the ship workflow. It should instruct the user to enable `/prompt-tool on`.

## Idempotence and Recovery

All implementation edits are additive except README/settings/validation updates. Re-running `npm run setup-models` is safe; it deterministically rewrites model and thinking frontmatter according to `execflow/settings.yml` or target `.execflow/settings.yml`.

The autoship state helper must be safe to run repeatedly. If `.execflow/autoship-progress.json` does not exist, it creates it. If it exists and is valid, it updates only the active run state. If it exists but is invalid JSON, the helper must not overwrite it silently. It should fail with an error telling the user to inspect or move the file.

If a ship command fails, leaves an issue open, or leaves it ready, autoship should not erase that fact. The next state-helper invocation will see the issue still ready and either retry it or mark it exhausted when its attempt budget is spent. If autoship is interrupted midway, the progress JSON may contain a running active run. The implementation should prefer conservative continuation over destructive cleanup. If this becomes confusing in practice, a future plan can add an explicit reset command, but this MVP should not add one.

The lessons file is append-only under normal autoship use. If a bad lesson is written, the user can edit `.execflow/lessons-learned.md` manually. Autoship should avoid duplicate lessons by scanning existing lesson text before appending a new one.

Do not delete `.beads/`, `.tickets/`, worktrees, prompt overlays, or progress files as part of this implementation.

## Artifacts and Notes

The approved brainstorm is `.execflow/plans/autoship-ralph-loop/brainstorm.md`. It records the user's decisions that the MVP is sequential, supports both ship modes, uses loop/fresh mechanics, requires `run-prompt`, and defaults to two retries after the initial attempt.

The current package validation baseline before this feature is:

    pi-execflow validation passed (18 prompt files checked).

The relevant `br ready` command help shows that `br ready` supports `--limit 0`, `--json`, and a default hybrid sort. Autoship should use that instead of inventing a queue order.

The root package currently declares prompts and skills only:

    "pi": {
      "prompts": ["./prompts"],
      "skills": ["./skills"]
    }

Do not add a `pi.extensions` entry for this MVP.

## Interfaces and Dependencies

The new deterministic helper must be at `scripts/autoship-state.mjs`. It should be executable with Node 20 as an ESM script. Its public command interface for prompts is:

    node <package-root>/scripts/autoship-state.mjs next --mode ship --max-retries <N>
    node <package-root>/scripts/autoship-state.mjs next --mode ship-tdd --max-retries <N>

The helper stdout must be JSON. The autoship skill and prompts should treat non-JSON stdout as an error. The minimum output variants are:

    { "status": "dispatch", "command": "ef-ship <id>", "issueId": "<id>", "attempt": 1, "maxAttempts": 3 }
    { "status": "dispatch", "command": "ef-ship-tdd <id>", "issueId": "<id>", "attempt": 1, "maxAttempts": 3 }
    { "status": "stop", "reason": "no-ready-issues" }
    { "status": "stop", "reason": "all-ready-issues-exhausted", "exhaustedIssueIds": ["<id>"] }

The new skill must be at `skills/work/autoship/SKILL.md` with frontmatter:

    ---
    name: autoship
    description: Sequentially dispatch existing pi-execflow ship commands for br ready issues, with retry limits, progress state, and lessons learned.
    ---

The new public prompts must be:

    prompts/ef-autoship.md
    prompts/ef-autoship-tdd.md

Both prompts depend on `pi-prompt-template-model` for model/thinking/loop/fresh behavior and on the optional `run-prompt` tool. They should not depend on `pi-boomerang`, `pi-intercom`, or `pi-subagents` for the MVP.

The settings interface is `execflow/settings.yml`. Add:

    ef-autoship:
      model: *orchestration_model
      thinking: *orchestration_thinking
    ef-autoship-tdd:
      model: *orchestration_model
      thinking: *orchestration_thinking

The validation interface is `scripts/validate-package.mjs`. Extend it using the existing style: collect all errors in the `errors` array, print all failures together, and exit nonzero only after all checks have run.

## Milestones

Milestone 1 is an enabler: the autoship state helper. At the end of this milestone, a deterministic Node script can be run in fixture mode or self-test mode to prove queue selection and retry accounting without a live Pi session. This is a horizontal milestone, but it is justified because it hides the most error-prone sequencing policy behind one stable boundary. Without it, both autoship prompts would need to duplicate retry and progress parsing.

Milestone 2 is the first vertical slice: quick autoship. At the end of this milestone, `/ef-autoship` exists as a public prompt, uses the shared autoship skill, selects work through the helper, and dispatches `ef-ship <id>` through `run-prompt`. Package validation should pass, and a manual smoke test can prove that one ready issue is selected and queued.

Milestone 3 is the second vertical slice: TDD autoship. At the end of this milestone, `/ef-autoship-tdd` exists and uses the same helper and skill, but dispatches `ef-ship-tdd <id>`. This slice is independently observable because its queued command differs and exercises the TDD ship path. It should land after Milestone 2 because both slices edit shared settings, README, and validation files.

Milestone 4 is integration, documentation, and runtime proof. At the end of this milestone, README explains setup and safety behavior, validation passes, and a live or documented smoke test demonstrates the behavior. This milestone is related to every earlier milestone and should be last because it verifies the complete user story.

## Parallelization and Worktree Strategy

Do not implement this plan in parallel by default. The implementation touches shared prompt registries, shared settings, shared validation code, and shared README sections. Those are serialization points. If multiple agents work on this plan anyway, they must start from a clean baseline, use isolated worktrees managed by the harness or user, avoid concurrent edits to `execflow/settings.yml`, `README.md`, `scripts/validate-package.mjs`, and merge one completed slice at a time after validation.

Future autoship parallelism is explicitly out of scope. The current work-itemizer already records scheduling hints such as conflicts and parallel-safe notes, but no part of this MVP should launch multiple issue implementations concurrently.

## Revision Notes

- 2026-06-12: Initial ExecPlan created from approved brainstorm `autoship-ralph-loop`. The plan chooses a deterministic state helper plus shared autoship skill as the simplifying boundary, and records that prompt dispatch must reuse existing `ef-ship` and `ef-ship-tdd` commands through `run-prompt`.
