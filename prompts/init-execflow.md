---
description: Initialize planning + tracker scaffolding (.execflow/, .pi/prompts/, AGENTS.md, and optional tk/br tracker setup)
argument-hint: "[--tk|--br]"
model: zai/glm-5-turbo
thinking: medium
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
      fs.existsSync(path.join(dir, 'execflow')) &&
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

  function subagentRuntimeRootCandidates(packageRoot) {
    const candidates = [];
    const envRoot = process.env.PI_SUBAGENT_RUNTIME_ROOT?.trim();
    if (envRoot) candidates.push(envRoot);
    candidates.push(path.join(os.homedir(), '.pi', 'agent', 'extensions', 'subagent'));
    candidates.push(path.join(path.dirname(packageRoot), 'pi-subagents'));

    const nodeHome = path.dirname(path.dirname(process.execPath));
    candidates.push(path.join(nodeHome, 'lib', 'node_modules', 'pi-subagents'));

    const npmRoot = spawnSync('npm', ['root', '-g'], { encoding: 'utf8' });
    if (npmRoot.status === 0 && npmRoot.stdout.trim()) {
      candidates.push(path.join(npmRoot.stdout.trim(), 'pi-subagents'));
    }

    return [...new Set(candidates.map((candidate) => path.resolve(candidate)))];
  }

  function isSubagentRuntimeRoot(candidate) {
    return fs.existsSync(path.join(candidate, 'agents.ts')) || fs.existsSync(path.join(candidate, 'agents.js'));
  }

  function ensureLegacySubagentRuntimePath(packageRoot) {
    const legacyRoot = path.join(os.homedir(), '.pi', 'agent', 'extensions', 'subagent');
    if (isSubagentRuntimeRoot(legacyRoot)) return;

    const runtimeRoot = subagentRuntimeRootCandidates(packageRoot).find(isSubagentRuntimeRoot);
    if (!runtimeRoot) {
      console.warn('warning: pi-subagents runtime not found; /exec-delegated and /ef-review delegated steps may require PI_SUBAGENT_RUNTIME_ROOT.');
      return;
    }

    fs.mkdirSync(path.dirname(legacyRoot), { recursive: true });
    try {
      const existing = fs.lstatSync(legacyRoot, { throwIfNoEntry: false });
      if (existing?.isSymbolicLink()) fs.unlinkSync(legacyRoot);
      if (existing && !existing.isSymbolicLink()) {
        console.warn(`warning: ${legacyRoot} exists but is not a pi-subagents runtime; set PI_SUBAGENT_RUNTIME_ROOT if delegated prompts fail.`);
        return;
      }
      fs.symlinkSync(runtimeRoot, legacyRoot, 'dir');
      console.log(`created subagent runtime shim ${legacyRoot} -> ${runtimeRoot}`);
    } catch (error) {
      console.warn(`warning: could not create subagent runtime shim at ${legacyRoot}: ${error.message}`);
    }
  }

  const packageRoot = findPackageRoot();
  if (!packageRoot) {
    console.error('Unable to locate the installed @legout/pi-execflow package root. Reinstall the package or run from the package checkout.');
    process.exit(1);
  }

  ensureLegacySubagentRuntimePath(packageRoot);

  const promptSrcDir = path.join(packageRoot, 'prompts');
  const promptDstDir = path.join(process.cwd(), '.pi', 'prompts');
  const execflowSrcDir = path.join(packageRoot, 'execflow');
  const execflowDstDir = path.join(process.cwd(), '.execflow');
  const retiredPromptFiles = [
    'derive-tests.md',
    'impl-plan.md',
    'review-consolidate.md',
    'exec-delegate.md',
    'execflow.md',
    'exec-review.md',
    'review.md',
    'review-followups.md',
    'exec-worker-implement.md',
    'exec-worker-implementation.md',
    'exec-worker-validation-fix.md',
    'exec-worker.md',
  ];

  function copyMissingTree(srcBase, dstBase, predicate) {
    for (const entry of fs.readdirSync(srcBase, { withFileTypes: true })) {
      const srcPath = path.join(srcBase, entry.name);
      const dstPath = path.join(dstBase, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(dstPath, { recursive: true });
        copyMissingTree(srcPath, dstPath, predicate);
        continue;
      }
      if (!entry.isFile()) continue;
      if (predicate && !predicate(entry.name, srcPath)) continue;
      if (fs.existsSync(dstPath)) continue;
      fs.copyFileSync(srcPath, dstPath);
      console.log(`created ${path.relative(process.cwd(), dstPath)}`);
    }
  }

  if (!fs.existsSync(promptSrcDir)) {
    console.error(`Canonical prompt source not found: ${promptSrcDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(execflowSrcDir)) {
    console.error(`Canonical execflow source not found: ${execflowSrcDir}`);
    process.exit(1);
  }

  fs.mkdirSync(promptDstDir, { recursive: true });
  fs.mkdirSync(execflowDstDir, { recursive: true });

  copyMissingTree(promptSrcDir, promptDstDir, (name) => name.endsWith('.md'));
  for (const fileName of retiredPromptFiles) {
    const retiredPath = path.join(promptDstDir, fileName);
    if (!fs.existsSync(retiredPath)) continue;
    fs.rmSync(retiredPath);
    console.log(`removed retired prompt overlay ${path.relative(process.cwd(), retiredPath)}`);
  }
  copyMissingTree(execflowSrcDir, execflowDstDir);

  console.log(`scaffold-source ${packageRoot}`);
  NODE
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
   - `tk` mode → ensure `.tickets/` exists
   - `br` mode → ensure `.beads/` exists via `br init`
5. Run the repository's deterministic model sync so `.pi/prompts/*.md` reflects `.execflow/settings.yml`.

Rules:
- Do not overwrite user-authored files blindly.
- The deterministic pre-step already copied **missing** files from the canonical package checkout. Use that as the starting point instead of inlining the full file contents in your response.
- Determine the selected tracker mode before writing tracker-specific instructions.
- For the root `AGENTS.md`:
  - If the file does not exist, create it with the block shown below.
  - If the file exists but does **not** contain `<!-- execflow -->`, **append** the block shown below at the end of the file.
  - If the file already contains `<!-- execflow -->`, replace everything between `<!-- execflow -->` and `<!-- /execflow -->` (inclusive) with the updated block.
  - Do not modify any content outside the `<!-- execflow -->` markers.
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
  - In `br` mode, verify `br` is installed. If `.beads/` does not exist, run `ACTOR="${BR_ACTOR:-assistant}" && RUST_LOG=error br init --actor "$ACTOR" --json`. If it exists, leave it untouched.
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
Read that file before using `pi-execflow`, `tk`, `br`, or ExecPlans in this repository.
<!-- /execflow -->
```

The marker-based blocks enable safe, idempotent re-runs of `/init-execflow`: only the content between the markers is touched.

When finished:
- report which tracker mode was selected
- report the copied/scaffolded paths
- report whether `.pi/prompts/` was synced from `.execflow/settings.yml`
