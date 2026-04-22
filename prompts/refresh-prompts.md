---
description: Refresh .pi/prompts from the installed pi-execflow prompt source and resync model frontmatter
run: |
  node <<'NODE'
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  const srcDir = path.join(os.homedir(), '.pi', 'agent', 'git', 'github.com', 'legout', 'pi-execflow', 'prompts');
  const dstDir = path.join(process.cwd(), '.pi', 'prompts');

  function copyAll(srcBase, dstBase) {
    for (const entry of fs.readdirSync(srcBase, { withFileTypes: true })) {
      const srcPath = path.join(srcBase, entry.name);
      const dstPath = path.join(dstBase, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(dstPath, { recursive: true });
        copyAll(srcPath, dstPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      fs.copyFileSync(srcPath, dstPath);
    }
  }

  if (!fs.existsSync(srcDir)) {
    console.error(`Canonical prompt source not found: ${srcDir}`);
    process.exit(1);
  }

  fs.mkdirSync(dstDir, { recursive: true });
  copyAll(srcDir, dstDir);
  console.log(`Refreshed prompt overlays from ${srcDir} into ${dstDir}`);
  NODE
  && node ~/.pi/agent/git/github.com/legout/pi-execflow/scripts/sync-models.mjs
handoff: never
restore: true
---

Refresh `.pi/prompts/` from `~/.pi/agent/git/github.com/legout/pi-execflow/prompts/` and then resync `model:` / `thinking:` from `.execflow/settings.yml`.
