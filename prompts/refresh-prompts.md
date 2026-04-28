---
description: Refresh .pi/prompts from the installed pi-execflow prompt source and resync model frontmatter
run: |
  node <<'NODE'
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { spawnSync } = require('child_process');

  function readJson(filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return null;
    }
  }

  function isPackageRoot(dir) {
    const pkg = readJson(path.join(dir, 'package.json'));
    return Boolean(
      pkg &&
      pkg.name === '@legout/pi-execflow' &&
      fs.existsSync(path.join(dir, 'prompts')) &&
      fs.existsSync(path.join(dir, 'scripts', 'sync-models.mjs'))
    );
  }

  function searchForPackage(root) {
    if (!fs.existsSync(root)) return null;
    const stack = [root];
    while (stack.length) {
      const current = stack.pop();
      if (isPackageRoot(current)) return current;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name === '.git' || entry.name === 'node_modules') continue;
        stack.push(path.join(current, entry.name));
      }
    }
    return null;
  }

  function findPackageRoot() {
    let dir = process.cwd();
    while (true) {
      if (isPackageRoot(dir)) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }

    const searchRoots = [
      path.join(os.homedir(), '.pi', 'agent'),
      path.join(os.homedir(), 'Library', 'Application Support', 'Zed', 'external_agents', 'registry'),
    ];

    for (const root of searchRoots) {
      const match = searchForPackage(root);
      if (match) return match;
    }

    return null;
  }

  const packageRoot = findPackageRoot();
  if (!packageRoot) {
    console.error('Unable to locate the installed @legout/pi-execflow package root. Reinstall the package or run from the package checkout.');
    process.exit(1);
  }

  const srcDir = path.join(packageRoot, 'prompts');
  const dstDir = path.join(process.cwd(), '.pi', 'prompts');
  const retiredPromptFiles = [
    'derive-tests.md',
    'impl-plan.md',
    'review-consolidate.md',
    'exec-worker-implement.md',
    'exec-worker-validation-fix.md',
    'exec-worker.md',
  ];

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
  for (const fileName of retiredPromptFiles) {
    const retiredPath = path.join(dstDir, fileName);
    if (!fs.existsSync(retiredPath)) continue;
    fs.rmSync(retiredPath);
    console.log(`removed retired prompt overlay ${retiredPath}`);
  }
  console.log(`Refreshed prompt overlays from ${srcDir} into ${dstDir}`);

  const syncScript = path.join(packageRoot, 'scripts', 'sync-models.mjs');
  const result = spawnSync(process.execPath, [syncScript], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
  NODE
handoff: never
restore: true
---

Refresh `.pi/prompts/` from the resolved installed `@legout/pi-execflow` package root and then resync `model:` / `thinking:` from `.execflow/settings.yml`.
