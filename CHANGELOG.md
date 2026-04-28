# Changelog

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
- Added `/exec-delegated` with worker-subagent implementation (`exec-worker-implement`) and validation/fix (`exec-worker-validation-fix`) prompts, each using its own model for separate implementation and validation concerns.
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
