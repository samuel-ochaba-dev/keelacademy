#!/usr/bin/env node
/**
 * Grammar-checks every ```mermaid fence in the content tree.
 *
 * Why this exists: diagrams are drawn in the browser, and this machine has none.
 * `mermaid.render` needs a DOM, and even `mermaid.parse` from the package entry
 * dies on `DOMPurify.addHook` because DOMPurify degrades to a bare factory with
 * no document. So a broken flowchart would ship silently and only show up as a
 * frame that never becomes a drawing.
 *
 * What it does instead: loads mermaid's own flowchart diagram chunk directly,
 * stubs the two DOMPurify methods it calls (sanitizing is irrelevant to a syntax
 * check), and runs the real jison parser over every fence. Verified to reject a
 * bad arrow, an unclosed bracket and a misspelled `flowchart` keyword.
 *
 * Run from platform/app: node scripts/check-mermaid.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const FENCE = /```mermaid[^\n]*\n([\s\S]*?)\n```/g;

function contentRoot() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i += 1) {
    if (safeStat(path.join(dir, "content", "units"))) return path.join(dir, "content");
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("content/units not found walking up from " + process.cwd());
}

function safeStat(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

function* markdownFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(full);
    else if (entry.name.endsWith(".md")) yield full;
  }
}

const dompurify = (await import("dompurify")).default;
for (const method of ["addHook", "removeHook", "removeAllHooks", "setConfig"]) {
  dompurify[method] ??= () => {};
}
dompurify.sanitize ??= (value) => String(value);

const chunkDir = path.join(process.cwd(), "node_modules/mermaid/dist/chunks/mermaid.core");
const chunkName = readdirSync(chunkDir).find((f) => f.startsWith("flowDiagram-"));
if (!chunkName) {
  console.error("mermaid's flowchart chunk is not where it was: " + chunkDir);
  process.exit(2);
}
const { createFlowDiagram } = await import(path.join(chunkDir, chunkName));

async function parse(definition) {
  const diagram = await createFlowDiagram();
  if (diagram.parser.parser) diagram.parser.parser.yy = diagram.db;
  diagram.parser.yy = diagram.db;
  await diagram.parser.parse(definition);
}

// The check is only worth running if it can still fail, so prove that first.
try {
  await parse('flowchart LR\n  A["one"] -*-> B["two"]');
  console.error("self-check failed: the parser accepted a broken graph");
  process.exit(2);
} catch {
  // Expected.
}

let checked = 0;
let failed = 0;
const root = contentRoot();

for (const file of markdownFiles(path.join(root, "units"))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(FENCE)) {
    checked += 1;
    const rel = path.relative(root, file);
    const line = text.slice(0, match.index).split("\n").length;
    const first = match[1].trim().split("\n")[0];
    if (!/^(flowchart|graph)\b/.test(first)) {
      console.log(`SKIP  ${rel}:${line}  not a flowchart (${first.slice(0, 40)})`);
      continue;
    }
    try {
      await parse(match[1]);
      console.log(`OK    ${rel}:${line}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${rel}:${line}\n      ${String(error.message).split("\n").join("\n      ")}`);
    }
  }
}

console.log(`\n${checked} mermaid fences, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
