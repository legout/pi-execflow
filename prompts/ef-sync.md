---
description: Simplified public command for refreshing prompt overlays and syncing model frontmatter
run: |
  for root in "$PWD" "$PWD/.pi/git/github.com/legout/pi-execflow" "$HOME/.pi/agent/git/github.com/legout/pi-execflow"; do
    if [ -f "$root/scripts/refresh-prompts.mjs" ]; then
      node "$root/scripts/refresh-prompts.mjs"
      exit $?
    fi
  done
  echo "Unable to locate @legout/pi-execflow. Install with: pi install git:github.com/legout/pi-execflow" >&2
  exit 1
handoff: never
restore: true
---

Refresh `.pi/prompts/` from the resolved installed `@legout/pi-execflow` package root and synchronize prompt `model:` / `thinking:` frontmatter from `.execflow/settings.yml`.

This is the supported public sync command. Internal refresh/model-sync helper prompts are not part of the public workflow.
