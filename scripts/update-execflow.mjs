#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { currentPackageRoot } from "./package-root.mjs";
import { retiredPromptFiles } from "./retired-prompts.mjs";

const cwd = process.cwd();
const packageRoot = currentPackageRoot();
const promptSrcDir = join(packageRoot, "prompts");
const promptDstDir = join(cwd, ".pi", "prompts");
const agentSrcDir = join(packageRoot, "agents");
const agentDstDir = join(cwd, ".pi", "agents");
const execflowSrcDir = join(packageRoot, "execflow");
const execflowDstDir = join(cwd, ".execflow");
const rootAgentsPath = join(cwd, "AGENTS.md");
const execflowAgentsPath = join(execflowDstDir, "AGENTS.md");
const execflowPlansPath = join(execflowDstDir, "PLANS.md");
const execflowSettingsPath = join(execflowDstDir, "settings.yml");
const canonicalAgentsPath = join(execflowSrcDir, "AGENTS.md");
const canonicalPlansPath = join(execflowSrcDir, "PLANS.md");
const canonicalSettingsPath = join(execflowSrcDir, "settings.yml");

function fail(message) {
	console.error(message);
	process.exit(1);
}

function hasCommand(name) {
	return (
		spawnSync("/bin/sh", ["-c", `command -v ${name} >/dev/null 2>&1`], {
			stdio: "ignore",
		}).status === 0
	);
}

function runCommand(command, args, label) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
	const ok = result.status === 0;
	const stdout = result.stdout?.trim();
	const stderr = result.stderr?.trim();
	if (ok) {
		console.log(`${label}: ok`);
		if (stdout) console.log(stdout);
		return true;
	}
	console.warn(
		`${label}: failed${result.status === null ? "" : ` (${result.status})`}`,
	);
	if (stderr) console.warn(stderr);
	if (stdout) console.warn(stdout);
	return false;
}

function readFileIfExists(path) {
	return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function parseTrackerFromSettings(text) {
	if (!text) return null;
	const match = text.match(
		/^tracker:\s*\n(?:\s+[^\n]*\n)*?\s+primary:\s*(tk|br)\s*$/m,
	);
	return match?.[1] ?? null;
}

function detectTrackerMode() {
	const settingsMode = parseTrackerFromSettings(
		readFileIfExists(execflowSettingsPath),
	);
	if (settingsMode) return settingsMode;

	const hasTickets = existsSync(join(cwd, ".tickets"));
	const hasBeads = existsSync(join(cwd, ".beads"));
	if (hasTickets && !hasBeads) return "tk";
	if (hasBeads && !hasTickets) return "br";
	if (!hasTickets && !hasBeads) return "br";
	return null;
}

function copyPromptOverlays() {
	if (!existsSync(promptSrcDir))
		fail(`Canonical prompt source not found: ${promptSrcDir}`);
	mkdirSync(promptDstDir, { recursive: true });
	for (const entry of readdirSync(promptSrcDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
		copyFileSync(
			join(promptSrcDir, entry.name),
			join(promptDstDir, entry.name),
		);
		console.log(`refreshed ${relative(cwd, join(promptDstDir, entry.name))}`);
	}
	for (const fileName of retiredPromptFiles) {
		const retiredPath = join(promptDstDir, fileName);
		if (!existsSync(retiredPath)) continue;
		rmSync(retiredPath);
		console.log(`removed retired prompt overlay ${relative(cwd, retiredPath)}`);
	}
}

function refreshAgentOverlays() {
	if (!existsSync(agentSrcDir))
		fail(`Canonical agent source not found: ${agentSrcDir}`);
	mkdirSync(agentDstDir, { recursive: true });
	for (const entry of readdirSync(agentSrcDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
		copyFileSync(join(agentSrcDir, entry.name), join(agentDstDir, entry.name));
		console.log(`refreshed ${relative(cwd, join(agentDstDir, entry.name))}`);
	}
}

function copyMissingFile(srcPath, dstPath) {
	if (existsSync(dstPath)) return false;
	mkdirSync(dirname(dstPath), { recursive: true });
	copyFileSync(srcPath, dstPath);
	console.log(`created ${relative(cwd, dstPath)}`);
	return true;
}

function replaceGeneratedBlock(text, replacement) {
	const pattern =
		/<!-- execflow-generated -->[\s\S]*?<!-- \/execflow-generated -->/;
	if (!pattern.test(text)) return null;
	return text.replace(pattern, replacement.trimEnd());
}

function canonicalExecflowAgentsBlock(trackerMode) {
	let text = readFileSync(canonicalAgentsPath, "utf8");
	text = text.replace(
		/Primary tracker selected during (?:init-execflow|ef-init): `(?:tk|br|unknown)`/,
		`Primary tracker selected during ef-init: \`${trackerMode ?? "unknown"}\``,
	);
	text = text.replace(/init-execflow/g, "ef-init");
	text = text.replace(/\/ef-sync/g, "/ef-update");
	return text;
}

function refreshExecflowAgents(trackerMode) {
	if (!existsSync(execflowAgentsPath)) {
		writeFileSync(
			execflowAgentsPath,
			canonicalExecflowAgentsBlock(trackerMode),
		);
		console.log(`created ${relative(cwd, execflowAgentsPath)}`);
		return;
	}

	const current = readFileSync(execflowAgentsPath, "utf8");
	const replacement = canonicalExecflowAgentsBlock(trackerMode);
	const updated = replaceGeneratedBlock(current, replacement);
	if (updated === null) {
		console.warn(
			`${relative(cwd, execflowAgentsPath)} has no execflow-generated markers; left untouched`,
		);
		return;
	}
	if (updated !== current) {
		writeFileSync(execflowAgentsPath, updated);
		console.log(
			`refreshed generated block in ${relative(cwd, execflowAgentsPath)}`,
		);
	} else {
		console.log(`${relative(cwd, execflowAgentsPath)} already current`);
	}
}

function ensureExecflowTemplates(trackerMode) {
	if (!existsSync(execflowSrcDir))
		fail(`Canonical execflow source not found: ${execflowSrcDir}`);
	mkdirSync(execflowDstDir, { recursive: true });
	refreshExecflowAgents(trackerMode);
	copyMissingFile(canonicalPlansPath, execflowPlansPath);
	copyMissingFile(canonicalSettingsPath, execflowSettingsPath);
}

function migrateKnownDefaultModels() {
	if (!existsSync(execflowSettingsPath)) return;
	// Migrate known default model lists. pi-prompt-template-model treats the
	// current model as "already active" when it matches ANY model in a prompt's
	// list, so broad sharing of fast selector models can trap the whole chain on
	// the selector model. Keep fast-only fallbacks out of plan/implementation,
	// while allowing an explicit gpt-5.4-mini fallback for closure-critical
	// orchestration and validation roles.
	const migrations = [
		{
			label: "fast model fallback",
			regex: /^(\s*fast:\s*&fast_model\s+)zai\/glm-5-turbo\s*$/m,
			replacement: "$1openai-codex/gpt-5.4-mini, kimi-coding/kimi-for-coding",
		},
		{
			label: "plan model fallback",
			regex:
				/^(\s*plan:\s*&plan_model\s+)openai-codex\/gpt-5\.5,\s*openai-codex\/gpt-5\.4-mini,\s*kimi-coding\/kimi-for-coding\s*$/m,
			replacement: "$1openai-codex/gpt-5.5, zai/glm-5.2",
		},
		{
			label: "implementation model fallback",
			regex:
				/^(\s*implementation:\s*&implementation_model\s+)kimi-coding\/k2p7,\s*openai-codex\/gpt-5\.4-mini\s*$/m,
			replacement: "$1kimi-coding/k2p7, zai/glm-5.2",
		},
		{
			label: "orchestration model fallback",
			regex:
				/^(\s*orchestration:\s*&orchestration_model\s+)(zai\/glm-5\.(?:2|turbo))\s*$/m,
			replacement: "$1$2, openai-codex/gpt-5.4-mini",
		},
		{
			label: "validation-fix model fallback",
			regex:
				/^(\s*validation_fix:\s*&validation_fix_model\s+)zai\/glm-5\.2\s*$/m,
			replacement: "$1zai/glm-5.2, openai-codex/gpt-5.4-mini",
		},
	];
	let current = readFileSync(execflowSettingsPath, "utf8");
	const applied = [];
	for (const { label, regex, replacement } of migrations) {
		const updated = current.replace(regex, replacement);
		if (updated !== current) {
			current = updated;
			applied.push(label);
		}
	}
	if (applied.length) {
		writeFileSync(execflowSettingsPath, current);
		console.log(
			`migrated ${relative(cwd, execflowSettingsPath)}: ${applied.join(", ")}`,
		);
	}
}

function rootExecflowBlock() {
	return `<!-- execflow -->\nPlanning and execution instructions live in \`.execflow/AGENTS.md\`.\nRead that file before using \`pi-execflow\`, \`tk\`, \`br\`, \`bv\`, or ExecPlans in this repository.\n<!-- /execflow -->\n`;
}

function updateRootAgentsBlock() {
	const block = rootExecflowBlock();
	if (!existsSync(rootAgentsPath)) {
		writeFileSync(rootAgentsPath, block);
		console.log(`created ${basename(rootAgentsPath)}`);
		return;
	}

	const current = readFileSync(rootAgentsPath, "utf8");
	const pattern = /<!-- execflow -->[\s\S]*?<!-- \/execflow -->\n?/;
	if (pattern.test(current)) {
		const updated = current.replace(pattern, block);
		if (updated !== current) {
			writeFileSync(rootAgentsPath, updated);
			console.log("refreshed execflow block in AGENTS.md");
		} else {
			console.log("AGENTS.md execflow block already current");
		}
		return;
	}

	const separator = current.endsWith("\n") ? "\n" : "\n\n";
	writeFileSync(rootAgentsPath, `${current}${separator}${block}`);
	console.log("appended execflow block to AGENTS.md");
}

function refreshNativeBrAgents() {
	if (!hasCommand("br")) {
		console.warn(
			"br mode detected, but br is not installed; skipped br AGENTS.md refresh",
		);
		return;
	}
	const updated = runCommand(
		"br",
		["agents", "--update", "--force"],
		"br agents --update --force",
	);
	if (!updated) {
		runCommand("br", ["agents", "--add", "--force"], "br agents --add --force");
	}
}

function refreshNativeBvAgents() {
	if (!hasCommand("bv")) {
		console.warn("bv is not installed; skipped bv AGENTS.md refresh");
		return;
	}
	const updated = runCommand(
		"bv",
		["--agents-update", "--agents-force"],
		"bv --agents-update --agents-force",
	);
	if (!updated) {
		runCommand(
			"bv",
			["--agents-add", "--agents-force"],
			"bv --agents-add --agents-force",
		);
	}
}

function runModelSync() {
	const syncScript = join(packageRoot, "scripts", "sync-models.mjs");
	const result = spawnSync(process.execPath, [syncScript], {
		cwd,
		stdio: "inherit",
	});
	process.exitCode = result.status ?? 1;
}

const trackerMode = detectTrackerMode();
console.log(`ef-update-tracker ${trackerMode ?? "ambiguous"}`);

copyPromptOverlays();
refreshAgentOverlays();
ensureExecflowTemplates(trackerMode);
migrateKnownDefaultModels();
updateRootAgentsBlock();
if (trackerMode === "br") {
	refreshNativeBrAgents();
	refreshNativeBvAgents();
}
runModelSync();
