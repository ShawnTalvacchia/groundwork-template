#!/usr/bin/env node
/**
 * `npm run verify` — the build, plus the gate the build deliberately isn't.
 *
 * Two audiences, one alarm:
 *
 *   `next build`  WARNS and PASSES. A drifted doc format is a record defect,
 *                 not a compile error, and failing the build would block you
 *                 mid-edit or take a deploy down over a markdown heading. That
 *                 is the "WARN, never fail" rule in lib/derivation.ts, and it
 *                 is unchanged.
 *   `verify`      GATES. It reads the alarms back after the build and exits
 *                 non-zero, listing each one.
 *
 * Why a gate at all: a check that reports into a build exiting 0 stops nobody.
 * A drifted doc format fails silently by nature — the parser returns partial
 * output and the page renders hollow — so the alarm is the only signal, and an
 * alarm nobody hears is not a check. Running it here binds it to a moment that
 * already fires, instead of to somebody remembering to grep a build log.
 *
 * Run this before you push. `npm run check` (typecheck + lint) covers the code;
 * this covers the record.
 *
 * One more gate, run BEFORE the build starts: every .svg this repo serves as a
 * file — app/icon.svg, anything under public/ — must parse as STRICT XML,
 * because that is how a browser reads image/svg+xml. A single `--` inside a
 * comment is enough to make the file undecodable and the favicon vanish from
 * every page, silently: the same markup inlined into HTML by a component
 * parses fine (the HTML parser is lenient), so nothing inside the app ever
 * fails. Only the strict path fails, and this is the one place that walks it.
 * `next build` does not.
 */

import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { SaxesParser } from "saxes";

/** Directories whose .svg files are served as files, and so parsed strictly. */
const SVG_ROOTS = ["app", "public"];

/** Every .svg under the served roots, walked in full — an icon can sit in any
 *  route segment (`app/blog/icon.svg`), not only at the top. */
function servedSvgs(dir) {
  let out = [];
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // no such root here — public/ is optional
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(servedSvgs(p));
    else if (e.isFile() && e.name.endsWith(".svg")) out.push(p);
  }
  return out;
}

/** The parse error for a file, as `line:col: message`, or null when it is
 *  well-formed. saxes is a well-formedness parser, not a lenient one: it
 *  rejects `--` in a comment, which is the case this exists for and which
 *  some validators wave through. */
function svgError(file) {
  let error = null;
  const parser = new SaxesParser();
  parser.on("error", (err) => {
    error ??= err.message;
  });
  parser.write(readFileSync(file, "utf8")).close();
  return error;
}

const broken = SVG_ROOTS.flatMap(servedSvgs)
  .map((file) => [file, svgError(file)])
  .filter(([, err]) => err !== null);
if (broken.length > 0) {
  console.error(
    `verify: FAILED — ${broken.length} served SVG${broken.length === 1 ? "" : "s"} not well-formed XML (a browser reads image/svg+xml strictly, so the file is undecodable):`,
  );
  for (const [file, err] of broken) console.error(`  · ${file} — ${err}`);
  console.error("\nFix the markup before building; a `--` inside a comment is the usual cause.");
  process.exit(1);
}

const ALARM = "DRIFT [system-surface]";

const child = spawn("next", ["build", "--webpack"], {
  env: { ...process.env, NEXT_DIST_DIR: ".next-verify" },
  stdio: ["inherit", "pipe", "pipe"],
  shell: process.platform === "win32",
});

const alarms = [];
/** Tee the build's output through untouched, keeping the alarm lines. */
const watch = (stream, out) => {
  let buf = "";
  stream.on("data", (chunk) => {
    out.write(chunk);
    buf += chunk;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const i = line.indexOf(ALARM);
      if (i !== -1) alarms.push(line.slice(i + ALARM.length).trim());
    }
  });
};
watch(child.stdout, process.stdout);
watch(child.stderr, process.stderr);

child.on("exit", (code, signal) => {
  if (code !== 0 || signal) {
    process.exit(code ?? 1);
  }
  if (alarms.length === 0) {
    console.log("\nverify: build clean, no drift alarms on your record.");
    process.exit(0);
  }
  // Deduped: every /system page evaluates the invariants, so one drifted doc
  // prints once per page. The record has one defect, not thirty.
  const unique = [...new Set(alarms)];
  console.error(
    `\nverify: FAILED — ${unique.length} drift alarm${unique.length === 1 ? "" : "s"} on your record:`,
  );
  for (const a of unique) console.error(`  · ${a}`);
  console.error("\nFix the doc, or change spec + parser deliberately — never one without the other.");
  process.exit(1);
});
