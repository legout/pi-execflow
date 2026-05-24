#!/usr/bin/env node
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { currentPackageRoot } from "./package-root.mjs";

const packageRoot = currentPackageRoot();
const syncScript = join(packageRoot, "scripts", "sync-models.mjs");
const result = spawnSync(process.execPath, [syncScript], { stdio: "inherit" });
process.exit(result.status ?? 1);
