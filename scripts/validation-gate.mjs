#!/usr/bin/env node
// Persisted validation gate for the /ef-ship-tdd and /ef-autoship-tdd chains.
//
// The /finalize step runs in fresh context and cannot always see the
// /validation-fix transcript for the current work item (this happens when a
// re-dispatched work item's implementation already exists and the chain does
// not re-emit a fresh gate in-band). To keep closure resilient, /validation-fix
// writes its gate here via `bash` (NOT the write tool, so prompt-template loop
// convergence is unaffected), and /finalize reads it back with `verify`.
//
// A gate is only trustworthy if the source code now is byte-identical to the
// code that was validated. We record headCommit and a hash of the tracked
// dirty tree; verify recomputes both and reports `fresh`/`closable`. Because
// .execflow/ and .pi/ are gitignored workflow state, `git diff HEAD` already
// excludes their churn, so the signature tracks real source edits only.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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

const GATE_PATH = ".execflow/validation-gate.json";
const VALID_GATES = ["PASS", "REVISE", "BLOCKED"];
const VALID_SYSTEMS = ["tk", "br", "other"];

function fail(message) {
	console.error(message);
	process.exit(1);
}

function parseArgs(rawArgs) {
	if (rawArgs.length === 0) {
		fail(
			"Usage: validation-gate.mjs <write|verify|show> --issue <id> [--system <tk|br|other>] [--gate <PASS|REVISE|BLOCKED>] [--summary <text>]",
		);
	}
	const command = rawArgs[0];
	if (!["write", "verify", "show"].includes(command)) {
		fail(`Unknown command: ${command}. Supported: write, verify, show.`);
	}
	const opts = {
		command,
		issue: null,
		system: null,
		gate: null,
		summary: "",
	};
	for (let i = 1; i < rawArgs.length; i++) {
		const flag = rawArgs[i];
		const value = rawArgs[++i];
		if (value === undefined) {
			fail(`Missing value for ${flag}`);
		}
		if (flag === "--issue") opts.issue = value;
		else if (flag === "--system") opts.system = value;
		else if (flag === "--gate") opts.gate = value;
		else if (flag === "--summary") opts.summary = value;
		else fail(`Unknown option: ${flag}`);
	}
	if (!opts.issue && command !== "show") {
		fail("--issue is required");
	}
	if (command === "write") {
		if (!opts.gate || !VALID_GATES.includes(opts.gate)) {
			fail(`--gate must be one of ${VALID_GATES.join(", ")}`);
		}
		if (opts.system && !VALID_SYSTEMS.includes(opts.system)) {
			fail(`--system must be one of ${VALID_SYSTEMS.join(", ")}`);
		}
	}
	return opts;
}

function gitOutput(args) {
	const result = spawnSync("git", args, {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
	});
	if (result.status !== 0) {
		return "";
	}
	return result.stdout ?? "";
}

function headCommit() {
	const out = gitOutput(["rev-parse", "HEAD"]).trim();
	return out || "unknown";
}

// Hash of HEAD plus the tracked working-tree diff, excluding gitignored
// workflow state (.execflow, .pi). Both sides compute this identically, so a
// mismatch reliably means real source changed after the gate was recorded.
function treeSha(head) {
	const diff = gitOutput([
		"diff",
		"HEAD",
		"--",
		".",
		":(exclude).execflow",
		":(exclude).pi",
	]);
	return createHash("sha256")
		.update(`${head}\n${diff}`)
		.digest("hex")
		.slice(0, 16);
}

function loadGate() {
	if (!existsSync(GATE_PATH)) {
		return null;
	}
	try {
		return JSON.parse(readFileSync(GATE_PATH, "utf8"));
	} catch (err) {
		return { _corrupt: true, _error: err.message };
	}
}

function writeGate(opts) {
	const head = headCommit();
	const gate = {
		version: 1,
		issue: opts.issue,
		system: opts.system || "other",
		gate: opts.gate,
		gateAt: new Date().toISOString(),
		headCommit: head,
		treeSha: treeSha(head),
		evidenceSummary: String(opts.summary || "").slice(0, 200),
	};
	mkdirSync(dirname(GATE_PATH), { recursive: true });
	writeFileSync(GATE_PATH, JSON.stringify(gate, null, 2) + "\n");
	return gate;
}

function verifyGate(issue) {
	const stored = loadGate();
	const currentHead = headCommit();
	const currentTreeSha = treeSha(currentHead);
	if (!stored || stored._corrupt) {
		return {
			issue,
			stored: false,
			reason: stored?._corrupt
				? `gate file is corrupt: ${stored._error}`
				: "no persisted gate",
			closable: false,
		};
	}
	const headMatch = stored.headCommit === currentHead;
	const treeMatch = stored.treeSha === currentTreeSha;
	const fresh = headMatch && treeMatch;
	let reason;
	if (stored.issue !== issue) {
		reason = `gate is for a different work item (${stored.issue})`;
	} else if (!fresh) {
		reason = !headMatch
			? "source was committed after the gate was recorded"
			: "source dirty tree changed after the gate was recorded";
	} else if (stored.gate !== "PASS") {
		reason = `stored gate is ${stored.gate}, not PASS`;
	} else {
		reason = "stored PASS gate matches current source";
	}
	return {
		issue,
		stored: true,
		storedIssue: stored.issue,
		gate: stored.gate,
		gateAt: stored.gateAt,
		headMatch,
		treeMatch,
		fresh,
		closable: fresh && stored.issue === issue && stored.gate === "PASS",
		reason,
	};
}

function main() {
	const args = process.argv.slice(2);
	if (args.includes("--self-test")) {
		runSelfTest();
		return;
	}
	const opts = parseArgs(args);
	if (opts.command === "write") {
		console.log(JSON.stringify(writeGate(opts)));
	} else if (opts.command === "verify") {
		console.log(JSON.stringify(verifyGate(opts.issue)));
	} else {
		const stored = loadGate();
		console.log(stored ? JSON.stringify(stored) : "{}");
	}
}

// Self-test uses a temp dir (not a git repo) so head/tree are stable ("unknown").
function runSelfTest() {
	const scriptPath = fileURLToPath(import.meta.url);
	const tempDir = mkdtempSync(join(tmpdir(), "validation-gate-test-"));
	const failures = [];

	function cleanup() {
		try {
			rmSync(tempDir, { recursive: true, force: true });
		} catch {
			// ignore cleanup failures
		}
	}

	function run(args, cwd = tempDir) {
		const result = spawnSync(process.execPath, [scriptPath, ...args], {
			cwd,
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		let json = null;
		if (result.status === 0 && result.stdout) {
			try {
				json = JSON.parse(result.stdout);
			} catch (err) {
				failures.push(
					`args ${args.join(" ")} returned non-JSON stdout: ${err.message}`,
				);
			}
		}
		return { status: result.status, stderr: result.stderr ?? "", json };
	}

	function assertEqual(actual, expected, message) {
		if (actual !== expected) {
			failures.push(`${message}: expected ${expected}, got ${actual}`);
		}
	}

	try {
		// Arg validation: every case must exit non-zero with an actionable error.
		const badCases = [
			{ args: [], expect: /Usage:|required|Supported/ },
			{ args: ["bogus", "--issue", "x"], expect: /Supported/ },
			{ args: ["write", "--issue", "x"], expect: /--gate must be/ },
			{
				args: ["write", "--issue", "x", "--gate", "MAYBE"],
				expect: /--gate must be/,
			},
			{
				args: ["write", "--issue", "x", "--gate", "PASS", "--system", "jira"],
				expect: /--system must be/,
			},
		];
		for (const { args, expect } of badCases) {
			const { status, stderr } = run(args);
			if (status === 0) {
				failures.push(`Expected non-zero exit for args: ${args.join(" ")}`);
			}
			if (!expect.test(stderr)) {
				failures.push(
					`Expected error matching ${expect} for args ${args.join(" ")}: ${stderr}`,
				);
			}
		}

		// write PASS for issue-a, then verify -> closable.
		let res = run([
			"write",
			"--issue",
			"issue-a",
			"--system",
			"br",
			"--gate",
			"PASS",
			"--summary",
			"all tests green",
		]);
		if (!res.json) {
			failures.push(
				`write PASS returned no JSON (status ${res.status}): ${res.stderr}`,
			);
		} else {
			assertEqual(res.json.issue, "issue-a", "write issue");
			assertEqual(res.json.gate, "PASS", "write gate");
			assertEqual(res.json.system, "br", "write system");
		}

		res = run(["verify", "--issue", "issue-a"]);
		if (!res.json) {
			failures.push(`verify issue-a returned no JSON: ${res.stderr}`);
		} else {
			assertEqual(res.json.stored, true, "verify stored");
			assertEqual(
				res.json.headMatch,
				true,
				"verify headMatch (no git -> stable)",
			);
			assertEqual(
				res.json.treeMatch,
				true,
				"verify treeMatch (no git -> stable)",
			);
			assertEqual(res.json.fresh, true, "verify fresh");
			assertEqual(res.json.closable, true, "verify closable for PASS");
		}

		// Overwrite with a different issue -> issue-a no longer closable.
		run([
			"write",
			"--issue",
			"issue-b",
			"--system",
			"tk",
			"--gate",
			"REVISE",
			"--summary",
			"one test red",
		]);
		res = run(["verify", "--issue", "issue-a"]);
		if (!res.json) {
			failures.push(
				`verify issue-a (post-overwrite) returned no JSON: ${res.stderr}`,
			);
		} else {
			assertEqual(res.json.closable, false, "stale issue not closable");
			if (!/different work item/.test(res.json.reason)) {
				failures.push(
					`Expected different-issue reason, got: ${res.json.reason}`,
				);
			}
		}

		// Same issue but REVISE -> fresh but not closable.
		res = run(["verify", "--issue", "issue-b"]);
		if (!res.json) {
			failures.push(`verify issue-b returned no JSON: ${res.stderr}`);
		} else {
			assertEqual(res.json.fresh, true, "revise fresh");
			assertEqual(res.json.closable, false, "revise not closable");
			if (!/not PASS/.test(res.json.reason)) {
				failures.push(`Expected not-PASS reason, got: ${res.json.reason}`);
			}
		}

		// show echoes the stored gate.
		res = run(["show"]);
		if (!res.json) {
			failures.push(`show returned no JSON: ${res.stderr}`);
		} else {
			assertEqual(res.json.issue, "issue-b", "show latest issue");
		}

		// Missing gate file -> not stored, not closable.
		rmSync(join(tempDir, GATE_PATH), { force: true });
		res = run(["verify", "--issue", "issue-b"]);
		if (!res.json) {
			failures.push(`verify (no gate) returned no JSON: ${res.stderr}`);
		} else {
			assertEqual(res.json.stored, false, "no gate stored");
			assertEqual(res.json.closable, false, "no gate closable");
		}
	} catch (err) {
		failures.push(`Self-test threw: ${err.message}`);
	} finally {
		cleanup();
	}

	if (failures.length) {
		console.error("validation-gate self-test failed:");
		for (const failure of failures) {
			console.error(` - ${failure}`);
		}
		process.exit(1);
	}

	console.log("validation-gate self-test passed");
}

main();
