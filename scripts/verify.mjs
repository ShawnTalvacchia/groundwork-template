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
 */

import { spawn } from "node:child_process";

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
