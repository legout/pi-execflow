#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { currentPackageRoot } from "./package-root.mjs";
import { retiredPromptFiles } from "./retired-prompts.mjs";

const cwd = process.cwd();
const packageRoot = currentPackageRoot();
const promptSrcDir = join(packageRoot, "prompts");
const promptDstDir = join(cwd, ".pi", "prompts");
const execflowSrcDir = join(packageRoot, "execflow");
const execflowDstDir = join(cwd, ".execflow");

function copyMissingTree(srcBase, dstBase, predicate) {
  for (const entry of readdirSync(srcBase, { withFileTypes: true })) {
    const srcPath = join(srcBase, entry.name);
    const dstPath = join(dstBase, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(dstPath, { recursive: true });
      copyMissingTree(srcPath, dstPath, predicate);
      continue;
    }
    if (!entry.isFile()) continue;
    if (predicate && !predicate(entry.name, srcPath)) continue;
    if (existsSync(dstPath)) continue;
    copyFileSync(srcPath, dstPath);
    console.log(`created ${relative(cwd, dstPath)}`);
  }
}

if (!existsSync(promptSrcDir)) {
  console.error(`Canonical prompt source not found: ${promptSrcDir}`);
  process.exit(1);
}
if (!existsSync(execflowSrcDir)) {
  console.error(`Canonical execflow source not found: ${execflowSrcDir}`);
  process.exit(1);
}

mkdirSync(promptDstDir, { recursive: true });
mkdirSync(execflowDstDir, { recursive: true });

copyMissingTree(promptSrcDir, promptDstDir, (name) => name.endsWith(".md"));
for (const fileName of retiredPromptFiles) {
  const retiredPath = join(promptDstDir, fileName);
  if (!existsSync(retiredPath)) continue;
  rmSync(retiredPath);
  console.log(`removed retired prompt overlay ${relative(cwd, retiredPath)}`);
}
copyMissingTree(execflowSrcDir, execflowDstDir);

console.log(`scaffold-source ${packageRoot}`);
