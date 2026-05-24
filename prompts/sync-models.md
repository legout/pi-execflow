---
description: Sync project prompt frontmatter models from .execflow/settings.yml
run: |
  for root in "$PWD" "$PWD/.pi/git/github.com/legout/pi-execflow" "$HOME/.pi/agent/git/github.com/legout/pi-execflow"; do
    if [ -f "$root/scripts/run-sync-models.mjs" ]; then
      node "$root/scripts/run-sync-models.mjs"
      exit $?
    fi
  done
  echo "Unable to locate @legout/pi-execflow. Install with: pi install git:github.com/legout/pi-execflow" >&2
  exit 1
handoff: never
restore: true
---

Synchronize `.pi/prompts/*.md` model and thinking frontmatter from `.execflow/settings.yml`.
