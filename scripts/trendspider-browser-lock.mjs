#!/usr/bin/env node
import {
  acquireTrendSpiderLock,
  releaseTrendSpiderLock
} from "../automation/lib/trendspider-lock.mjs";

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    if (rest[index] === "--token") options.token = rest[++index];
    else throw new Error(`Unknown argument: ${rest[index]}`);
  }
  if (!["acquire", "release"].includes(command)) {
    throw new Error("Usage: node scripts/trendspider-browser-lock.mjs acquire|release [--token TOKEN]");
  }
  return options;
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result =
    options.command === "acquire"
      ? await acquireTrendSpiderLock()
      : await releaseTrendSpiderLock({ token: options.token });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (options.command === "acquire" && !result.acquired) process.exitCode = 2;
  if (options.command === "release" && !result.released) process.exitCode = 1;
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
