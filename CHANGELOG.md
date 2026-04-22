# Changelog

## Unreleased

- No unreleased changes yet.

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
