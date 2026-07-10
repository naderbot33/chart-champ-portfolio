#!/usr/bin/env node
import { exportPausedJobDefinitions } from "../automation/lib/config.mjs";

const definitions = await exportPausedJobDefinitions();
process.stdout.write(`${JSON.stringify(definitions, null, 2)}\n`);
