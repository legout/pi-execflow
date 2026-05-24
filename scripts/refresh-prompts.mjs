#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { currentPackageRoot } from "./package-root.mjs";
import { retiredPromptFiles } from "./retired-prompts.mjs";

const cwd = process.cwd();
const packageRoot = currentPackageRoot();
const srcDir = join(packageRoot, "prompts");
const dstDir = join(cwd, ".pi", "prompts");

function copyAll(srcBase, dstBase) {
  for (const entry of readdirSync(srcBase, { withFileTypes: true })) {
    const srcPath = join(srcBase, entry.name);
    const dstPath = join(dstBase, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(dstPath, { recursive: true });
      copyAll(srcPath, dstPath);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    copyFileSync(srcPath, dstPath);
  }
}

if (!existsSync(srcDir)) {
  console.error(`Canonical prompt source not found: ${srcDir}`);
  process.exit(1);
}

mkdirSync(dstDir, { recursive: true });
copyAll(srcDir, dstDir);
for (const fileName of retiredPromptFiles) {
  const retiredPath = join(dstDir, fileName);
  if (!existsSync(retiredPath)) continue;
  rmSync(retiredPath);
  console.log(`removed retired prompt overlay ${retiredPath}`);
}
console.log(`Refreshed prompt overlays from ${srcDir} into ${dstDir}`);

const syncScript = join(packageRoot, "scripts", "sync-models.mjs");
const result = spawnSync(process.execPath, [syncScript], { stdio: "inherit" });
process.exit(result.status ?? 1);
