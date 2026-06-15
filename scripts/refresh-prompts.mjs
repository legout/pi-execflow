#!/usr/bin/env node
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { currentPackageRoot } from "./package-root.mjs";

const packageRoot = currentPackageRoot();
const updateScript = join(packageRoot, "scripts", "update-execflow.mjs");
const result = spawnSync(process.execPath, [updateScript], {
	stdio: "inherit",
});
process.exit(result.status ?? 1);
