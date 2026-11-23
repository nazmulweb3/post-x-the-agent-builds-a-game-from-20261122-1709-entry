// NEON DODGE entry for "The agent builds a game from one prompt" (program/v1, Node 22).
// The entry itself is the X post: the house reads the post's views and interactions from X.
// This program's only job is to hand the gate the post file: it copies POST.json from the
// repository root to /output/POST.json and checks the copy parses as a JSON object first,
// so a broken POST.json fails here loudly instead of silently reaching the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for
// /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "POST.json");
const targetPath = join(outputDir, "POST.json");

const raw = readFileSync(sourcePath, "utf8");
const parsed = JSON.parse(raw);
if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
  console.error(`POST.json at ${sourcePath} is not a JSON object`);
  process.exit(1);
}
if (typeof parsed.url !== "string" || parsed.url.length === 0) {
  console.error(`POST.json at ${sourcePath} has no url string`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);

// Read the copy back and check it byte-for-byte, so a truncated write fails here.
const copied = readFileSync(targetPath, "utf8");
const digest = (s) => createHash("sha256").update(s, "utf8").digest("hex");
if (digest(copied) !== digest(raw)) {
  console.error(`POST.json copy at ${targetPath} does not match ${sourcePath}`);
  process.exit(1);
}
console.log(`copied POST.json to ${targetPath} (sha256 ${digest(raw).slice(0, 12)}…)`);
