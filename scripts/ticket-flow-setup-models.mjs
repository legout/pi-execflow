#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const settingsPath = join(repoRoot, ".ticket-flow", "settings.yml");
const promptDir = join(repoRoot, ".pi", "prompts");

const PROMPT_SLOT_MAP = new Map([
  ["architect.md", "orchestration"],
  ["brainstorm.md", "orchestration"],
  ["create-issues.md", "orchestration"],
  ["create-tickets.md", "orchestration"],
  ["create-work-items.md", "orchestration"],
  ["plan-create.md", "orchestration"],
  ["plan-improve.md", "orchestration"],
  ["ticket-finalize.md", "orchestration"],
  ["ticket-flow-init.md", "orchestration"],
  ["ticket-spec.md", "orchestration"],
  ["ticket-tests.md", "orchestration"],
  ["update-architecture.md", "orchestration"],

  ["ticket-implement.md", "implementation"],

  ["ticket-fix.md", "validation_fix"],
  ["ticket-validate.md", "validation_fix"],

  ["ticket-load.md", "fast"],
  ["ticket-merge-summary.md", "fast"],
  ["ticket-plan.md", "fast"],

  ["ticket-review-consolidate.md", "review1"],
  ["ticket-review-spec.md", "review1"],
  ["ticket-review-regression.md", "review2"],
  ["ticket-review-tests.md", "review3"],
  ["ticket-review-maintainability.md", "review4"],
]);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function stripInlineComment(line) {
  const hashIndex = line.indexOf("#");
  if (hashIndex === -1) return line;
  return line.slice(0, hashIndex);
}

function parseScalar(raw) {
  const value = raw.trim();
  if (!value) return "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseSimpleYaml(text) {
  const root = {};
  let currentSection = null;
  for (const originalLine of text.replace(/\r/g, "").split("\n")) {
    const line = stripInlineComment(originalLine).replace(/\s+$/, "");
    if (!line.trim()) continue;

    const topMatch = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
    if (topMatch && !line.startsWith("  ")) {
      const [, key, rawValue = ""] = topMatch;
      if (rawValue.trim() === "") {
        root[key] = {};
        currentSection = key;
      } else {
        root[key] = parseScalar(rawValue);
        currentSection = null;
      }
      continue;
    }

    const nestedMatch = line.match(/^  ([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nestedMatch && currentSection) {
      const [, key, rawValue = ""] = nestedMatch;
      root[currentSection][key] = parseScalar(rawValue);
      continue;
    }

    fail(`Unsupported settings.yml line: ${originalLine}`);
  }
  return root;
}

function extractFrontmatter(text, filePath) {
  const match = text.match(/^(---\n)([\s\S]*?)(\n---\n?)([\s\S]*)$/);
  if (!match) {
    fail(`Missing markdown frontmatter in ${filePath}`);
  }
  return {
    prefix: match[1],
    frontmatter: match[2],
    separator: match[3],
    body: match[4],
  };
}

function upsertFrontmatterField(lines, key, value) {
  const rendered = `${key}: ${value}`;
  const index = lines.findIndex((line) => line.match(new RegExp(`^${key}:\s*`)));
  if (index !== -1) {
    lines[index] = rendered;
    return;
  }

  if (key === "model") {
    const anchor = lines.findIndex((line) => /^argument-hint:\s*/.test(line));
    if (anchor !== -1) {
      lines.splice(anchor + 1, 0, rendered);
      return;
    }
    const description = lines.findIndex((line) => /^description:\s*/.test(line));
    if (description !== -1) {
      lines.splice(description + 1, 0, rendered);
      return;
    }
  }

  if (key === "thinking") {
    const modelIndex = lines.findIndex((line) => /^model:\s*/.test(line));
    if (modelIndex !== -1) {
      lines.splice(modelIndex + 1, 0, rendered);
      return;
    }
  }

  lines.push(rendered);
}

function syncPromptFile(filePath, slot, settings) {
  const text = readFileSync(filePath, "utf8");
  const { prefix, frontmatter, separator, body } = extractFrontmatter(text, filePath);
  const lines = frontmatter.split("\n");
  const modelValue = settings.models?.[slot];
  if (!modelValue) {
    fail(`Missing models.${slot} in ${settingsPath}`);
  }

  upsertFrontmatterField(lines, "model", modelValue);

  const thinkingValue = settings.thinking?.[slot];
  if (thinkingValue) {
    upsertFrontmatterField(lines, "thinking", thinkingValue);
  }

  const updated = `${prefix}${lines.join("\n")}${separator}${body}`;
  const changed = updated !== text;
  if (changed) {
    writeFileSync(filePath, updated);
  }
  return {
    file: filePath,
    slot,
    model: modelValue,
    thinking: thinkingValue ?? null,
    changed,
  };
}

if (!existsSync(settingsPath)) {
  fail(`Missing ${settingsPath}. Run /ticket-flow-init first or create the settings file.`);
}
if (!existsSync(promptDir)) {
  fail(`Missing ${promptDir}. Nothing to sync.`);
}

const settings = parseSimpleYaml(readFileSync(settingsPath, "utf8"));
const promptFiles = readdirSync(promptDir).filter((name) => name.endsWith(".md")).sort();
const results = [];

for (const promptFile of promptFiles) {
  const slot = PROMPT_SLOT_MAP.get(promptFile);
  if (!slot) continue;
  results.push(syncPromptFile(join(promptDir, promptFile), slot, settings));
}

const changed = results.filter((result) => result.changed);
process.stdout.write(`Applied model settings from .ticket-flow/settings.yml\n`);
process.stdout.write(`Updated ${changed.length} of ${results.length} mapped prompt files.\n`);
for (const result of results) {
  const relativePath = result.file.replace(`${repoRoot}/`, "");
  const state = result.changed ? "updated" : "unchanged";
  const thinkingSuffix = result.thinking ? ` | thinking=${result.thinking}` : "";
  process.stdout.write(`- ${relativePath}: ${state} | slot=${result.slot} | model=${result.model}${thinkingSuffix}\n`);
}
