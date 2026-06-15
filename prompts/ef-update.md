---
description: Update project-local pi-execflow scaffolding, prompt/subagent overlays, model frontmatter, and native br/bv AGENTS blocks
run: |
  for root in "$PWD" "$PWD/.pi/git/github.com/legout/pi-execflow" "$HOME/.pi/agent/git/github.com/legout/pi-execflow"; do
    if [ -f "$root/scripts/update-execflow.mjs" ]; then
      node "$root/scripts/update-execflow.mjs"
      exit $?
    fi
  done
  echo "Unable to locate @legout/pi-execflow. Install with: pi install git:github.com/legout/pi-execflow" >&2
  exit 1
handoff: never
restore: true
---

Update an already-initialized project from the resolved installed `@legout/pi-execflow` package root.

This is the supported maintenance front door. It refreshes `.pi/prompts/` and `.pi/agents/`, removes retired prompt overlays, refreshes marker-managed execflow instruction blocks, preserves user-customized settings/plans, synchronizes prompt `model:` / `thinking:` frontmatter from `.execflow/settings.yml`, and refreshes native `br`/`bv` root `AGENTS.md` instructions when the project uses `br`.
