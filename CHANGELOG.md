# Changelog

## 1.7.3 - 2026-06-15

- Hardened `/ef-ship*` and `/ef-autoship*` implementation/validation guardrails so branch-ref work does not rewrite the active checkout or remove `.pi/prompts` overlays between loop iterations.

## 1.7.2 - 2026-06-15

- Fixed `/ef-ship*` and `/ef-autoship*` chain loops so they do not use prompt-template fresh branch navigation between ready-work iterations, preventing missing-template failures after `/ef-update` or other pre-loop commands.

## 1.7.1 - 2026-06-15

- Fixed `/ef-ship*` and `/ef-autoship*` ready-work draining so productive next-ready dispatch iterations write a local convergence marker, while no-ready stop iterations remain no-op and converge cleanly.
- Documented and validated the autoship convergence marker used to bridge prompt-template write/edit-based loop convergence with delegated subagent execution.

## 1.7.0 - 2026-06-15

- Added the `ef-finalizer` subagent for fresh-context evidence checks, dirty-tree classification, final notes, commits, and safe tracker closure.
- Wired `/finalize` to the `ef-finalizer` subagent so mixed delegated/direct ship chains end on finalization output instead of replaying stale review output after closure.
- Hardened finalization policy around explicit evidence, review handoff parsing, dirty-tree classification, and related-file-only commits before tracker closure.
- Added a machine-readable review `# Finalization Handoff` block so downstream finalization can distinguish clean closure, delegated follow-ups, and unresolved review findings.
- Added package validation for the `ef-finalizer` agent template.

## 1.6.0 - 2026-06-15

- Added pi-execflow-owned subagent templates (`ef-worker`, `ef-validation-fix`, `ef-reviewer`) shipped under `agents/` and scaffolded into `.pi/agents/` by `/ef-init` and refreshed by `/ef-update`.
- Wired `/ef-work` and `/implement` to run in the `ef-worker` subagent with fresh context for scoped implementation.
- Wired `/validation-fix` to run in the `ef-validation-fix` subagent with fresh context for independent validation and minimal repair.
- Wired `/ef-review` and `/ef-review-with-followups` to the `ef-reviewer` subagent, which can create tracker follow-ups when explicitly enabled while remaining read-only for source code.
- Kept `/ef-ship`, `/ef-ship-tdd`, `/ef-autoship`, and `/ef-autoship-tdd` as inline orchestration wrappers; subagent boundaries are on leaf steps only.
- Added package validation for shipped agent templates and prompt `subagent:` references.

## 1.5.1 - 2026-06-15

- Fixed `/finalize` so it never edits source files, runs auto-fix commands, or repairs review findings during finalization. Review follow-ups are now treated as closure evidence for the original item, not work to perform.
- Refined `execflow/settings.yml` model and thinking assignments for planning, review, validation, orchestration, and specification prompts.
- Aligned checked-in prompt frontmatter with `execflow/settings.yml` so `npm run validate-package` passes without drift.

## 1.5.0 - 2026-06-15

- Added `/ef-init` as the canonical project initialization command and retired the legacy `/init-execflow` prompt overlay.
- Added `/ef-update` as the canonical project update command, replacing `/ef-sync` with full prompt overlay refresh, retired overlay cleanup, marker-managed execflow instruction refresh, model frontmatter sync, and `br`/`bv` root `AGENTS.md` refresh for `br` projects.
- Removed legacy prompt aliases from the shipped prompt set and added them to retired overlay cleanup so existing projects drop stale `/init-execflow` and `/ef-sync` files during `/ef-update`.
- Fixed init argument propagation and deterministic tracker reporting so `/ef-init --tk` and `/ef-init --br` are visible to both the pre-step and the LLM handoff.

## 1.4.0 - 2026-06-15

- Added deterministic tracker-tool preflight to `/init-execflow` so `br` and `tk` modes fail before scaffolding when their required CLI is missing.
- Added `br`/`bv` agent-instruction guidance so native tool blocks are managed in the project-root `AGENTS.md` instead of being duplicated in `.execflow/AGENTS.md`.
- Documented `tk help` as the local task-management entrypoint for generated `.execflow/AGENTS.md` files.

## 1.3.1 - 2026-06-14

- Fixed package validation for autoship prompt guardrails so missing `chain` frontmatter reports validation errors instead of throwing a `TypeError`.
- Added explicit validation coverage for `/ef-autoship` versus `/ef-autoship-tdd` dispatch wiring so TDD autoship cannot accidentally route through the non-TDD ship path.

## 1.3.0 - 2026-06-14

- Changed `/ef-autoship` and `/ef-autoship-tdd` from nested `run-prompt` orchestration prompts into chain-loop wrappers that no longer require `/prompt-tool on`.
- Added `ship-resolve` and `ship-tdd-resolve` selector prompts so `/ef-ship`, `/ef-ship-tdd`, and autoship wrappers can select ready `br` issues or `tk` tickets directly.
- Added no-target and `--next` ready-work draining to `/ef-ship` and `/ef-ship-tdd`, with retry tracking through `.execflow/autoship-progress.json`.
- Added `tk ready` support to the autoship state helper while preserving configured tracker preference and ready order.
- Tightened review/finalize guidance so work-item review findings can be captured as follow-up work before conservative finalization closes the original item.

## 1.2.0 - 2026-06-11

- Changed `/ef-work` into a quick work-item path for simple tickets with lightweight validation and self-review.
- Added `/ef-work-tdd` to preserve the previous specification, implementation, validation/fix loop, and finalization chain.
- Changed `/ef-ship` to run quick work, review with follow-up creation enabled, and conservative finalization.
- Added `/ef-ship-tdd` for the TDD-oriented ship path with specification, validation/fix looping, review follow-ups, and finalization.
- Added `/ef-review-with-followups` as a focused work-item review wrapper that always creates tracker follow-ups for concrete findings.

## 1.1.0 - 2026-06-11

- Added `/ef-ship` to run the full work-item execution chain and then review the finalized item with follow-up creation enabled.
- Added `/ef-review-with-followups` as a focused work-item review wrapper that always creates tracker follow-ups for concrete findings.

## 1.0.0 - 2026-06-10

- Promoted the supported public workflow to five commands: `/ef-plan`, `/ef-tasks`, `/ef-work`, `/ef-review`, and `/ef-sync`.
- Added wrapper prompts for the five-command workflow and removed legacy compatibility-only prompt names.
- Kept ExecPlans as the single canonical planning artifact while adding guidance for domain language, non-goals, observable scenarios, task graphs, TDD strategy, and conservative parallel/worktree metadata.
- Strengthened work-item creation to prefer ExecPlan task graphs and carry dependency, scope, validation, RED/GREEN, and scheduling evidence into tracker items.
- Strengthened execution and finalization around RED proof, GREEN proof, regression validation, explicit RED exemptions, and strict `Gate: PASS` closure.
- Updated review behavior to report separate spec compliance, code quality, and validation evidence judgments before the overall verdict.
- Adapted generated `.execflow/AGENTS.md` behavior guidance from Andrej Karpathy's concise `CLAUDE.md` principles while keeping it target-project safe.
- Reduced the shipped prompt surface to 14 active prompt files and retired removed prompt overlays through `scripts/retired-prompts.mjs`.

## 0.6.0 - 2026-05-24

- Removed npm-install documentation and npm publish metadata; GitHub installation is now the supported shared install path.
- Updated `/init-execflow`, `/refresh-prompts`, and `/sync-models` package discovery to look in Pi GitHub install locations instead of npm/node_modules locations.
- Made `/ef-review`, `/execplan-review`, and `/change-review` read-only by default; tracker follow-up creation now requires `--create-followups`.
- Shortened `/ef-implement` to `resolve -> spec -> implement -> validation-fix -> finalize`; `/spec` now carries validation and likely implementation planning context.
- Removed `/implementation-plan` and `/validation-plan` plus their dedicated planning/testing skills from the active command set.
- Reduced `/validation-fix` to five iterations and added explicit `Gate: PASS | REVISE | BLOCKED` output for finalization.
- Tightened `/finalize` so ticket closure and commits require strict `Gate: PASS` evidence.
- Consolidated tracker splitting around `work-itemize` and removed duplicate `issueize` / `ticketize` skills.
- Removed unused work-rule skills after folding their essential scope and validation guidance into the remaining execution, specification, validation, and review skills.
- Consolidated review behavior into `review-suite`; `/ef-review`, `/execplan-review`, and `/change-review` are now thin wrappers around one shared review policy.
- Moved `/init-execflow` and `/refresh-prompts` deterministic logic into package scripts and centralized retired prompt cleanup in `scripts/retired-prompts.mjs`.
- Strengthened package validation to catch npm-install docs, npm package discovery paths, npm publish metadata, and prompt references to missing skills.

## 0.5.0

- Removed `/plan`, `/architect`, and `/plan-chain` in favor of explicit planning steps: `/brainstorm`, `/create-plan`, `/grill-plan`, and `/improve-plan`.
- Renamed `/plan-create` to `/create-plan` and `/plan-improve` to `/improve-plan`.
- Added `/grill-plan` for interactive ExecPlan pressure-testing inspired by grill-style planning sessions.
- Aligned `/brainstorm` more closely with Superpowers-style design gating: project-context exploration, one-question-at-a-time discipline, approach comparison, design approval, artifact self-review, and `/create-plan` handoff.
- Removed delegated execution prompts (`/ef-implement-delegated`, `/worker-implement`, `/worker-validation-fix`) while keeping `/validation-fix` as the bounded validation/fix loop in the standard `/ef-implement` path.
- Removed dedicated review follow-up prompts. `/ef-review`, `/execplan-review`, and `/change-review` now create follow-up work items directly for concrete material findings.
- Simplified `/init-execflow` and `/refresh-prompts` by removing the subagent runtime shim and adding removed command files to retired prompt cleanup.

## 0.4.1

- Added git commit to `/finalize` so PASS outcomes automatically stage and commit work-item changes with Conventional Commits messages.
- REVISE outcomes explicitly leave changes uncommitted in the working tree for the next iteration.
- Added "Git Commit" section to the finalize prompt output format for traceability.

## 0.4.0

- Renamed `/exec-delegated` to `/ef-implement-delegated` and updated workflow guidance accordingly.
- Simplified `/ef-review` into one focused work-item reviewer and removed the old multi-lens `review-*` prompts plus `review-verdict`.
- Expanded prompt-overlay cleanup so `/refresh-prompts` and `/init-execflow` remove the retired delegated/review prompt files.

## 0.3.9

- Removed legacy prompt aliases in favor of canonical `/ef-implement`, `/ef-review`, and `/ef-review-followups`.
- Added `/execplan-review` for whole-ExecPlan delivery audits and `/change-review` for broad branch/diff/path reviews.
- Added `/execplan-review-followups` and `/change-review-followups` as explicit post-review mutation steps.
- Added explicit `--create-followups` handling to review prompts so tracker mutation is opt-in.
- Tightened implementation/validation separation so `/implement` and `/worker-implement` defer all test/check execution to `/validation-fix` and `/worker-validation-fix`.

## 0.3.7

- Added `/exec-review` as the preferred conflict-free name for the work-item review chain; the legacy `/review` wrapper can be shadowed when other extensions also register `/review`.
- Added a subagent runtime shim during `/refresh-prompts` and `/init-execflow` so delegated chain steps can find globally installed `pi-subagents` even when the legacy `~/.pi/agent/extensions/subagent` path is missing.
- Expanded prompt-overlay cleanup so `/refresh-prompts` and `/init-execflow` also remove older legacy filenames such as `exec-delegate.md` and `exec-worker-implementation.md`, which prevents stale duplicate commands from lingering after prompt renames.

## 0.3.6

- Renamed prompt templates for clearer phase semantics: `impl-plan` → `implementation-plan`, `derive-tests` → `validation-plan`, `review-consolidate` → `review-verdict`, `exec-worker-implement` → `worker-implement`, and `exec-worker-validation-fix` → `worker-validation-fix`.
- Taught `/refresh-prompts` and `/init-execflow` to remove retired prompt overlay filenames from older installs so renamed commands do not leave stale duplicates behind.
- Removed redundant `model:` / `thinking:` frontmatter from chain wrapper prompts (`execflow`, `exec-delegated`, `plan-chain`, `review`) and dropped their `execflow/settings.yml` entries so wrapper prompts stay orchestration-only.
- Updated `sync-models.mjs` to strip stale `model:` / `thinking:` frontmatter from prompts intentionally omitted from `settings.prompts`, which keeps existing overlays compatible with wrapper-prompt omissions.
- Documented the full set of wrapper-only prompts intentionally omitted from `execflow/settings.yml` (`execflow`, `exec-delegated`, `plan`, `plan-chain`, `review`, `refresh-prompts`, `sync-models`) so contributors keep model ownership on leaf prompts.
- Added a compact prompt taxonomy to the README and generated AGENTS guidance so contributors can quickly distinguish wrapper prompts, local leaves, delegated leaves, and deterministic utilities.
- Removed the unused `/exec-worker` chain wrapper prompt; `/exec-delegated` already delegates directly to `worker-implement` and `worker-validation-fix`.

## 0.3.4

- Made `sync-models.mjs` fall back to canonical package `execflow/settings.yml` when a project's local `.execflow/settings.yml` is missing newer prompt entries, so `/refresh-prompts` no longer fails on stale settings during prompt overlay refresh.

## 0.3.3

- Added explicit orchestration `model` / `thinking` frontmatter to chain wrapper prompts (`execflow`, `exec-delegated`, `exec-worker`, `plan-chain`, `review`) so Pi core treats them as prompt-template-model commands instead of plain prompt bodies.
- Synchronized all prompt frontmatter with `execflow/settings.yml` to fix model drift.
- Added model-sync validation to `validate-package.mjs` to catch prompt frontmatter drift from `execflow/settings.yml`.

## 0.3.2

- Refreshed model assignments: replaced deprecated `kimi-coding/k2p6` with `kimi-coding/kimi-for-coding`, updated `openai-codex/gpt-5.4` to `gpt-5.5`, switched fast model to `zai/glm-5-turbo`, and lowered `review1` thinking to medium.

## 0.3.1

- Made chain wrapper prompt bodies fail closed when Pi core executes them directly instead of `pi-prompt-template-model`, preventing `/execflow` and related commands from freeform execution.
- Added package validation to require fail-closed bodies on all chain prompts.

## 0.3.0

- Renamed the default local implementation chain from `/exec-standard` to `/execflow`, made it validation-only, and removed `/exec-strict`.
- Added `/validation-fix` with bounded convergence loop (`loop: 10`, `converge: true`) for validate/fix iterations.
- Added `/exec-delegated` with worker-subagent implementation (`worker-implement`) and validation/fix (`worker-validation-fix`) prompts, each using its own model for separate implementation and validation concerns.
- Restored `/review` to prompt-template parallel reviewer subagents now that `PI_SUBAGENT_RUNTIME_ROOT` can point to the installed `pi-subagents` package root.
- Split independent review into `/review` plus new `/review-followups`, which records review summaries and creates linked tracker follow-up work.
- Updated finalization semantics so validation-only closure is explicit and never implies that an independent review was run.
- Relaxed `validate-package` to allow `subagent:` frontmatter and `parallel(...)` in chains, since delegated execution now requires these.

## 0.2.8

- Clarified that delegated `/execflow` commands are optional external `tk` workflow commands when available, not shipped as primary `br` workflow commands.
- Defined deterministic brainstorm recency selection for architecture context using top-level `date:` values with file modification time fallback.
- Documented intentional reviewer subagent context isolation and strengthened `npm run validate-package` to catch related documentation drift.

## 0.2.7

- Removed the `/refresh-prompts` requirement from the `/init-execflow` tracker-scaffolding instructions so the init workflow matches the canonical generated template again.

## 0.2.6

- Aligned the default local workflow around `br`, added resumable brainstorm `in-progress` state support, and clarified the standard versus strict review/fix execution flow.
- Made `/init-execflow`, `/refresh-prompts`, and `/sync-models` discover the installed `@legout/pi-execflow` package root instead of assuming a git-checkout path.
- Normalized prompt `thinking:` frontmatter to scalar values and added `npm run validate-package` to catch prompt, template, and metadata drift.

## 0.2.5

- Made `/init-execflow` bootstrap project-local prompts deterministically by copying missing overlays into `.pi/prompts/` before continuing with normal setup.
- Added deterministic `/refresh-prompts` and updated `/sync-models` to operate against the installed `pi-execflow` package path for prompt syncing.
- Added model-conditional prompt instructions for planning and implementation prompts and enabled rotating multi-model passes for `/plan-improve`.

## 0.2.4

- Switched `/init-execflow` guidance to scaffold project-local prompt overlays in `.pi/prompts/` from `~/.pi/agent/git/github.com/legout/pi-execflow/prompts/`.
- Updated `/sync-models` and related docs to target `.pi/prompts/*.md` in initialized projects while keeping `prompts/*.md` as the package-development fallback.

## 0.2.3

- Added per-prompt model and thinking configuration in `execflow/settings.yml` using YAML anchors for reusable presets.
- Updated `scripts/sync-models.mjs` to sync prompt frontmatter from `prompts:` entries directly and to skip wrapper prompts that do not declare model frontmatter.
- Reassigned planning, spec, review, validation, and summary prompts to the configured models and refreshed prompt frontmatter and initialization docs accordingly.

## 0.2.2

- Fixed work-skill frontmatter so Pi can load `skills/work/*/SKILL.md` without skill-name or YAML parsing conflicts.

## 0.2.1

- Renamed the initialization command from `/init` to `/init-execflow` and updated the packaging metadata and docs accordingly.

## 0.2.0

- Renamed the packaged bootstrap artifacts from `.ticket-flow/` to `execflow/` and updated initialization to scaffold `.execflow/` in target projects.
- Updated prompt, skill, and documentation references to use `execflow` paths and the `kimi-coding/k2p6` implementation model name.
- Added a fallback in `scripts/sync-models.mjs` so the package repository can sync from `execflow/settings.yml` while initialized target repositories continue to use `.execflow/settings.yml`.

## 0.1.0

- Added the initial `pi-execflow` package for brainstorming, ExecPlan authoring, tracker-aware work-item creation, and manual ticket or issue execution.
- Added prompt templates, local execution skills, planning skills, and `execflow/` bootstrap artifacts required for a standalone Pi-installable workflow package.
- Added the `execflow/settings.yml` template and deterministic `/sync-models` support for syncing model-role assignments into prompt frontmatter.
