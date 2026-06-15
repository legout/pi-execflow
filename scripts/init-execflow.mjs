#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { currentPackageRoot } from "./package-root.mjs";
import { retiredPromptFiles } from "./retired-prompts.mjs";

const cwd = process.cwd();
const args = process.argv.slice(2);
const packageRoot = currentPackageRoot();
const promptSrcDir = join(packageRoot, "prompts");
const promptDstDir = join(cwd, ".pi", "prompts");
const execflowSrcDir = join(packageRoot, "execflow");
const execflowDstDir = join(cwd, ".execflow");

function hasCommand(name) {
  return spawnSync("/bin/sh", ["-c", `command -v ${name} >/dev/null 2>&1`], {
    stdio: "ignore",
  }).status === 0;
}

function selectedTrackerMode() {
  const wantsTk = args.includes("--tk");
  const wantsBr = args.includes("--br");

  if (wantsTk && wantsBr) {
    console.error("Choose only one tracker flag: --tk or --br.");
    process.exit(1);
  }
  if (wantsTk) return "tk";
  if (wantsBr) return "br";

  const hasTickets = existsSync(join(cwd, ".tickets"));
  const hasBeads = existsSync(join(cwd, ".beads"));
  if (hasTickets && !hasBeads) return "tk";
  if (hasBeads && !hasTickets) return "br";
  if (!hasTickets && !hasBeads) return "br";

  return null;
}

function preflightTrackerTools(mode) {
  if (mode === "br") {
    if (!hasCommand("br")) {
      console.error("br is required for /init-execflow --br and default br mode.");
      console.error("Install br from: https://github.com/Dicklesworthstone/beads_rust");
      console.error("Then rerun /init-execflow --br.");
      process.exit(1);
    }
    if (!hasCommand("bv")) {
      console.warn(
        "Recommended: install bv so beads viewer instructions and robot triage are available.",
      );
    }
  }

  if (mode === "tk" && !hasCommand("tk")) {
    console.error("tk is required for /init-execflow --tk.");
    console.error("Install tk, then rerun /init-execflow --tk.");
    process.exit(1);
  }
}

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

preflightTrackerTools(selectedTrackerMode());

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
