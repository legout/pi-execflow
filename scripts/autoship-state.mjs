#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const DEFAULT_MAX_RETRIES = 2;
const MAX_RETRIES_CAP = 20;
const PROGRESS_PATH = ".execflow/autoship-progress.json";
const LESSONS_PATH = ".execflow/lessons-learned.md";

function fail(message) {
	console.error(message);
	process.exit(1);
}

function parseArgs(rawArgs) {
	if (rawArgs.length === 0) {
		fail(
			"Usage: autoship-state.mjs next --mode ship|ship-tdd [--max-retries N]",
		);
	}

	const command = rawArgs[0];
	if (command !== "next") {
		fail(`Unknown command: ${command}. Only 'next' is supported.`);
	}

	let mode = null;
	let maxRetries = DEFAULT_MAX_RETRIES;
	let readyJsonPath = null;

	for (let i = 1; i < rawArgs.length; i++) {
		const flag = rawArgs[i];
		if (flag === "--mode") {
			mode = rawArgs[++i];
		} else if (flag === "--max-retries") {
			const raw = rawArgs[++i];
			const parsed = Number(raw);
			if (!Number.isInteger(parsed)) {
				fail(`--max-retries must be an integer, received: ${raw}`);
			}
			if (parsed < 0) {
				fail(`--max-retries must be non-negative, received: ${raw}`);
			}
			if (parsed > MAX_RETRIES_CAP) {
				fail(`--max-retries must be <= ${MAX_RETRIES_CAP}, received: ${raw}`);
			}
			maxRetries = parsed;
		} else if (flag === "--ready-json-file") {
			// Internal fixture option for deterministic package validation only.
			readyJsonPath = rawArgs[++i];
		} else {
			fail(`Unknown option: ${flag}`);
		}
	}

	if (!mode) {
		fail("--mode is required");
	}
	if (!["ship", "ship-tdd"].includes(mode)) {
		fail(`--mode must be ship or ship-tdd, received: ${mode}`);
	}

	return { command, mode, maxRetries, readyJsonPath };
}

function readReadyIssues(readyJsonPath) {
	let jsonText;

	if (readyJsonPath) {
		if (!existsSync(readyJsonPath)) {
			fail(`Ready JSON fixture not found: ${readyJsonPath}`);
		}
		jsonText = readFileSync(readyJsonPath, "utf8");
	} else {
		const result = spawnSync("br", ["ready", "--limit", "0", "--json"], {
			encoding: "utf8",
			env: {
				...process.env,
				RUST_LOG: "error",
				ACTOR: process.env.BR_ACTOR || "assistant",
			},
			stdio: ["pipe", "pipe", "pipe"],
		});

		if (result.error) {
			fail(`Failed to run 'br ready': ${result.error.message}`);
		}
		if (result.status !== 0) {
			fail(
				`'br ready' exited with status ${result.status}:\n${result.stderr || result.stdout}`,
			);
		}
		jsonText = result.stdout;
	}

	let data;
	try {
		data = JSON.parse(jsonText);
	} catch (err) {
		fail(`Invalid JSON from ready source: ${err.message}`);
	}

	if (data && typeof data === "object" && !Array.isArray(data) && data.error) {
		fail(
			`br ready returned an error: ${data.error.message || JSON.stringify(data.error)}`,
		);
	}

	if (!Array.isArray(data)) {
		const keys =
			data && typeof data === "object"
				? Object.keys(data).join(", ")
				: String(data);
		fail(
			`Expected br ready JSON to be an array, got ${typeof data} with keys: ${keys}`,
		);
	}

	const issues = [];
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		if (
			!item ||
			typeof item !== "object" ||
			typeof item.id !== "string" ||
			!item.id
		) {
			const fields =
				item && typeof item === "object"
					? Object.keys(item).join(", ")
					: String(item);
			fail(
				`Ready issue at index ${i} is missing a string 'id' field. Fields seen: ${fields}`,
			);
		}
		issues.push({ id: item.id });
	}

	return issues;
}

function loadProgress() {
	if (!existsSync(PROGRESS_PATH)) {
		return null;
	}

	const text = readFileSync(PROGRESS_PATH, "utf8");
	try {
		return JSON.parse(text);
	} catch (err) {
		fail(
			`${PROGRESS_PATH} exists but is not valid JSON. Inspect or move it before running autoship. (${err.message})`,
		);
	}
}

function saveProgress(data) {
	mkdirSync(dirname(PROGRESS_PATH), { recursive: true });
	writeFileSync(PROGRESS_PATH, JSON.stringify(data, null, 2) + "\n");
}

function ensureLessons() {
	if (existsSync(LESSONS_PATH)) {
		return;
	}
	mkdirSync(dirname(LESSONS_PATH), { recursive: true });
	const content = `# Lessons learned\n\nAdd only durable, non-obvious lessons discovered during autoship runs. Do not append routine status updates, raw transcripts, or duplicate entries. Each lesson should help future autoship iterations avoid a repeated mistake or pitfall.\n`;
	writeFileSync(LESSONS_PATH, content);
}

function createRun(mode, maxRetries) {
	const now = new Date().toISOString();
	return {
		version: 1,
		activeRun: {
			id: `autoship-${now}`,
			mode,
			startedAt: now,
			maxRetries,
			maxAttempts: maxRetries + 1,
			status: "running",
			attemptsByIssue: {},
			lastIssueId: null,
			lastCommand: null,
			stopReason: null,
		},
		completedRuns: [],
	};
}

function archiveActiveRun(data) {
	if (!data || !data.activeRun) {
		return data;
	}

	const run = data.activeRun;
	if (run.status === "running") {
		run.status = "stopped";
		run.stopReason = run.stopReason || "superseded";
	}
	data.completedRuns.push(run);
	data.activeRun = null;
	return data;
}

function reconcilePreviousIssue(activeRun, readyIssueIds) {
	if (!activeRun?.lastIssueId) {
		return;
	}
	const record = activeRun.attemptsByIssue[activeRun.lastIssueId];
	if (record) {
		record.lastSeenReady = readyIssueIds.includes(activeRun.lastIssueId);
	}
}

function selectNext(data, readyIssues, mode, maxRetries) {
	const maxAttempts = maxRetries + 1;
	let run;

	if (
		!data ||
		!data.activeRun ||
		data.activeRun.status === "stopped" ||
		data.activeRun.mode !== mode ||
		data.activeRun.maxRetries !== maxRetries
	) {
		data = archiveActiveRun(data);
		const fresh = createRun(mode, maxRetries);
		data = { ...fresh, completedRuns: data?.completedRuns ?? [] };
		run = data.activeRun;
	} else {
		run = data.activeRun;
	}

	const readyIds = readyIssues.map((issue) => issue.id);
	reconcilePreviousIssue(run, readyIds);

	const selected = readyIssues.find((issue) => {
		const attempts = run.attemptsByIssue[issue.id]?.attempts ?? 0;
		return attempts < maxAttempts;
	});

	ensureLessons();

	if (!selected) {
		run.status = "stopped";

		if (readyIssues.length === 0) {
			run.stopReason = "no-ready-issues";
			run.lastCommand = null;
			run.lastIssueId = null;
			saveProgress(data);
			return { status: "stop", reason: "no-ready-issues" };
		}

		const exhaustedIssueIds = readyIssues.map((issue) => issue.id);
		run.stopReason = "all-ready-issues-exhausted";
		run.lastCommand = null;
		run.lastIssueId = null;
		saveProgress(data);
		return {
			status: "stop",
			reason: "all-ready-issues-exhausted",
			exhaustedIssueIds,
		};
	}

	const issueId = selected.id;
	const record = run.attemptsByIssue[issueId] ?? {
		attempts: 0,
		lastCommand: null,
		lastSelectedAt: null,
		lastSeenReady: true,
	};

	record.attempts += 1;
	record.lastCommand = `ef-${mode === "ship-tdd" ? "ship-tdd" : "ship"} ${issueId}`;
	record.lastSelectedAt = new Date().toISOString();
	record.lastSeenReady = true;
	run.attemptsByIssue[issueId] = record;
	run.lastIssueId = issueId;
	run.lastCommand = record.lastCommand;
	run.status = "running";
	run.stopReason = null;

	saveProgress(data);

	return {
		status: "dispatch",
		runId: run.id,
		mode,
		issueId,
		attempt: record.attempts,
		maxAttempts,
		command: run.lastCommand,
		progressPath: PROGRESS_PATH,
		lessonsPath: LESSONS_PATH,
	};
}

function main() {
	const args = process.argv.slice(2);
	if (args.includes("--self-test")) {
		runSelfTest();
		return;
	}

	const { mode, maxRetries, readyJsonPath } = parseArgs(args);
	const readyIssues = readReadyIssues(readyJsonPath);
	const data = loadProgress();
	const result = selectNext(data, readyIssues, mode, maxRetries);
	console.log(JSON.stringify(result));
}

// Self-test uses internal fixture data and temp dirs so it does not need a live br workspace.
function runSelfTest() {
	const scriptPath = fileURLToPath(import.meta.url);
	const tempDir = mkdtempSync(join(tmpdir(), "autoship-state-test-"));
	const failures = [];

	function cleanup() {
		try {
			rmSync(tempDir, { recursive: true, force: true });
		} catch {
			// ignore cleanup failures
		}
	}

	function run(args, cwd = tempDir) {
		return spawnSync(process.execPath, [scriptPath, ...args], {
			cwd,
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
	}

	function assertEqual(actual, expected, message) {
		if (actual !== expected) {
			failures.push(`${message}: expected ${expected}, got ${actual}`);
		}
	}

	try {
		for (const bad of ["-1", "1.5", "abc", "100"]) {
			const result = run(["next", "--mode", "ship", "--max-retries", bad]);
			if (result.status === 0) {
				failures.push(`Expected non-zero exit for --max-retries ${bad}`);
			}
			if (!result.stderr.includes("must be")) {
				failures.push(
					`Expected actionable error for --max-retries ${bad}: ${result.stderr}`,
				);
			}
		}

		writeFileSync(
			join(tempDir, "ready.json"),
			JSON.stringify([{ id: "issue-a" }, { id: "issue-b" }]),
		);

		let result = run([
			"next",
			"--mode",
			"ship",
			"--ready-json-file",
			"ready.json",
		]);
		if (result.status !== 0) {
			failures.push(
				`Unexpected exit status for default run: ${result.status}\n${result.stderr}`,
			);
		}
		let out = JSON.parse(result.stdout);
		assertEqual(out.status, "dispatch", "default run status");
		assertEqual(out.issueId, "issue-a", "default run selected issue");
		assertEqual(out.attempt, 1, "default run attempt");
		assertEqual(out.maxAttempts, 3, "default run maxAttempts");
		assertEqual(out.command, "ef-ship issue-a", "default run command");

		result = run([
			"next",
			"--mode",
			"ship",
			"--max-retries",
			"0",
			"--ready-json-file",
			"ready.json",
		]);
		out = JSON.parse(result.stdout);
		assertEqual(out.status, "dispatch", "retry 0 first status");
		assertEqual(out.issueId, "issue-a", "retry 0 first selected issue");
		assertEqual(out.attempt, 1, "retry 0 first attempt");
		assertEqual(out.maxAttempts, 1, "retry 0 maxAttempts");
		assertEqual(out.command, "ef-ship issue-a", "retry 0 first command");

		result = run([
			"next",
			"--mode",
			"ship",
			"--max-retries",
			"0",
			"--ready-json-file",
			"ready.json",
		]);
		out = JSON.parse(result.stdout);
		assertEqual(out.status, "dispatch", "retry 0 second status");
		assertEqual(
			out.issueId,
			"issue-b",
			"retry 0 should skip exhausted issue-a",
		);
		assertEqual(out.attempt, 1, "retry 0 second attempt");

		result = run([
			"next",
			"--mode",
			"ship",
			"--max-retries",
			"0",
			"--ready-json-file",
			"ready.json",
		]);
		out = JSON.parse(result.stdout);
		assertEqual(out.status, "stop", "retry 0 stop status");
		assertEqual(
			out.reason,
			"all-ready-issues-exhausted",
			"retry 0 stop reason",
		);

		const tddDir = mkdtempSync(join(tmpdir(), "autoship-state-tdd-"));
		writeFileSync(
			join(tddDir, "ready.json"),
			JSON.stringify([{ id: "issue-c" }]),
		);
		result = run(
			[
				"next",
				"--mode",
				"ship-tdd",
				"--max-retries",
				"2",
				"--ready-json-file",
				"ready.json",
			],
			tddDir,
		);
		out = JSON.parse(result.stdout);
		assertEqual(out.command, "ef-ship-tdd issue-c", "ship-tdd command");
		rmSync(tddDir, { recursive: true, force: true });

		const emptyDir = mkdtempSync(join(tmpdir(), "autoship-state-empty-"));
		writeFileSync(join(emptyDir, "ready.json"), JSON.stringify([]));
		result = run(
			["next", "--mode", "ship", "--ready-json-file", "ready.json"],
			emptyDir,
		);
		out = JSON.parse(result.stdout);
		assertEqual(out.status, "stop", "empty queue stop status");
		assertEqual(out.reason, "no-ready-issues", "empty queue stop reason");
		rmSync(emptyDir, { recursive: true, force: true });
	} catch (err) {
		failures.push(`Self-test threw: ${err.message}`);
	} finally {
		cleanup();
	}

	if (failures.length) {
		console.error("autoship-state self-test failed:");
		for (const failure of failures) {
			console.error(` - ${failure}`);
		}
		process.exit(1);
	}

	console.log("autoship-state self-test passed");
}

main();
