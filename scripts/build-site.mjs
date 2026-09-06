#!/usr/bin/env node
import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { stageRelease, buildManifest } from "./portfolio-local-release.mjs";

// Every deploy path builds the same explicit public allowlist.
const staged = await stageRelease();
await rm(resolve("dist"), { recursive: true, force: true });
await mkdir(resolve("dist"), { recursive: true });
await cp(staged.publicDir, resolve("dist"), { recursive: true });
const manifest = await buildManifest(staged.publicDir);
console.log(JSON.stringify({ stageRoot: staged.stageRoot, configPath: staged.configPath, fileCount: manifest.files.length, quoteTimestamp: manifest.sourceTimestamp }));
