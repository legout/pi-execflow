#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { retiredPromptFiles } from "./retired-prompts.mjs";

const repoRoot = process.cwd();
const errors = [];

function addError(message) {
	errors.push(message);
}

function stripInlineComment(line) {
	const hashIndex = line.indexOf("#");
	if (hashIndex === -1) return line;
	return line.slice(0, hashIndex);
}

function parseSimpleScalar(raw, anchors) {
	const value = raw.trim();
	if (!value) return "";

	if (value.startsWith("*")) {
		const aliasName = value.slice(1).trim();
		return anchors.get(aliasName) ?? "";
	}

	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}

function parseScalarWithAnchor(raw, anchors) {
	const trimmed = raw.trim();
	if (!trimmed) return "";

	const anchorMatch = trimmed.match(/^&([A-Za-z0-9_-]+)\s+(.*)$/);
	let anchorName = null;
	let valueText = trimmed;

	if (anchorMatch) {
		anchorName = anchorMatch[1];
		valueText = anchorMatch[2].trim();
	}

	const value = parseSimpleScalar(valueText, anchors);
	if (anchorName) anchors.set(anchorName, value);
	return value;
}

function parseSimpleYaml(text) {
	const root = {};
	const anchors = new Map();
	const stack = [{ indent: -1, obj: root }];

	for (const originalLine of text.replace(/\r/g, "").split("\n")) {
		const line = stripInlineComment(originalLine).replace(/\s+$/, "");
		if (!line.trim()) continue;

		const indent = (line.match(/^\s*/) || [""])[0].length;
		while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
			stack.pop();
		}

		const parent = stack[stack.length - 1].obj;
		const content = line.slice(indent);
		const match = content.match(/^([A-Za-z0-9_.-]+):(?:\s*(.*))?$/);
		if (!match) {
			addError(`Unsupported settings.yml line: ${originalLine}`);
			continue;
		}

		const [, key, rawValue = ""] = match;
		if (rawValue.trim() === "") {
			const child = {};
			parent[key] = child;
			stack.push({ indent, obj: child });
			continue;
		}

		parent[key] = parseScalarWithAnchor(rawValue, anchors);
	}

	return root;
}

function extractFrontmatter(text, filePath) {
	const match = text.match(/^(---\n)([\s\S]*?)(\n---\n?)([\s\S]*)$/);
	if (!match) {
		addError(`Missing markdown frontmatter in ${filePath}`);
		return null;
	}
	return { frontmatter: match[2], body: match[4] };
}

function getFrontmatterField(frontmatter, key) {
	const line = frontmatter
		.split("\n")
		.find((entry) => entry.startsWith(`${key}:`));
	if (!line) return null;
	return line.slice(key.length + 1).trim();
}

function findTextMatches(paths, pattern, label) {
	for (const filePath of paths) {
		const text = readFileSync(filePath, "utf8");
		if (pattern.test(text)) {
			addError(`${label} found in ${filePath.replace(`${repoRoot}/`, "")}`);
		}
	}
}

function linesContaining(text, pattern) {
	return text
		.split("\n")
		.flatMap((line, index) =>
			pattern.test(line) ? [{ line, lineNumber: index + 1 }] : [],
		);
}

const settingsPath = join(repoRoot, "execflow", "settings.yml");
const agentsPath = join(repoRoot, "execflow", "AGENTS.md");
const readmePath = join(repoRoot, "README.md");
const promptsDir = join(repoRoot, "prompts");
const agentTemplatesDir = join(repoRoot, "agents");
const skillsDir = join(repoRoot, "skills");
const scriptsDir = join(repoRoot, "scripts");
const validateScriptPath = join(repoRoot, "scripts", "validate-package.mjs");

const settings = parseSimpleYaml(readFileSync(settingsPath, "utf8"));
const promptFiles = readdirSync(promptsDir)
	.filter((name) => name.endsWith(".md"))
	.sort();
const skillFiles = readdirSync(skillsDir, { recursive: true })
	.map((entry) => join(skillsDir, entry.toString()))
	.filter((filePath) => filePath.endsWith("SKILL.md") && existsSync(filePath));
const agentFiles = existsSync(agentTemplatesDir)
	? readdirSync(agentTemplatesDir)
			.filter((name) => name.endsWith(".md"))
			.sort()
	: [];
const agentNames = new Set();
const agentFrontmatterByName = new Map();
for (const agentFile of agentFiles) {
	const agentPath = join(agentTemplatesDir, agentFile);
	const extracted = extractFrontmatter(
		readFileSync(agentPath, "utf8"),
		agentPath,
	);
	if (!extracted) continue;
	const name = getFrontmatterField(extracted.frontmatter, "name");
	if (name) {
		agentNames.add(name);
		agentFrontmatterByName.set(name, extracted.frontmatter);
	}
}
for (const expectedAgent of [
	"ef-worker",
	"ef-validation-fix",
	"ef-reviewer",
	"ef-finalizer",
]) {
	if (!agentNames.has(expectedAgent)) {
		addError(`Missing package agent template: ${expectedAgent}`);
	}
}
for (const [agentName, expectedFallback] of [
	["ef-validation-fix", "openai-codex/gpt-5.4-mini"],
	["ef-finalizer", "openai-codex/gpt-5.4-mini"],
]) {
	const frontmatter = agentFrontmatterByName.get(agentName);
	if (!frontmatter) continue;
	if (getFrontmatterField(frontmatter, "fallbackModels") !== expectedFallback) {
		addError(`Agent ${agentName} must use fallbackModels: ${expectedFallback}`);
	}
}
const workerFrontmatter = agentFrontmatterByName.get("ef-worker");
if (
	workerFrontmatter &&
	getFrontmatterField(workerFrontmatter, "completionGuard") !== "false"
) {
	addError(
		"Agent ef-worker must set completionGuard: false for evidence-backed no-op implementations",
	);
}
const skillNames = new Set();
for (const skillPath of skillFiles) {
	const extracted = extractFrontmatter(
		readFileSync(skillPath, "utf8"),
		skillPath,
	);
	if (!extracted) continue;
	const name = getFrontmatterField(extracted.frontmatter, "name");
	if (name) skillNames.add(name);
}
const configuredPrompts = settings.prompts ?? {};
const removedSettingsPrompts = retiredPromptFiles.map((name) =>
	name.replace(/\.md$/, ""),
);

for (const removedPromptFile of retiredPromptFiles) {
	if (existsSync(join(promptsDir, removedPromptFile))) {
		addError(
			`Removed prompt file still exists in prompts/: ${removedPromptFile}`,
		);
	}
}

for (const removedPromptKey of removedSettingsPrompts) {
	if (
		configuredPrompts[removedPromptKey] ||
		configuredPrompts[`${removedPromptKey}.md`]
	) {
		addError(
			`Removed prompt still configured in execflow/settings.yml: ${removedPromptKey}`,
		);
	}
}

for (const promptFile of promptFiles) {
	const promptPath = join(promptsDir, promptFile);
	const extracted = extractFrontmatter(
		readFileSync(promptPath, "utf8"),
		promptPath,
	);
	if (!extracted) continue;
	const promptKey = basename(promptFile, ".md");
	const thinking = getFrontmatterField(extracted.frontmatter, "thinking");
	const hasModel = getFrontmatterField(extracted.frontmatter, "model") !== null;
	const hasThinking = thinking !== null;
	const configured =
		configuredPrompts[promptKey] ?? configuredPrompts[promptFile] ?? null;

	if (hasThinking && thinking.includes(",")) {
		addError(
			`Prompt ${promptFile} uses non-scalar thinking frontmatter: ${thinking}`,
		);
	}

	if ((hasModel || hasThinking) && !configured) {
		addError(
			`Prompt ${promptFile} has model/thinking frontmatter but no settings.prompts entry`,
		);
	}

	if (configured) {
		const model = getFrontmatterField(extracted.frontmatter, "model");
		if (model !== configured.model) {
			addError(
				`Prompt ${promptFile} model frontmatter is out of sync with settings.prompts.${promptKey}.model`,
			);
		}
		if (thinking !== configured.thinking) {
			addError(
				`Prompt ${promptFile} thinking frontmatter is out of sync with settings.prompts.${promptKey}.thinking`,
			);
		}
	}

	const promptSubagent = getFrontmatterField(extracted.frontmatter, "subagent");
	if (promptSubagent && !agentNames.has(promptSubagent)) {
		addError(
			`Prompt ${promptFile} references missing package agent: ${promptSubagent}`,
		);
	}

	const promptSkill = getFrontmatterField(extracted.frontmatter, "skill");
	if (promptSkill && !skillNames.has(promptSkill)) {
		addError(`Prompt ${promptFile} references missing skill: ${promptSkill}`);
	}

	if (
		/^inheritContext:\s*false$/m.test(extracted.frontmatter) &&
		!/Context isolation:.*inheritContext: false/s.test(extracted.body)
	) {
		addError(
			`Prompt ${promptFile} uses inheritContext: false without an explicit Context isolation explanation`,
		);
	}

	if (getFrontmatterField(extracted.frontmatter, "chain") !== null) {
		const hasFailClosedBody =
			/ERROR: This prompt body should never be executed\./.test(
				extracted.body,
			) &&
			/must be handled by `pi-prompt-template-model` as a chain prompt/.test(
				extracted.body,
			) &&
			/Do not implement, edit files, validate, review, plan, or mutate tracker state/.test(
				extracted.body,
			);
		if (!hasFailClosedBody) {
			addError(
				`Chain prompt ${promptFile} must have a fail-closed body for fallback execution`,
			);
		}
	}

	if (["ef-autoship.md", "ef-autoship-tdd.md"].includes(promptFile)) {
		const expectedChain =
			promptFile === "ef-autoship.md"
				? "ship-resolve -> ef-work -> ef-review-with-followups -> finalize"
				: "ship-tdd-resolve -> spec -> implement -> validation-fix --loop 5 -> ef-review-with-followups -> finalize";
		const expectedResolve =
			promptFile === "ef-autoship.md" ? "ship-resolve" : "ship-tdd-resolve";
		const expectedMode = promptFile === "ef-autoship.md" ? "ship" : "ship-tdd";
		const forbiddenResolve =
			promptFile === "ef-autoship.md" ? "ship-tdd-resolve" : "ship-resolve";

		if (promptSkill) {
			addError(`Prompt ${promptFile} must be a chain wrapper without a skill:`);
		}
		if (getFrontmatterField(extracted.frontmatter, "loop") !== "unlimited") {
			addError(`Prompt ${promptFile} must use loop: unlimited`);
		}
		if (getFrontmatterField(extracted.frontmatter, "fresh") !== "false") {
			addError(
				`Prompt ${promptFile} must use fresh: false to avoid branch-navigation failures between autoship iterations`,
			);
		}
		if (getFrontmatterField(extracted.frontmatter, "converge") !== "true") {
			addError(`Prompt ${promptFile} must use converge: true`);
		}
		const chainValue = getFrontmatterField(extracted.frontmatter, "chain");
		if (chainValue !== expectedChain) {
			addError(`Prompt ${promptFile} must use chain: ${expectedChain}`);
		}
		if (chainValue && !chainValue.startsWith(`${expectedResolve} ->`)) {
			addError(
				`Prompt ${promptFile} must dispatch through ${expectedResolve} (autoship-state --mode ${expectedMode})`,
			);
		}
		if (extracted.body.includes(forbiddenResolve)) {
			addError(
				`Prompt ${promptFile} must not reference ${forbiddenResolve} in fallback body`,
			);
		}
		if (/run-prompt/.test(extracted.body)) {
			addError(`Prompt ${promptFile} must not dispatch through run-prompt`);
		}
	}

	if (["ef-work-tdd.md", "ef-ship-tdd.md"].includes(promptFile)) {
		const expectedChain =
			promptFile === "ef-work-tdd.md"
				? "resolve -> spec -> implement -> validation-fix --loop 5 -> finalize"
				: "ship-tdd-resolve -> spec -> implement -> validation-fix --loop 5 -> ef-review-with-followups -> finalize";
		const chainValue = getFrontmatterField(extracted.frontmatter, "chain");
		if (chainValue !== expectedChain) {
			addError(`Prompt ${promptFile} must use chain: ${expectedChain}`);
		}
		if (!/validation-fix --loop 5/.test(chainValue || "")) {
			addError(
				`Prompt ${promptFile} must loop validation-fix inside the chain, not only in validation-fix.md frontmatter`,
			);
		}
	}

	if (
		promptFile === "validation-fix.md" &&
		!/validation-gate\.mjs/.test(extracted.body)
	) {
		addError(
			"Prompt validation-fix.md must persist its gate via scripts/validation-gate.mjs",
		);
	}
	if (
		promptFile === "finalize.md" &&
		!/validation-gate\.mjs/.test(extracted.body)
	) {
		addError(
			"Prompt finalize.md must consult the persisted gate via scripts/validation-gate.mjs",
		);
	}

	if (["ship-resolve.md", "ship-tdd-resolve.md"].includes(promptFile)) {
		const expectedMode = promptFile === "ship-resolve.md" ? "ship" : "ship-tdd";
		const helperCommandLines = linesContaining(
			extracted.body,
			/autoship-state\.mjs"?\s+next\b/,
		);
		const helperModePattern = new RegExp(
			`autoship-state\\.mjs"?\\s+next\\s+--mode\\s+${expectedMode}(?=\\s|$)`,
		);
		if (promptSkill !== "resolve") {
			addError(`Prompt ${promptFile} must reference skill: resolve`);
		}
		if (helperCommandLines.length === 0) {
			addError(
				`Prompt ${promptFile} must call autoship-state.mjs next with --mode ${expectedMode}`,
			);
		}
		for (const { line, lineNumber } of helperCommandLines) {
			if (!helperModePattern.test(line)) {
				addError(
					`Prompt ${promptFile} helper invocation at line ${lineNumber} must pass exact --mode ${expectedMode}`,
				);
			}
		}
		if (!extracted.body.includes(".pi/execflow-autoship-loop-marker.json")) {
			addError(
				`Prompt ${promptFile} must write .pi/execflow-autoship-loop-marker.json on next-ready dispatch`,
			);
		}
		if (!/(?:`write`|write) tool/.test(extracted.body)) {
			addError(
				`Prompt ${promptFile} must explicitly use the write tool for the autoship convergence marker`,
			);
		}
		if (!/do not write (?:the )?convergence marker/i.test(extracted.body)) {
			addError(
				`Prompt ${promptFile} must not write the autoship convergence marker on stop results`,
			);
		}
		if (
			!/\[ -f "\$root\/scripts\/autoship-state\.mjs" \]/.test(extracted.body)
		) {
			addError(
				`Prompt ${promptFile} must validate package-root candidates with [ -f "$root/scripts/autoship-state.mjs" ]`,
			);
		}
	}
}

for (const configuredKey of Object.keys(configuredPrompts)) {
	const fileName = configuredKey.endsWith(".md")
		? configuredKey
		: `${configuredKey}.md`;
	if (!existsSync(join(promptsDir, fileName))) {
		addError(
			`settings.prompts.${configuredKey} does not match a prompt file in prompts/`,
		);
	}
}

const settingsTracker = settings.tracker?.primary;
const agentsText = readFileSync(agentsPath, "utf8");
const trackerMatch = agentsText.match(
	/Primary tracker selected during ef-init: `([^`]+)`/,
);
const agentsTracker = trackerMatch?.[1] ?? null;
const readmeText = readFileSync(readmePath, "utf8");

if (settingsTracker !== agentsTracker) {
	addError(
		`Tracker default mismatch: execflow/settings.yml=${settingsTracker ?? "<missing>"}, execflow/AGENTS.md=${agentsTracker ?? "<missing>"}`,
	);
}

if (settingsTracker !== "br") {
	addError(
		`Expected execflow/settings.yml tracker.primary to be br, found ${settingsTracker ?? "<missing>"}`,
	);
}

if (!/defaults to `br`/.test(readmeText)) {
	addError("README.md must document that /ef-init defaults to br");
}

if (/pi install npm:|From npm/i.test(readmeText)) {
	addError(
		"README.md must not document npm installation; use the GitHub install path instead",
	);
}

const reviewSuiteText = readFileSync(
	join(skillsDir, "work", "review-suite", "SKILL.md"),
	"utf8",
);
if (!/tk dep <new-id> <original-id>/.test(reviewSuiteText)) {
	addError(
		"review-suite skill must tell tk follow-ups to depend on the reviewed original item",
	);
}
if (
	!/br dep add --type blocks <new-id> <original-id> --json/.test(
		reviewSuiteText,
	)
) {
	addError(
		"review-suite skill must tell br follow-ups to block on the reviewed original item",
	);
}
if (
	!/Follow-up dependencies: not-needed \/ all-created \/ incomplete \/ disabled/.test(
		reviewSuiteText,
	)
) {
	addError("review-suite output must report follow-up dependency status");
}

const packageJsonText = readFileSync(join(repoRoot, "package.json"), "utf8");
if (/"publishConfig"/.test(packageJsonText)) {
	addError(
		"package.json must not contain npm publishConfig; GitHub install is the supported distribution path",
	);
}

for (const promptName of ["ef-init.md", "ef-update.md"]) {
	const promptText = readFileSync(join(promptsDir, promptName), "utf8");
	if (/\.pi['", ]+agent['", ]+npm|node_modules/.test(promptText)) {
		addError(
			`${promptName} must not search npm/node_modules install locations; GitHub install is the supported distribution path`,
		);
	}
	if (!/git\/github\.com\/legout\/pi-execflow/.test(promptText)) {
		addError(`${promptName} must search the GitHub package install location`);
	}
}

const repoFiles = [readmePath];
for (const dir of [
	promptsDir,
	agentTemplatesDir,
	join(repoRoot, "execflow"),
	skillsDir,
	scriptsDir,
]) {
	for (const entry of readdirSync(dir, { recursive: true })) {
		const filePath = join(dir, entry.toString());
		if (existsSync(filePath) && !filePath.endsWith("/")) {
			try {
				if (!filePath.match(/\.(md|mjs|yml|yaml|json)$/)) continue;
				repoFiles.push(filePath);
			} catch {
				// ignore
			}
		}
	}
}

findTextMatches(
	repoFiles,
	/~\/\.pi\/agent\/git\/github\.com\/legout\/pi-execflow/g,
	"Hardcoded git install path",
);
findTextMatches(
	repoFiles.filter((filePath) => filePath !== validateScriptPath),
	/\bsubagents_list\b/g,
	"Invalid tool reference subagents_list",
);
findTextMatches(
	repoFiles,
	/relevant docs under `docs\/`/g,
	"Stale docs/ reference",
);

for (const filePath of repoFiles.filter(
	(filePath) => filePath !== validateScriptPath,
)) {
	const text = readFileSync(filePath, "utf8");
	for (const { line, lineNumber } of linesContaining(
		text,
		/`\/(?:execflow-queue|execflow-reset)\b/,
	)) {
		if (
			!/(optional|external|when available|delegated|not shipped)/i.test(line)
		) {
			addError(
				`Delegated execflow command reference needs optional/external wording in ${filePath.replace(`${repoRoot}/`, "")}:${lineNumber}`,
			);
		}
	}

	for (const { line, lineNumber } of linesContaining(
		text,
		/most recent brainstorm/i,
	)) {
		if (!/(date:|mtime|modification time)/i.test(line)) {
			addError(
				`Most recent brainstorm reference must define date/mtime selection in ${filePath.replace(`${repoRoot}/`, "")}:${lineNumber}`,
			);
		}
	}
}

const autoshipStatePath = join(scriptsDir, "autoship-state.mjs");
if (!existsSync(autoshipStatePath)) {
	addError("Missing scripts/autoship-state.mjs");
} else {
	try {
		execSync("node scripts/autoship-state.mjs --self-test", {
			cwd: repoRoot,
			stdio: "pipe",
		});
	} catch (err) {
		const detail =
			err.stderr?.toString() || err.stdout?.toString() || err.message;
		addError(`autoship-state self-test failed:\n${detail}`);
	}
}

const validationGatePath = join(scriptsDir, "validation-gate.mjs");
if (!existsSync(validationGatePath)) {
	addError("Missing scripts/validation-gate.mjs");
} else {
	try {
		execSync("node scripts/validation-gate.mjs --self-test", {
			cwd: repoRoot,
			stdio: "pipe",
		});
	} catch (err) {
		const detail =
			err.stderr?.toString() || err.stdout?.toString() || err.message;
		addError(`validation-gate self-test failed:\n${detail}`);
	}
}

if (errors.length) {
	console.error("pi-execflow validation failed:\n");
	for (const [index, error] of errors.entries()) {
		console.error(`${index + 1}. ${error}`);
	}
	process.exit(1);
}

console.log(
	`pi-execflow validation passed (${promptFiles.length} prompt files checked).`,
);
