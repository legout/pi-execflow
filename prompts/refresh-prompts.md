---
description: Refresh .pi/prompts from the installed pi-execflow prompt source and resync model frontmatter
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

Refresh `.pi/prompts/` from the resolved installed `@legout/pi-execflow` package root and then resync `model:` / `thinking:` from `.execflow/settings.yml`.
