#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

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

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
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
  const line = frontmatter.split("\n").find((entry) => entry.startsWith(`${key}:`));
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

const settingsPath = join(repoRoot, "execflow", "settings.yml");
const agentsPath = join(repoRoot, "execflow", "AGENTS.md");
const readmePath = join(repoRoot, "README.md");
const promptsDir = join(repoRoot, "prompts");
const skillsDir = join(repoRoot, "skills");
const scriptsDir = join(repoRoot, "scripts");
const validateScriptPath = join(repoRoot, "scripts", "validate-package.mjs");

const settings = parseSimpleYaml(readFileSync(settingsPath, "utf8"));
const promptFiles = readdirSync(promptsDir).filter((name) => name.endsWith(".md")).sort();
const configuredPrompts = settings.prompts ?? {};

for (const promptFile of promptFiles) {
  const promptPath = join(promptsDir, promptFile);
  const extracted = extractFrontmatter(readFileSync(promptPath, "utf8"), promptPath);
  if (!extracted) continue;
  const promptKey = basename(promptFile, ".md");
  const thinking = getFrontmatterField(extracted.frontmatter, "thinking");
  const hasModel = getFrontmatterField(extracted.frontmatter, "model") !== null;
  const hasThinking = thinking !== null;
  const configured = configuredPrompts[promptKey] ?? configuredPrompts[promptFile] ?? null;

  if (hasThinking && thinking.includes(",")) {
    addError(`Prompt ${promptFile} uses non-scalar thinking frontmatter: ${thinking}`);
  }

  if ((hasModel || hasThinking) && !configured) {
    addError(`Prompt ${promptFile} has model/thinking frontmatter but no settings.prompts entry`);
  }
}

for (const configuredKey of Object.keys(configuredPrompts)) {
  const fileName = configuredKey.endsWith(".md") ? configuredKey : `${configuredKey}.md`;
  if (!existsSync(join(promptsDir, fileName))) {
    addError(`settings.prompts.${configuredKey} does not match a prompt file in prompts/`);
  }
}

const settingsTracker = settings.tracker?.primary;
const agentsText = readFileSync(agentsPath, "utf8");
const trackerMatch = agentsText.match(/Primary tracker selected during init-execflow: `([^`]+)`/);
const agentsTracker = trackerMatch?.[1] ?? null;
const readmeText = readFileSync(readmePath, "utf8");

if (settingsTracker !== agentsTracker) {
  addError(`Tracker default mismatch: execflow/settings.yml=${settingsTracker ?? "<missing>"}, execflow/AGENTS.md=${agentsTracker ?? "<missing>"}`);
}

if (settingsTracker !== "br") {
  addError(`Expected execflow/settings.yml tracker.primary to be br, found ${settingsTracker ?? "<missing>"}`);
}

if (!/defaults to `br`/.test(readmeText)) {
  addError("README.md must document that /init-execflow defaults to br");
}

const repoFiles = [readmePath];
for (const dir of [promptsDir, join(repoRoot, "execflow"), skillsDir, scriptsDir]) {
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

findTextMatches(repoFiles, /~\/\.pi\/agent\/git\/github\.com\/legout\/pi-execflow/g, "Hardcoded git install path");
findTextMatches(repoFiles.filter((filePath) => filePath !== validateScriptPath), /\bsubagents_list\b/g, "Invalid tool reference subagents_list");
findTextMatches(repoFiles, /relevant docs under `docs\/`/g, "Stale docs/ reference");

if (errors.length) {
  console.error("pi-execflow validation failed:\n");
  for (const [index, error] of errors.entries()) {
    console.error(`${index + 1}. ${error}`);
  }
  process.exit(1);
}

console.log(`pi-execflow validation passed (${promptFiles.length} prompt files checked).`);
