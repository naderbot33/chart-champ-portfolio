#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dispatchDraft } from "../automation/lib/dispatch.mjs";

function parseArgs(argv) {
  const args = { allowSend: false, forceDryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--input") args.input = argv[++index];
    else if (value === "--context") args.context = argv[++index];
    else if (value === "--job") args.jobId = argv[++index];
    else if (value === "--runtime-dir") args.runtimeDir = argv[++index];
    else if (value === "--allow-send") args.allowSend = true;
    else if (value === "--dry-run") args.forceDryRun = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!args.input || !args.context || !args.jobId) {
    throw new Error(
      "Usage: node scripts/dispatch-discord-draft.mjs --job JOB --input DRAFT.json --context CONTEXT.json [--dry-run] [--runtime-dir DIR] [--allow-send]"
    );
  }
  return args;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(path), "utf8"));
}

try {
  const args = parseArgs(process.argv.slice(2));
  const [input, context] = await Promise.all([readJson(args.input), readJson(args.context)]);
  if (args.forceDryRun) input.dryRun = true;
  const result = await dispatchDraft({
    input,
    context,
    jobId: args.jobId,
    runtimeDir: args.runtimeDir ? resolve(args.runtimeDir) : undefined,
    allowSend: args.allowSend
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (["blocked", "error", "webhook-mismatch"].includes(result.status)) process.exitCode = 1;
  if (result.status === "skipped") process.exitCode = 2;
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
