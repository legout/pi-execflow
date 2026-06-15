---
description: Initialize planning + tracker scaffolding (.execflow/, .pi/prompts/, AGENTS.md, and optional tk/br tracker setup)
argument-hint: "[--tk|--br]"
model: zai/glm-5-turbo
thinking: medium
run: |
  for root in "$PWD" "$PWD/.pi/git/github.com/legout/pi-execflow" "$HOME/.pi/agent/git/github.com/legout/pi-execflow"; do
    if [ -f "$root/scripts/init-execflow.mjs" ]; then
      node "$root/scripts/init-execflow.mjs" "$@"
      exit $?
    fi
  done
  echo "Unable to locate @legout/pi-execflow. Install with: pi install git:github.com/legout/pi-execflow" >&2
  exit 1
handoff: always
restore: true
---

Initialize `pi-execflow` in the current project.

Accepted tracker flags:

- `--tk` — initialize for `tk` ticket tracking
- `--br` — initialize for `br` issue tracking

Canonical scaffold sources:

- prompts: `<resolved @legout/pi-execflow package root>/prompts/`
- execflow templates: `<resolved @legout/pi-execflow package root>/execflow/`

Tracker selection rules:

1. If both `--tk` and `--br` are present, stop and ask the user to choose one.
2. If exactly one flag is present, use that tracker mode.
3. If no flag is present and exactly one tracker workspace already exists, use it:
   - `.tickets/` → `tk`
   - `.beads/` → `br`
4. If no flag is present and both workspaces exist, ask which tracker should be treated as primary.
5. If no flag is present and neither workspace exists, default to `br`.

Goals:
1. Scaffold `.pi/prompts/` by copying missing prompt overlays from the canonical prompt source.
2. Scaffold `.execflow/AGENTS.md`, `.execflow/PLANS.md`, and `.execflow/settings.yml` by copying missing files from the canonical `execflow/` source.
3. Create or update the project-root `AGENTS.md` so it references `.execflow/AGENTS.md`.
4. Initialize the selected tracker tool safely:
   - `tk` mode → ensure `tk` is installed and `.tickets/` exists
   - `br` mode → ensure `br` is installed, recommend `bv`, ensure `.beads/` exists via `br init`, and refresh native root `AGENTS.md` instructions for `br`/`bv`
5. Run the repository's deterministic model sync so `.pi/prompts/*.md` reflects `.execflow/settings.yml`.

Rules:
- Do not overwrite user-authored files blindly.
- The deterministic pre-step already checked mandatory tracker binaries for unambiguous tracker modes, then copied **missing** files from the canonical package checkout. Use that as the starting point instead of inlining the full file contents in your response.
- Determine the selected tracker mode before writing tracker-specific instructions.
- For the root `AGENTS.md`:
  - If the file does not exist, create it with the block shown below.
  - If the file exists but does **not** contain `<!-- execflow -->`, **append** the block shown below at the end of the file.
  - If the file already contains `<!-- execflow -->`, replace everything between `<!-- execflow -->` and `<!-- /execflow -->` (inclusive) with the updated block.
  - Do not modify any content outside the `<!-- execflow -->` markers.
  - In `br` mode, after the execflow block exists, let native tools manage their own root `AGENTS.md` blocks: run `br agents --check --json`; if the beads block is missing, run `br agents --add --force`; if it is stale, run `br agents --update --force`.
  - In `br` mode, if `bv` is installed, run `bv --agents-check`; if its block is missing, run `bv --agents-add --agents-force`; if it is stale, run `bv --agents-update --agents-force`. If `bv` is not installed, recommend installing it but continue.
  - Do not copy `br` or `bv` generated instructions into `.execflow/AGENTS.md`; their native commands own root `AGENTS.md`.
- For `.execflow/AGENTS.md`:
  - If the file was created by the deterministic copy step, keep the copied content as the base.
  - If the file already exists and contains `<!-- execflow-generated -->` and `<!-- /execflow-generated -->`, refresh only that generated block using the canonical source file from the resolved installed package root as the base.
  - If the file exists but does **not** contain those markers, leave it untouched and report that manual review may be needed because the file appears user-customized.
  - In the generated block, ensure `Primary tracker selected during init-execflow:` matches the selected tracker mode.
- For `.execflow/PLANS.md`:
  - If the file was copied by the deterministic step, keep that copied content.
  - If it already existed before this run, leave it untouched.
- For `.execflow/settings.yml`:
  - If the file was copied by the deterministic step, keep the copied content as the base.
  - If it already existed before this run, leave it untouched unless the user explicitly asks to regenerate it.
  - When the file is managed by this init run, ensure `tracker.primary` matches the selected tracker mode.
- For `.pi/prompts/`:
  - Missing prompt files have already been copied from the canonical prompt source.
  - Leave existing prompt files untouched unless the user explicitly asks to regenerate prompt overlays.
- For tracker setup:
  - In `tk` mode, verify `tk` is installed. If `.tickets/` does not exist, create it. If it exists, leave it untouched.
  - In `br` mode, verify `br` is installed. If `br` is missing, stop and print installation instructions for https://github.com/Dicklesworthstone/beads_rust. If `.beads/` does not exist, run `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br init --actor "$ACTOR" --json`. If it exists, leave it untouched.
  - In `br` mode, check whether `bv` is installed. If it is missing, recommend installing `bv` for beads viewing, robot triage, and native agent instructions, but do not fail init.
  - Never delete or reset an existing tracker workspace as part of init.
- After scaffolding, if `.pi/prompts/` exists and `.execflow/settings.yml` exists, run the repository's model-sync step so project-local prompt frontmatter reflects the configured per-prompt model and thinking entries.
- Do not restate the full copied contents of `.execflow/AGENTS.md`, `.execflow/PLANS.md`, or `.execflow/settings.yml` in the answer unless necessary to explain a targeted edit.

Write `.execflow/AGENTS.md` by copying from:

- `<resolved @legout/pi-execflow package root>/execflow/AGENTS.md`

Write `.execflow/PLANS.md` by copying from:

- `<resolved @legout/pi-execflow package root>/execflow/PLANS.md`

Write `.execflow/settings.yml` by copying from:

- `<resolved @legout/pi-execflow package root>/execflow/settings.yml`

Insert the following block into the project root `AGENTS.md`:

```md
<!-- execflow -->
Planning and execution instructions live in `.execflow/AGENTS.md`.
Read that file before using `pi-execflow`, `tk`, `br`, `bv`, or ExecPlans in this repository.
<!-- /execflow -->
```

The marker-based blocks enable safe, idempotent re-runs of `/init-execflow`: only the content between the markers is touched.

When finished:
- report which tracker mode was selected
- report the copied/scaffolded paths
- report whether `.pi/prompts/` was synced from `.execflow/settings.yml`
- in `br` mode, report whether `br` and `bv` root `AGENTS.md` instructions were added, updated, already current, or skipped
