import fs from "node:fs";
import path from "node:path";

// Reads the project's own docs/ tree at build time. The /system pages render
// exclusively from what these parsers return — derived, never authored
// (see docs/implementation/system-surface.md). Every parser here adapts to
// the docs' existing formats (§N sections, P##/V# tables, FC items); the
// formats never bend to the parsers.

// Which doc tree to render. Defaults to this project's own `docs/`. Set
// DOCS_ROOT to point a deployment at a different tree — the mechanism behind
// "two deployments of one repo" (implementation/shipping.md → Where the record
// lives), where a public deploy and a private one render different records
// from the same codebase. Relative paths resolve from the project root.
//
// Written as an explicit ternary on purpose. The inline form
// `path.resolve(cwd, process.env.DOCS_ROOT || "docs")` builds fine but poisons
// Next's build trace: unable to resolve the env var statically, the tracer
// emits a bogus dependency that lands on `.next/lock`, and deploy platforms
// that stat every traced file fail with ENOENT after a successful build. The
// ternary keeps the default branch statically resolvable.
const DOCS_DIR = process.env.DOCS_ROOT
  ? path.resolve(process.cwd(), process.env.DOCS_ROOT)
  : path.join(process.cwd(), "docs");

/* ── Tiers ─────────────────────────────────────────────────────────── */

export type Tier = "bedrock" | "commitments" | "working";

/* Least guarded first. A fourth tier, `surface`, held derived pages until
   2026-08-30: they are not docs, never enter the registry, and are not guarded
   but regenerated, so no doc could ever sit there. Derived-never-authored is
   carried by the glossary's "The law" and the spec, which is where it acts. */
export const TIER_ORDER: Tier[] = ["working", "commitments", "bedrock"];

/** Short labels for tier badges. Everything else about a tier — what lives
 *  there, what it takes to change, when to re-check it, and its stale threshold — is
 *  parsed from CONTRIBUTING (see getTiers). */
export const TIER_META: Record<Tier, { label: string }> = {
  bedrock: { label: "Bedrock" },
  commitments: { label: "Commitments" },
  working: { label: "Working" },
};

/* ── Shared helpers ────────────────────────────────────────────────── */

interface Frontmatter {
  [key: string]: string;
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  if (!raw.startsWith("---")) return { fm: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: raw };
  const fm: Frontmatter = {};
  for (const line of raw.slice(3, end).split("\n")) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return { fm, body: raw.slice(end + 4) };
}

function firstHeading(body: string): string | null {
  const m = body.match(/^# (.+)$/m);
  return m ? m[1].trim() : null;
}

/** Strips inline markdown for plain-text list surfaces. */
/** GitHub-flavored heading id, so `#fragment` links into a rendered doc
 *  resolve. One home: the doc renderer stamps ids with it and the inspector
 *  builds deep links with it, and a mismatch between the two fails silently
 *  by dropping the reader at the top of the page. Backticks need no special
 *  handling — the character filter strips them, and they never sit beside a
 *  space in a way that would collapse into a double hyphen. */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function stripMd(s: string): string {
  return s
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function readDoc(relPath: string): { fm: Frontmatter; body: string } | null {
  const p = path.join(DOCS_DIR, relPath);
  if (!fs.existsSync(p)) return null;
  const { fm, body } = parseFrontmatter(fs.readFileSync(p, "utf-8"));
  // Parser markers (<!-- PARSED by … -->) and any other HTML comments are
  // editor-facing only — strip before parsing so they can't become a lede,
  // a field value, or a list item. (Rendering already hides them: the doc
  // and board renderers pass skipHtml.)
  return { fm, body: body.replace(/<!--[\s\S]*?-->/g, "") };
}

export function daysSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const then = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.floor((Date.now() - then.getTime()) / 86_400_000);
}

/* ── The doc registry (everything live under docs/, plus the briefing) ─ */

/** The **briefing**: a project's root-level instruction file, read at the
 *  start of every session — that reading IS the session-start ritual. It sits
 *  one level above `docs/`, so it is resolved from the docs root rather than
 *  from the working directory, and follows DOCS_ROOT with the rest of the tree.
 *
 *  It is named here once because four places need to know it: the registry
 *  (below), the doc reader (`getDocByPath`), the dangling-reference scan
 *  (`getStateReferences`), and the pages that label where a doc lives. */
export const BRIEFING_FILE = "CLAUDE.md";

/** A doc's path as it exists in the repo — what a reader would open. Registry
 *  paths are relative to `docs/`; the briefing is the one that is not. */
export function docSourcePath(relPath: string): string {
  return relPath === BRIEFING_FILE ? BRIEFING_FILE : `docs/${relPath}`;
}

export interface SystemDoc {
  title: string;
  relPath: string; // e.g. "strategy/Product Vision.md"
  dir: string; // top-level bucket, e.g. "strategy", "features", "" for root
  status: string | null;
  tier: Tier | null;
  /* No `category` here. Every doc family declares one and no surface has ever
     read it, so it was a parsed field answering to no call site. The field
     stays in the docs and in the molds: it is an optional family field, and a
     mold may offer a key for a reader's benefit with no parser behind it. */
  lastReviewed: string | null;
  readWhen: string | null;
  featureStatus: string | null;
  featureKind: string | null; // product | demo
  area: string | null; // domain area — the project's own vocabulary (see getFeatureAreas)
  summary: string | null; // one-line thesis from frontmatter
  routes: string[];
  /** Days past its tier's staleness heuristic; null when fresh or exempt. */
  staleDays: number | null;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "archive") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    // README.md files are folder guides (navigation scaffolding), not parsed
    // registry docs — skip them so they don't need doc frontmatter.
    else if (entry.name.endsWith(".md") && !entry.name.startsWith("_") && entry.name !== "README.md")
      out.push(full);
  }
  return out;
}

function toSystemDoc(
  relPath: string,
  fm: Frontmatter,
  body: string,
  limits: Partial<Record<Tier, number | null>>,
): SystemDoc {
  const tier = (["bedrock", "commitments", "working"].includes(fm.tier ?? "")
    ? fm.tier
    : null) as Tier | null;
  const lastReviewed = fm["last-reviewed"] ?? null;
  const limit = tier ? limits[tier] ?? null : null;
  const age = daysSince(lastReviewed);
  const staleDays = limit !== null && age !== null && age > limit ? age - limit : null;
  return {
    title: stripMd(firstHeading(body) ?? path.basename(relPath, ".md")),
    relPath,
    dir: relPath.includes(path.sep) ? relPath.split(path.sep)[0] : "",
    status: fm.status ?? null,
    tier,
    lastReviewed,
    readWhen: fm["read-when"] ?? null,
    featureStatus: fm["feature-status"] ?? null,
    featureKind: fm["feature-kind"] ?? null,
    area: fm.area ?? null,
    summary: fm.summary ?? null,
    routes: fm.routes ? fm.routes.split(",").map((r) => r.trim()) : [],
    staleDays,
  };
}

/** Every live doc the project holds: the `docs/` tree, plus the **briefing**
 *  at the project root.
 *
 *  The briefing was reachable but never offered — `/system/docs/CLAUDE.md`
 *  rendered, and no listing anywhere linked it, so the file every session reads
 *  first was the one the record never showed. It is a doc by every rule the
 *  others obey (frontmatter, a tier, the canon diff names it), so it belongs in
 *  the registry rather than in a card of its own. A project with no briefing
 *  simply has one fewer doc. */
export function getAllDocs(): SystemDoc[] {
  const limits = staleLimits();
  const briefing = path.join(path.dirname(DOCS_DIR), BRIEFING_FILE);
  const read = (full: string, relPath: string) => {
    const { fm, body } = parseFrontmatter(fs.readFileSync(full, "utf-8"));
    return toSystemDoc(relPath, fm, body, limits);
  };
  const docs = walk(DOCS_DIR).map((full) => read(full, path.relative(DOCS_DIR, full)));
  if (fs.existsSync(briefing)) docs.push(read(briefing, BRIEFING_FILE));
  return docs.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

/* ── The project's own domain vocabulary ──────────────────────────────
   The Features page groups by AREA, and the areas are YOUR words: `area:
   care` in a plant-care app, `area: billing` in a billing one. Both the
   SET and the LABELS derive from your feature docs, so the page speaks
   whatever language your docs do and you change it by editing frontmatter
   — never this file.

   This exists because it once did not. The set used to be a hardcoded
   array carried over from one product's own thesis, so every project built
   from this template inherited someone else's vocabulary as the fixed
   shape of its registry, and any feature whose area was not on that list
   rendered NOWHERE — no bucket, no empty state, no signal, while the
   header count still counted it. Derived-never-authored is the law the
   whole surface claims; this was the one page exempt from it.

   Areas sort alphabetically ON PURPOSE. Any other order (declaration,
   count, a doc-declared sequence) is a claim about the product's shape,
   and asserting a shape is exactly what went wrong here. Alphabetical
   asserts nothing. */

export interface FeatureArea {
  /** The frontmatter value, verbatim — the join key. */
  key: string;
  /** Display form: "front-door" → "Front Door". */
  label: string;
  count: number;
}

/** Title-cases an area key for display. Hyphens and underscores are word
 *  breaks; everything else is left alone, since the value is your word and
 *  we are formatting it, not correcting it. */
export function areaLabel(key: string): string {
  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** The areas your feature docs actually declare, alphabetical. Demo-layer
 *  docs are excluded: they describe the prototype's own affordances, not
 *  the product's areas. */
export function getFeatureAreas(): FeatureArea[] {
  const counts = new Map<string, number>();
  for (const d of getAllDocs()) {
    if (d.dir !== "features" || d.featureKind === "demo" || !d.area) continue;
    counts.set(d.area, (counts.get(d.area) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: areaLabel(key), count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Every path the doc reader can render — the `.md` tree under docs/ including
 *  the archive, plus the briefing at the project root when the project has one.
 *  Used to prerender the doc detail pages so no fs read happens at request
 *  time, which is why an absent briefing must drop out here rather than being
 *  appended unconditionally by the page. */
export function getAllDocPaths(): string[] {
  const out: string[] = [];
  const walkAll = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkAll(full);
      else if (entry.name.endsWith(".md")) out.push(path.relative(DOCS_DIR, full));
    }
  };
  walkAll(DOCS_DIR);
  if (fs.existsSync(path.join(path.dirname(DOCS_DIR), BRIEFING_FILE))) out.push(BRIEFING_FILE);
  return out;
}

/* ── The molds (the `_`-prefixed templates) ───────────────────────────
   A mold is only ever met as a file you are already filling in, so a field
   the mold does not list is invisible by construction: `priority` was parsed
   here, rendered as a pill on the roadmap card and named in the seed mold's
   own parser comment, while the mold's frontmatter block never offered it.
   Only the people who read the parser ever set it.

   The molds were unreachable too. `walk` (the registry) skips `_`-prefixed
   files, so no index listed them; the doc reader rendered them at a URL
   nothing linked. This is the exact inverse of that skip — a mold IS what
   the registry leaves out — so the set DERIVES rather than being enumerated,
   and a project that adds a mold gets it rendered without touching this file.

   A mount with no molds is legitimate (an example project has none), so the
   page says that out loud rather than rendering a void. */

/** A labelled value read off a doc: a frontmatter `key: value` pair, or a
 *  body line led by a bold `**Label:**`. One type for both because the reader
 *  meets them the same way — a name and what sits after it — and three
 *  surfaces now render them: a mold's two field lists and the doc reader's
 *  frontmatter block. On a real doc the value is a value; on a mold it is the
 *  placeholder the mold offers. */
export interface DocField {
  key: string;
  value: string;
}

export interface MoldSection {
  heading: string;
  /** Bold labels of the inset cards under this heading — a mold's explainer
   *  blockquotes (CONTRIBUTING.md → "A mold explains itself in one card"). */
  cards: string[];
}

export interface Mold {
  relPath: string; // "phases/_system-template.md"
  name: string; // the h1, scaffolding and all — it is what the mold offers
  /** From `mode:`. Null where the field names no single mode: the walkthrough
   *  mold has none, and the seed mold offers the whole set to choose from. */
  mode: BoardMode | null;
  /** The frontmatter block, in the mold's own declaration order. */
  fields: DocField[];
  /** The bold-led lines between the h1 and the first `##` — the fields the
   *  filled-in doc wears on its face (`Mode:` `Project:` `Exports:` `Goal:`
   *  `Levels:` …). The frontmatter list alone was half the answer: those
   *  lines are most of what a board author fills in, and they are where an
   *  adopter's molds differ from ours, so a card without them rendered two
   *  mounts identically while their molds genuinely differed. Empty for the
   *  seed and walkthrough molds, which carry no such lines. */
  bodyFields: DocField[];
  /** Cards above the first `##` — the mold's own opening explainer. */
  cards: string[];
  sections: MoldSection[];
}

/** Every `**Label:** value` in a region, in order.
 *
 *  A line may carry more than one — the system and side molds put `Project`
 *  and `Exports` on one line separated by `·` — so each field's value runs to
 *  the start of the next label rather than to the end of the line, and the
 *  separator left dangling is trimmed. */
function boldFields(region: string): DocField[] {
  const out: DocField[] = [];
  for (const line of region.split("\n")) {
    if (!line.startsWith("**")) continue;
    const re = /\*\*([^*]+?):\*\*/g;
    const hits: { key: string; at: number; after: number }[] = [];
    let m;
    while ((m = re.exec(line))) hits.push({ key: m[1].trim(), at: m.index, after: re.lastIndex });
    hits.forEach((hit, i) => {
      const end = i + 1 < hits.length ? hits[i + 1].at : line.length;
      out.push({ key: hit.key, value: line.slice(hit.after, end).replace(/\s*·\s*$/, "").trim() });
    });
  }
  return out;
}

/** The bold label leading each blockquote in a region. A mold's explainer is
 *  one blockquote led by a bold label, so the label is the card's name; a
 *  blockquote without one is prose in a quote and is not a card. */
function insetCardLabels(region: string): string[] {
  const out: string[] = [];
  let inQuote = false;
  for (const line of region.split("\n")) {
    if (line.startsWith(">")) {
      if (!inQuote) {
        const m = line.match(/^>\s*\*\*(.+?)\*\*/);
        if (m) out.push(m[1].trim());
      }
      inQuote = true;
      // A blank line inside a blockquote is written as a bare ">", so only a
      // genuinely empty line closes the block.
    } else inQuote = false;
  }
  return out;
}

/** Every mold the mount holds: the `_`-prefixed `.md` files under its docs
 *  tree, whatever folder they sit in. Alphabetical by path ON PURPOSE — any
 *  other order (mode order, a declared sequence) is a claim about which mold
 *  matters most, and the molds are the project's own, not this file's. */
export function getMolds(): Mold[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files: string[] = [];
  const walkMolds = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "archive") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkMolds(full);
      else if (entry.name.startsWith("_") && entry.name.endsWith(".md")) files.push(full);
    }
  };
  walkMolds(DOCS_DIR);

  const molds: Mold[] = [];
  for (const full of files.sort()) {
    const relPath = path.relative(DOCS_DIR, full);
    const parsed = readDoc(relPath);
    if (!parsed) continue;
    // Object keys keep insertion order, so this is the mold's own order —
    // which is part of what it offers, not an accident of parsing.
    const fields = Object.entries(parsed.fm).map(([key, value]) => ({ key, value }));
    // `## ` split: [lede, heading, region, heading, region, …].
    const parts = parsed.body.split(/^## (.+)$/m);
    const sections: MoldSection[] = [];
    for (let i = 1; i < parts.length; i += 2) {
      sections.push({ heading: parts[i].trim(), cards: insetCardLabels(parts[i + 1] ?? "") });
    }
    const rawMode = parsed.fm.mode;
    molds.push({
      relPath,
      name: stripMd(firstHeading(parsed.body) ?? path.basename(relPath, ".md")),
      mode:
        rawMode === "product" || rawMode === "system" || rawMode === "side" || rawMode === "queue-shaping"
          ? rawMode
          : null,
      fields,
      bodyFields: boldFields(parts[0] ?? ""),
      cards: insetCardLabels(parts[0] ?? ""),
      sections,
    });
  }
  return molds;
}

/* ── The system, parsed from CONTRIBUTING.md ──────────────────────────
   Method renders these — the rules ARE the page, not a link to a wall of
   text. Derived, never authored: change CONTRIBUTING, the page follows. */

/** The system's terms, parsed from CONTRIBUTING.md § Glossary. */
export interface GlossaryTerm {
  term: string;
  def: string;
}

export function getGlossary(): GlossaryTerm[] {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return [];
  const section = sectionOf(parsed.body, "Glossary");
  const terms: GlossaryTerm[] = [];
  const re = /^- \*\*(.+?)\*\* — (.+)$/gm;
  let m;
  while ((m = re.exec(section))) terms.push({ term: m[1], def: stripMd(m[2]) });
  return terms;
}

/** One glossary term's definition, first sentence only.
 *
 *  The canon's own one-line answer to "what is this?", for a surface that has
 *  to say it somewhere other than the glossary page. Derivation, not chrome:
 *  the board page's walkthrough callout renders this rather than an authored
 *  restatement of the same rule, so a canon that changes changes the card.
 *  Null when the term is absent — your glossary is yours, and a caller that can
 *  render without the line should. */
export function glossaryLede(term: string): string | null {
  const found = getGlossary().find((t) => t.term === term);
  if (!found) return null;
  // The definitions are single-clause sentences with no abbreviations; the
  // first `. ` is the sentence end, and a one-sentence definition has none.
  const i = found.def.indexOf(". ");
  const s = (i === -1 ? found.def : found.def.slice(0, i + 1)).trim();
  if (!s) return null;
  // A glossary definition continues its own term ("Walkthrough — a
  // collaborative review doc…"), so it starts lowercase by convention. Lifted
  // out of the list and set under a heading it is a sentence, and a lowercase
  // first letter there reads as a typo. Casing one letter is formatting a
  // value the doc supplied, the same move `areaLabel` makes on a doc's own
  // area word — not the page supplying a word of its own.
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface WorkMode {
  key: BoardMode;
  label: string; // "The product phase"
  tagline: string; // "builds the thing"
  purpose: string; // markdown kept — render with MdInline
  /** The mode's orient set, in one line: what a phase of this mode reads
   *  before it edits anything. § The parts names the orient set as a property
   *  every mode fixes, and the mode sections stated it nowhere until this
   *  field existed — it lived inside opening-ritual step 2, in the rituals'
   *  register. */
  reads: string;
  /** The three touch bands — they gate pens, not eyes (reading is never gated). */
  homeGround: string; // edit freely, per the board
  careful: string; // update deliberately when the work bears on it
  gated: string; // another mode's ground — suggest, don't edit
  open: RitualStep[];
  during: string;
  close: RitualStep[];
}

/** One numbered ritual step, with the actor the canon's own register encodes.
 *
 *  The convention: a step is written imperative to the session running it,
 *  and a step that reaches for a human names them. So "who acts" is already
 *  in the prose — `withPO` reads it rather than asking the canon for new
 *  syntax. The term is `the PO`, which the glossary names and the ritual
 *  steps use throughout; a step that names no human is the session acting
 *  alone, which is the common case and stays unmarked. */
export interface RitualStep {
  text: string; // markdown kept — render with MdInline
  /** The step stops for the PO rather than running unattended. */
  withPO: boolean;
}

/** One of § The parts → Trigger's `name (what it fires)` items — the join
 *  between a moment and the ritual bound to it. The canon writes all six in
 *  that one form, so the join derives; a trigger written without its
 *  parenthetical simply carries an empty `fires`. */
export interface WorkTrigger {
  name: string;
  fires: string; // markdown kept
}

/** One `#### <Part>` block under `### The parts` — the concept layer that
 *  presents the model as adjustable: what a part is and what defines it.
 *  How to change things lives in `### Adjustments`, deliberately apart —
 *  per-part "change it" blocks read as prescription. */
export interface WorkPart {
  name: string; // "Trigger"
  is: string;
  properties: string;
}

/** One row of the `### Session starters` table — the model's front door:
 *  what you're arriving with → the shape that fits → what to say. */
export interface SessionStarter {
  arriving: string;
  shape: string; // a mode, a kind within one, or "Not a phase yet"
  mode: string;
  prompt: string; // literally how you'd open the chat
  openBy: string; // classification + what happens
}

/** One `### Adjustments` bullet: the moment you'd want a change → what to do. */
export interface Adjustment {
  when: string;
  what: string;
}

export interface WorkModel {
  lede: string;
  /** How many `### The <name> phase — tagline` headings the section carries,
   *  whatever their names. A mount's docs declare their own mode count, so the
   *  invariant is not a fixed number — it is that every heading present made
   *  it into `modes`, which is what `lib/derivation.ts` checks. */
  modeHeadings: number;
  /** The phase arc's step names, parsed from the lede's own "its arc is
   *  A → B → C" sentence. Empty when the lede states no arc — the method
   *  page then skips the role strip's tags rather than authoring them. */
  arc: string[];
  sharedRules: string[];
  modes: WorkMode[];
  /** Lede paragraph of `### Session starters`. */
  startersLede: string;
  starters: SessionStarter[];
  /** Lede paragraph of `### The parts`. */
  partsLede: string;
  parts: WorkPart[];
  /** Lede paragraph of `### Adjustments`. */
  adjustmentsLede: string;
  adjustments: Adjustment[];
  /** The six moments rituals fire at, parsed from § The parts → Trigger's
   *  own sentence. Empty when that part states none — the method page then
   *  renders its rituals untagged rather than authoring a trigger name. */
  triggers: WorkTrigger[];
}

/** Numbered list items directly under a `**Label:**` heading line. */
/** A purpose clause — "so the PO can spot overlap before spawning" — names
 *  the PO without reaching for them: it says why the step is worth doing, and
 *  the session still runs it alone. Stripped before the match, because naming
 *  and reaching are what the register rule distinguishes and a bare
 *  name-anywhere test conflates them. The clause runs to the next sentence or
 *  clause boundary; a step that reaches for the PO *and* explains why keeps
 *  its mark, since only the trailing clause goes. */
const PO_PURPOSE_CLAUSE = /\bso (?:that )?the PO\b[^.;:]*/g;

/** The canon's own register, read back out: a ritual step that *reaches for*
 *  the PO is marked; one that names no human is imperative to the session
 *  running it. One term, because the ritual steps use one — the glossary's
 *  `PO`. Widening this to a second word for the same person would re-open the
 *  alternation the canon closed. */
function stepReachesForPO(text: string): boolean {
  return /\bthe PO\b/.test(text.replace(PO_PURPOSE_CLAUSE, ""));
}

/** Numbered list items directly under a `**Label:**` heading line, each
 *  carrying the actor its own wording encodes. */
function numberedUnder(body: string, label: string): RitualStep[] {
  const start = body.search(new RegExp(`^\\*\\*${label}:\\*\\*\\s*$`, "m"));
  if (start === -1) return [];
  const rest = body.slice(start);
  const block = rest.slice(rest.indexOf("\n") + 1).split(/\n\n(?=\*\*)/)[0];
  return (block.match(/^\d+\.\s+.*$/gm) ?? []).map((l) => {
    const text = l.replace(/^\d+\.\s+/, "").trim();
    return { text, withPO: stepReachesForPO(text) };
  });
}

/** § The parts → Trigger's `Is:` sentence: the six moments, each with the
 *  ritual it fires. The list is whatever follows the sentence's colon, split
 *  on the same `·` the canon uses for every other inline set in this section. */
function parseTriggers(is: string): WorkTrigger[] {
  const list = is.slice(is.indexOf(":") + 1);
  if (!is.includes(":")) return [];
  return list
    .split("·")
    .map((t) => t.trim().replace(/\.$/, "").trim())
    .filter(Boolean)
    .map((t) => {
      const m = t.match(/^(.+?)\s*\(([\s\S]+)\)$/);
      return m ? { name: m[1].trim(), fires: m[2].trim() } : { name: t, fires: "" };
    });
}

export function getWorkModel(): WorkModel {
  const parsed = readDoc("CONTRIBUTING.md");
  const empty: WorkModel = {
    lede: "", modeHeadings: 0, arc: [], sharedRules: [], modes: [],
    startersLede: "", starters: [], partsLede: "", parts: [],
    adjustmentsLede: "", adjustments: [], triggers: [],
  };
  if (!parsed) return empty;
  // Matched by prefix, not the full title: the H2 states the mode count in its
  // own words ("…runs in one of four modes"), and that count is the doc's
  // claim, not the parser's key — a project may declare three or four.
  const wmHeading = /^## The Work Model\b.*$/m.exec(parsed.body);
  const afterHeading = wmHeading ? parsed.body.slice(wmHeading.index + wmHeading[0].length) : "";
  const nextH2 = afterHeading.search(/^## /m);
  const section = nextH2 === -1 ? afterHeading : afterHeading.slice(0, nextH2);
  const lede = section.trim().split("\n\n")[0] ?? "";
  const arc = (stripMd(lede).match(/arc is ([^.]+)/)?.[1] ?? "")
    .split("→").map((s) => s.trim()).filter(Boolean);
  const sharedBlock = section.split(/\*\*Rules shared by all modes:\*\*/)[1]?.split(/^### /m)[0] ?? "";
  const sharedRules = (sharedBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());

  const modes: WorkMode[] = [];
  let modeHeadings = 0;
  let startersLede = "";
  const starters: SessionStarter[] = [];
  let partsLede = "";
  const parts: WorkPart[] = [];
  let adjustmentsLede = "";
  const adjustments: Adjustment[] = [];
  for (const block of section.split(/^### /m).slice(1)) {
    const header = block.slice(0, block.indexOf("\n"));
    const body = block.slice(block.indexOf("\n") + 1);

    // The modes are named, not numbered: exactly these four headings.
    // Adding a mode means widening this match — a cost § Adjustments
    // states to adopters outright. `modeHeadings` counts every heading in the
    // mode shape whatever its name, so derivation can tell a renamed mode
    // (counted, unparsed → alarm) from a mount that declares fewer modes.
    if (/^The [\w-]+ phase — .+$/.test(header)) modeHeadings++;
    const hm = header.match(/^The (product|system|side|queue-shaping) phase — (.+)$/);
    if (hm) {
      modes.push({
        key: hm[1] as BoardMode,
        label: `The ${hm[1]} phase`,
        tagline: hm[2].trim(),
        purpose: boldField(body, "Purpose"),
        reads: boldField(body, "Reads first"),
        homeGround: boldField(body, "Home ground"),
        careful: boldField(body, "Careful"),
        gated: boldField(body, "Gated"),
        open: numberedUnder(body, "Opening ritual"),
        during: boldField(body, "During"),
        close: numberedUnder(body, "Closing ritual"),
      });
      continue;
    }

    // `### Session starters` — the front door: arrival → shape → what to say.
    if (header.startsWith("Session starters")) {
      startersLede = body.trim().split("\n\n")[0] ?? "";
      for (const row of body.match(/^\|.*\|$/gm) ?? []) {
        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.length < 5 || /^-+$/.test(cells[0]) || cells[0] === "You're arriving with") continue;
        starters.push({ arriving: cells[0], shape: cells[1], mode: cells[2], prompt: cells[3], openBy: cells[4] });
      }
      continue;
    }

    // `### The parts` — the concept layer: `#### <Part>` blocks with
    // Is / Properties fields.
    if (header.startsWith("The parts")) {
      partsLede = body.trim().split("\n\n")[0] ?? "";
      for (const pb of body.split(/^#### /m).slice(1)) {
        const name = pb.slice(0, pb.indexOf("\n")).trim();
        const pbody = pb.slice(pb.indexOf("\n") + 1);
        parts.push({
          name,
          is: boldField(pbody, "Is"),
          properties: boldField(pbody, "Properties"),
        });
      }
      continue;
    }

    // `### Adjustments` — `- **the moment you'd want it** → what to do`.
    if (header.startsWith("Adjustments")) {
      adjustmentsLede = body.trim().split("\n\n")[0] ?? "";
      const re = /^- \*\*(.+?)\*\* → (.+)$/gm;
      let m;
      while ((m = re.exec(body))) adjustments.push({ when: m[1].trim(), what: m[2].trim() });
    }
  }
  // The trigger list rides inside § The parts' own Trigger card rather than a
  // section of its own: the canon states the six there, and a second home for
  // them would be two descriptions of one thing, drifting apart by
  // construction. A canon that renames or drops that part parses to no
  // triggers, and the method page renders its rituals untagged.
  const triggerPart = parts.find((p) => p.name.toLowerCase() === "trigger");
  const triggers = triggerPart ? parseTriggers(triggerPart.is) : [];
  return {
    lede, modeHeadings, arc, sharedRules, modes, startersLede, starters,
    partsLede, parts, adjustmentsLede, adjustments, triggers,
  };
}

/** One role bullet of § The phase pipeline: `- **The planner** (runs high) …`.
 *  The names are the project's own words — a project may rename or reshape
 *  the roles, so nothing here asserts which roles exist. */
export interface PipelineRole {
  name: string;
  level: string; // the parenthetical: the level the role's chat runs at
  text: string; // markdown kept — render with MdInline
}

export interface PhasePipeline {
  lede: string; // markdown kept
  /** The section's own `**Read when:**` line — the condition under which any
   *  of this applies. It was parsed away as noise until the method page had a
   *  place to put it: the role layer is the split phase's, and a page that
   *  renders it unconditionally tells a collapsed phase it has three chats.
   *  Empty when the section states no trigger. */
  readWhen: string;
  roles: PipelineRole[];
  /** The trailing bold-led paragraphs — the pipeline's standing rules. */
  rules: { title: string; text: string }[];
}

/** Like sectionOf, but matches the `## ` heading by prefix, so a project's
 *  tagline after the section name can vary without orphaning the parse. */
function sectionByPrefix(body: string, prefix: string): string | null {
  const re = new RegExp(`^## ${prefix}\\b.*$`, "m");
  const m = re.exec(body);
  if (!m) return null;
  const rest = body.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

/** § The phase pipeline — how one phase runs across chats. Absence is
 *  legitimate: a project that reshapes the model may delete the section,
 *  and the method page then renders no role cards. The section's
 *  `**Read when:**` line is a trigger for readers, never a lede. */
export function getPhasePipeline(): PhasePipeline | null {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return null;
  const section = sectionByPrefix(parsed.body, "The phase pipeline");
  if (section === null) return null;
  const lede = ledeOf(section);
  const readWhen = section.match(/^\*\*Read when:\*\*\s*([\s\S]+?)$/m)?.[1].trim() ?? "";
  const roles: PipelineRole[] = [];
  const roleRe = /^- \*\*(.+?)\*\*\s*\(([^)]+)\)\s*(.+)$/gm;
  let m;
  while ((m = roleRe.exec(section))) {
    roles.push({ name: m[1].trim(), level: m[2].trim(), text: m[3].trim() });
  }
  const rules: { title: string; text: string }[] = [];
  for (const para of section.split("\n\n")) {
    const p = para.trim();
    if (!p || p.startsWith("- ") || /^\*\*Read when:\*\*/.test(p) || p === lede) continue;
    const rm = p.match(/^\*\*(.+?)\*\*\s*([\s\S]+)$/);
    if (rm) rules.push({ title: rm[1].trim().replace(/[.:]$/, ""), text: rm[2].trim() });
  }
  return { lede, readWhen, roles, rules };
}

export interface TrackerRow {
  name: string;
  holds: string;
  unit: string;
  exit: string;
}

export interface TrackerModel {
  lede: string;
  trackers: TrackerRow[];
  flow: string[];
  sharedRule: string;
}

/** CONTRIBUTING § The Planning Trackers — the table + the flow bullets. */
export function getTrackerModel(): TrackerModel {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return { lede: "", trackers: [], flow: [], sharedRule: "" };
  const section = sectionOf(parsed.body, "The Planning Trackers");
  const lede = ledeOf(section);
  const trackers: TrackerRow[] = [];
  const re = /^\| `?([\w .&'-]+?)\.md`? \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(section))) {
    trackers.push({ name: m[1].trim(), holds: m[2].trim(), unit: m[3].trim(), exit: m[4].trim() });
  }
  const flowBlock = section.split(/\*\*How work flows[^*]*\*\*/)[1]?.split(/\*\*Shared rule/)[0] ?? "";
  const flow = (flowBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());
  const sharedRule = section.match(/\*\*Shared rule — prune on resolve\.\*\*\s*([\s\S]*?)(?=\n\n|$)/)?.[1].trim() ?? "";
  return { lede, trackers, flow, sharedRule };
}

export interface TierRow {
  key: Tier;
  label: string;
  lives: string; // markdown kept
  toChange: string;
  recheck: string;
  staleAfterDays: number | null;
}

/** CONTRIBUTING § Doc Tiers & Review Physics — the tier table, in the order
 *  the table lists them (most-guarded first). The `Stale after` cell is the
 *  one number staleness computes from: the doc IS the threshold, so a table
 *  edit moves the flags in the same commit. */
export function getTiers(): TierRow[] {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return [];
  const section = sectionOf(parsed.body, "Doc Tiers & Review Physics");
  const rows: TierRow[] = [];
  const re = /^\| \*\*(\w+)\*\* \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(section))) {
    const key = m[1] as Tier;
    if (!TIER_ORDER.includes(key)) continue; // skips the header + divider rows
    rows.push({
      key,
      label: TIER_META[key].label,
      lives: m[2].trim(),
      toChange: m[3].trim(),
      recheck: m[4].trim(),
      staleAfterDays: Number(m[5].match(/(\d+)\s*days?/)?.[1]) || null,
    });
  }
  return rows;
}

/** Stale thresholds by tier, from the same table the Tiers page renders. */
function staleLimits(): Partial<Record<Tier, number | null>> {
  return Object.fromEntries(getTiers().map((t) => [t.key, t.staleAfterDays]));
}

export interface TierPhysics {
  readIsNotReview: string;
  stamping: string;
  noBedrockClock: string;
  sinking: string;
  challenge: string;
  antiStuck: string;
}

/** CONTRIBUTING § Doc Tiers & Review Physics — the prose beside the table. */
export function getTierPhysics(): TierPhysics {
  const empty = { readIsNotReview: "", stamping: "", noBedrockClock: "", sinking: "", challenge: "", antiStuck: "" };
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return empty;
  const section = sectionOf(parsed.body, "Doc Tiers & Review Physics");
  const field = (label: string) =>
    section.match(new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n|$)`))?.[1].trim() ?? "";
  return {
    readIsNotReview: field("Read is not review"),
    stamping: field("Stamping"),
    noBedrockClock: field("No clock on bedrock"),
    sinking: field("Sinking"),
    challenge: field("Structured challenge"),
    antiStuck: section.match(/^Tiers govern.*$/m)?.[0] ?? "",
  };
}

/** Reads any doc under docs/ (archive included) — used by the doc detail page.
 *  CLAUDE.md is the one special case outside docs/ (repo root). */
export function getDocByPath(
  relPath: string,
): { doc: SystemDoc; body: string; frontmatter: DocField[] } | null {
  const isBriefing = relPath === BRIEFING_FILE;
  const full = isBriefing
    ? path.join(path.dirname(DOCS_DIR), BRIEFING_FILE)
    : path.normalize(path.join(DOCS_DIR, relPath));
  if (!isBriefing && (!full.startsWith(DOCS_DIR + path.sep) || !full.endsWith(".md"))) return null;
  if (!fs.existsSync(full)) return null;
  const { fm, body } = parseFrontmatter(fs.readFileSync(full, "utf-8"));
  const rel = isBriefing ? BRIEFING_FILE : path.relative(DOCS_DIR, full);
  // No stale limits: the detail page shows the doc, never a freshness verdict
  // on it — that judgement belongs to the index, which passes the real ones.
  //
  // `frontmatter` is every key the file declares, in file order. `SystemDoc`
  // carries the fixed set the registry needs; the reader shows the block as
  // written, because a key nothing parses is still a key the author wrote and
  // the next author will copy. Object keys preserve insertion order, so this
  // is the file's own order rather than one this file chose.
  return {
    doc: toSystemDoc(rel, fm, body, {}),
    body,
    frontmatter: Object.entries(fm).map(([key, value]) => ({ key, value })),
  };
}

/* ── Open Questions (planning/Open Questions & Assumptions Log.md) ──
   `## N. Topic` sections, each holding `### The question?` entries with
   `**Area:** … **Opened:** … **Priority:** …` / `**Thinking:**` /
   `**Resolves when:**`.

   Everything in the file is open — resolved questions are deleted, not
   marked. So the parser can't miscount: no "Open:" marker to find, no
   Resolved block to accidentally read as open (both of which it did before
   2026-07-17), and no nested bullets to silently drop. */

export interface OpenQuestion {
  question: string;
  area: string | null;
  opened: string | null;
  priority: string | null;
  thinking: string; // markdown kept
  resolvesWhen: string;
}

export interface OpenQuestionTopic {
  num: number;
  title: string;
  assumption: string | null;
  questions: OpenQuestion[];
}

const QUESTIONS_PATH = "planning/Open Questions & Assumptions Log.md";

export function getOpenQuestions(): OpenQuestionTopic[] {
  const parsed = readDoc(QUESTIONS_PATH);
  if (!parsed) return [];
  // Drop the preamble (everything before the first topic's ---).
  const topics: OpenQuestionTopic[] = [];
  for (const section of parsed.body.split(/^## /m).slice(1)) {
    const header = section.slice(0, section.indexOf("\n"));
    const m = header.match(/^(\d+)\.\s+(.*)$/);
    if (!m) continue; // skips "Format" and other non-topic headings
    const body = section.slice(section.indexOf("\n") + 1);
    const assumption = boldField(body, "Assumption");
    const questions: OpenQuestion[] = [];
    for (const q of body.split(/^### /m).slice(1)) {
      const qTitle = q.slice(0, q.indexOf("\n")).trim();
      const qBody = q.slice(q.indexOf("\n") + 1);
      const meta = (label: string) =>
        qBody.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^·\\n]+)`))?.[1].trim() ?? null;
      questions.push({
        question: qTitle,
        area: meta("Area"),
        opened: meta("Opened"),
        priority: meta("Priority"),
        thinking: boldField(qBody, "Thinking"),
        resolvesWhen: boldField(qBody, "Resolves when"),
      });
    }
    topics.push({
      num: Number(m[1]),
      title: m[2].trim(),
      assumption: assumption ? stripMd(assumption) : null,
      questions,
    });
  }
  return topics;
}

/* ── Punch list (planning/punch-list.md) ─────────────────────────────
   A single `| P## | title | description | category | area | refs | added |`
   table. The title is the row's index entry: queue-shaping scans punch titles
   without reading the descriptions, so a row whose title hides its content is
   a hole in that index (CONTRIBUTING.md § Queue-shaping). */

export interface PunchItem {
  id: string;
  title: string; // short label — what the index sees
  description: string; // markdown kept — render with MdInline/stripMd
  category: string;
  area: string;
  refs: string;
  added: string;
}

export function getPunchItems(): PunchItem[] {
  const parsed = readDoc("planning/punch-list.md");
  if (!parsed) return [];
  const items: PunchItem[] = [];
  const re = /^\| (P\d+\w*) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(parsed.body))) {
    items.push({
      id: m[1],
      title: m[2],
      description: m[3],
      category: m[4],
      area: m[5],
      refs: m[6],
      added: m[7],
    });
  }
  return items;
}

/* ── Future considerations (planning/Future Considerations.md) ───────
   `## FCn. Title` sections with bold `**Trigger:** / **Context:** /
   **Effort:** / **Refs:** / **Added:**` fields. */

export interface FutureItem {
  id: string; // "FC17"
  num: number;
  title: string;
  trigger: string;
  context: string; // first paragraph only
  effort: string;
  added: string;
}

function boldField(body: string, label: string): string {
  // `**Label:** text…` to the end of its paragraph — or to the next bold
  // label on a new line, since consecutive fields aren't blank-separated.
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`);
  return body.match(re)?.[1].trim() ?? "";
}

export function getFutureItems(): FutureItem[] {
  const parsed = readDoc("planning/Future Considerations.md");
  if (!parsed) return [];
  const items: FutureItem[] = [];
  const sections = parsed.body.split(/^## /m).slice(1);
  for (const section of sections) {
    const header = section.slice(0, section.indexOf("\n"));
    const m = header.match(/^FC(\d+)\.\s+(.*)$/);
    if (!m) continue;
    const bodyText = section.slice(section.indexOf("\n") + 1);
    items.push({
      id: `FC${m[1]}`,
      num: Number(m[1]),
      title: m[2].trim(),
      trigger: stripMd(boldField(bodyText, "Trigger")),
      context: stripMd(boldField(bodyText, "Context").split("\n\n")[0] ?? ""),
      effort: stripMd(boldField(bodyText, "Effort")),
      added: stripMd(boldField(bodyText, "Added")),
    });
  }
  return items.sort((a, b) => a.num - b.num);
}

/* ── Roadmap (ROADMAP.md) ────────────────────────────────────────────
   Sections: Principles / Where We Are / What's Next (phase table) /
   Key Considerations / On the horizon. */

export interface RoadmapPhase {
  name: string;
  phaseStatus: string; // "queued", "paused — …"
  goal: string; // markdown kept
  refs: string;
}

/** The roadmap sections a surface renders, named by their heading. */
export type RoadmapSection = "whereWeAre" | "queue" | "keyConsiderations" | "horizon";

const ROADMAP_SECTIONS: Array<{ heading: string; key: RoadmapSection }> = [
  { heading: "Where We Are", key: "whereWeAre" },
  { heading: "What's Next", key: "queue" },
  { heading: "Key Considerations", key: "keyConsiderations" },
  { heading: "On the horizon", key: "horizon" },
];

export interface KeyConsideration {
  title: string;
  text: string;
}

export interface Roadmap {
  goal: string;
  /** The `## ` headings this parser knows, in the DOC's order. The page renders
   *  its sections in this order rather than a hardcoded one: section order is a
   *  claim the ROADMAP makes, and a surface that hardcodes it overrides that
   *  claim silently. */
  sectionOrder: RoadmapSection[];
  whereWeAre: string[]; // markdown paragraphs
  phases: RoadmapPhase[];
  validationHorizon: string;
  runningAlongside: string[];
  keyConsiderations: KeyConsideration[];
  /** Bullets the section HAS, parsed or not. The drift invariant compares the
   *  two: bullets written with none parsed means the lenses are authored and
   *  the page shows nothing. */
  keyConsiderationsWritten: number;
  /** ROADMAP § On the horizon. Named for the section, not for any one
   *  project's shape. */
  horizon: string[];
}

/** A section's opening paragraph, skipping the `**Read when:**` trigger line
 *  that marks a lookup section (CONTRIBUTING § Frontmatter maintenance). The
 *  line is content a human reading the doc should see, so it isn't stripped the
 *  way parser markers are — but it is never a section's lede. */
function ledeOf(section: string): string {
  const paras = section.trim().split("\n\n");
  const first = paras[0]?.trim() ?? "";
  return /^\*\*Read when:\*\*/.test(first) ? (paras[1]?.trim() ?? "") : first;
}

function sectionOf(body: string, heading: string): string {
  const re = new RegExp(`^## ${heading}\\s*$`, "m");
  const m = re.exec(body);
  if (!m) return "";
  const rest = body.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

export function getRoadmap(): Roadmap {
  const parsed = readDoc("ROADMAP.md");
  const body = parsed?.body ?? "";
  const goal = body.match(/^\*\*Goal:\*\*\s*(.+)$/m)?.[1] ?? "";

  const where = sectionOf(body, "Where We Are")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("---"));

  const nextSection = sectionOf(body, "What's Next");
  const phases: RoadmapPhase[] = [];
  const rowRe = /^\| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = rowRe.exec(nextSection))) {
    if (m[1].startsWith("Phase") || m[1].startsWith("---") || /^-+$/.test(m[1])) continue;
    const cell = m[1];
    const name = cell.match(/\*\*(.+?)\*\*/)?.[1] ?? stripMd(cell);
    // Status appears as `**Name** — *queued*` or `**Name** *(paused — …)*`.
    const status = cell.match(/—\s*\*([^*]+)\*/)?.[1] ?? cell.match(/\*\(([^)]+)\)\*/)?.[1] ?? "";
    phases.push({ name: stripMd(name), phaseStatus: status.trim(), goal: m[2], refs: stripMd(m[3]) });
  }

  const validationHorizon = nextSection.match(/\*\*The validation horizon\.\*\*\s*([\s\S]*?)(?=\n\n)/)?.[1] ?? "";

  const runningBlock = nextSection.split(/\*\*Running alongside[^*]*\*\*/)[1] ?? "";
  const runningAlongside = (runningBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());

  // `- **Title:** text` bullets, one per lens.
  const considerations: KeyConsideration[] = [];
  const kcBullets = sectionOf(body, "Key Considerations").match(/^- .*$/gm) ?? [];
  for (const line of kcBullets) {
    const cm = line.slice(2).trim().match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
    if (cm) considerations.push({ title: cm[1].replace(/[:.]$/, ""), text: cm[2].trim() });
  }

  const horizon = (sectionOf(body, "On the horizon").match(/^- .*$/gm) ?? []).map((b) =>
    stripMd(b.slice(2))
  );

  const sectionOrder = ROADMAP_SECTIONS.filter((sec) => new RegExp(`^## ${sec.heading}\\s*$`, "m").test(body))
    .map((sec) => ({ sec, at: body.search(new RegExp(`^## ${sec.heading}\\s*$`, "m")) }))
    .sort((a, b) => a.at - b.at)
    .map(({ sec }) => sec.key);

  return {
    goal,
    sectionOrder,
    whereWeAre: where,
    phases,
    validationHorizon,
    runningAlongside,
    keyConsiderations: considerations,
    keyConsiderationsWritten: kcBullets.length,
    horizon,
  };
}

/* ── Seeds (planning/queued/*.md) ────────────────────────────────────
   One seed per queued ROADMAP row, any mode — the accumulation space
   between "queued" and "board opens" (notes and pointers, never tasks).
   The frontmatter + first paragraph feed the roadmap cards; the full seed
   renders through the doc reader. Deleted at phase open. */

export interface QueuedSeed {
  relPath: string; // "planning/queued/performance-speed-pass.md"
  phase: string; // must match the ROADMAP row name exactly
  mode: BoardMode; // badges the roadmap card
  queued: string | null;
  priority: string | null;
  /** `run:` — the run this phase will join, or null. Rows sharing a run
   *  read as one group on the roadmap and the queue shelf. */
  run: string | null;
  noteCount: number;
}

/* No `lede` here on purpose. It existed as the seed's first body paragraph and
   no surface ever rendered it: the roadmap card takes its sentence from the
   ROADMAP row's Goal cell and joins only this frontmatter. A parsed field
   nothing consumes is worse than an absent one — this one nearly forced a
   mold's shape, because the shape was designed around a lede never displayed.
   If a card should ever speak in the seed's own voice, add it back
   deliberately and render it in the same edit. */

export function getQueuedSeeds(): QueuedSeed[] {
  const dir = path.join(DOCS_DIR, "planning", "queued");
  if (!fs.existsSync(dir)) return [];
  const seeds: QueuedSeed[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md") || f.startsWith("_")) continue;
    const parsed = readDoc(path.join("planning", "queued", f));
    if (!parsed) continue;
    const notes = sectionOf(parsed.body, "Notes & finds");
    seeds.push({
      relPath: path.join("planning", "queued", f),
      phase: parsed.fm.phase ?? f.replace(/\.md$/, ""),
      mode: resolveMode(parsed.fm.mode),
      queued: parsed.fm.queued ?? null,
      priority: parsed.fm.priority ?? null,
      run: parsed.fm.run?.trim() || null,
      noteCount: (notes.match(/^- /gm) ?? []).length,
    });
  }
  return seeds;
}

/* ── Cross-references in the state docs (ROADMAP.md + CLAUDE.md) ─────
   The two docs that describe where the project stands today both point at
   tracker items by ID — `P04`, `FC2`, `§1`. Those pointers go stale when the
   item they name is resolved and removed, and a stale one reads as a live
   claim. This collects them so `lib/derivation.ts` can assert each one still
   resolves. Prose only: frontmatter and HTML comments are already stripped by
   readDoc, and tracker docs themselves are not scanned (a tracker naming its
   own IDs is not a claim about current state). */

export type ReferenceKind = "punch" | "future" | "question";

export interface StateReference {
  /** Doc it was found in, as a label: "ROADMAP.md" or "CLAUDE.md". */
  source: string;
  id: string; // "P04", "FC2", "§1"
  kind: ReferenceKind;
}

/** CLAUDE.md lives at the project root, one level above `docs/`. */
function readProjectRootDoc(name: string): string | null {
  const p = path.join(path.dirname(DOCS_DIR), name);
  if (!fs.existsSync(p)) return null;
  const { body } = parseFrontmatter(fs.readFileSync(p, "utf-8"));
  return body.replace(/<!--[\s\S]*?-->/g, "");
}

function collectReferences(source: string, body: string, into: StateReference[]) {
  // `§N` only with the number attached: "§ Doc Tiers" is a section pointer
  // inside a doc, not a tracker ID.
  const re = /\b(P\d+\w*)\b|\b(FC\d+)\b|§(\d+)\b/g;
  const seen = new Set<string>();
  let m;
  while ((m = re.exec(body))) {
    const [id, kind]: [string, ReferenceKind] = m[1]
      ? [m[1], "punch"]
      : m[2]
        ? [m[2], "future"]
        : [`§${m[3]}`, "question"];
    if (seen.has(id)) continue; // one alarm per dangling ID, not per mention
    seen.add(id);
    into.push({ source, id, kind });
  }
}

export function getStateReferences(): StateReference[] {
  const refs: StateReference[] = [];
  const roadmap = readDoc("ROADMAP.md");
  if (roadmap) collectReferences("ROADMAP.md", roadmap.body, refs);
  const claude = readProjectRootDoc(BRIEFING_FILE);
  if (claude) collectReferences("CLAUDE.md", claude, refs);
  return refs;
}

/* ── Decisions log (decisions.md) ────────────────────────────────────
   `## YYYY-MM-DD · Title` entries (date prefix may be a range) with
   `**What:** / **Why:** / **Where:**` fields. */

export interface Decision {
  date: string;
  title: string;
  what: string;
  why: string;
  /** Rejected alternatives, one per bullet. The field exists so they cannot be
   *  dropped by accident: as a clause inside Why they were the first thing cut,
   *  and a re-proposable option that loses its line gets re-proposed in
   *  ignorance. Empty when the entry weighed nothing. */
  instead: string[];
  /** What the decision governs, in durable terms — a rule, a surface, a band,
   *  a ritual step. Replaced `where` (a file list): paths rot and git already
   *  holds the diff, so the only field making a claim about the present was
   *  the only one nobody maintained. */
  scope: string;
}

export function getDecisions(): Decision[] {
  const parsed = readDoc("decisions.md");
  if (!parsed) return [];
  const entriesBlock = parsed.body.split(/^## Entries\s*$/m)[1] ?? parsed.body;
  const decisions: Decision[] = [];
  const sections = entriesBlock.split(/^## /m).slice(1);
  for (const section of sections) {
    const header = section.slice(0, section.indexOf("\n"));
    const hm = header.match(/^(.+?)\s+·\s+(.+)$/);
    if (!hm) continue;
    const bodyText = section.slice(section.indexOf("\n") + 1);
    const field = (label: string) =>
      bodyText.match(new RegExp(`\\*\\*${label}[^:]*:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`))?.[1].trim() ?? "";
    const insteadBlock = field("Instead of");
    decisions.push({
      date: hm[1].trim(),
      title: hm[2].trim(),
      what: field("What"),
      why: field("Why"),
      instead: insteadBlock
        .split(/\n(?=[-*]\s)/)
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean),
      scope: field("Scope"),
    });
  }
  return decisions;
}

/* ── Active phase (docs/phases/*.md, templates excluded) ─────────────
   No board = between phases. Heavy (product) boards use `## Workstream X —
   name` sections whose tasks are either Status-column table rows (the
   template's style) or legacy `- [ ]`/`- [x]` checkboxes; countWorkstreamTasks
   reads both. Light (system/side/kickoff) boards have no workstreams — their
   `## Items` checkboxes are counted directly, excluding the closing checklist
   (the same way a product board's Closing Checklist doesn't count toward
   build progress). Either way a board reports honest done/total. */

// Status-cell vocabulary in workstream task tables (| Task | … | Status |).
// `done` counts complete; open work counts toward the total; out-of-scope
// rows don't count at all. Normalized by lowercasing + stripping separators
// so "in_progress" / "in progress" / "in-progress" all match.
const TASK_STATUS_DONE = new Set(["done", "complete", "✅"]);
const TASK_STATUS_OPEN = new Set(["todo", "inprogress", "wip", "blocked"]);
const TASK_STATUS_EXCLUDED = new Set(["deferred", "cut", "wontdo", "na"]);

/** Count done/total across one `## Workstream` section body, reading both
 *  Status-column table rows and legacy checkbox tasks. */
function countWorkstreamTasks(section: string): { done: number; total: number } {
  let done = 0;
  let total = 0;

  // Legacy checkbox tasks.
  const boxDone = (section.match(/^\s*- \[x\]/gim) ?? []).length;
  const boxOpen = (section.match(/^\s*- \[ \]/gm) ?? []).length;
  done += boxDone;
  total += boxDone + boxOpen;

  // Table task rows — the Status cell is last. A row whose last cell isn't a
  // known status keyword (the header, the |---| separator, a non-task data
  // table) is silently skipped, so only real task rows count.
  for (const line of section.split("\n")) {
    const m = line.match(/^\s*\|(.+)\|\s*$/);
    if (!m) continue;
    const cells = m[1].split("|").map((c) => c.trim());
    const status = cells[cells.length - 1].toLowerCase().replace(/[\s_-]/g, "");
    if (TASK_STATUS_DONE.has(status)) {
      done++;
      total++;
    } else if (TASK_STATUS_OPEN.has(status)) {
      total++;
    }
    // header ("status"), separator ("---"), excluded, and non-task rows: skip.
  }

  return { done, total };
}

export interface Workstream {
  title: string;
  done: number;
  total: number;
}

export type BoardMode = "product" | "system" | "side" | "queue-shaping";

/** Short labels for board badges. Everything else about a mode — purpose,
 *  touch bands, rituals — is parsed from CONTRIBUTING (see getWorkModel). */
export const MODE_META: Record<BoardMode, { label: string }> = {
  product: { label: "Product" },
  system: { label: "System" },
  side: { label: "Side" },
  "queue-shaping": { label: "Queue-shaping" },
};

/** Frontmatter `mode:` → BoardMode. Boards/seeds written before 2026-07-20
 *  may carry the legacy value "phase", which reads as "product". */
function resolveMode(raw: string | undefined): BoardMode {
  return raw === "system" || raw === "side" || raw === "queue-shaping" ? raw : "product";
}

/**
 * The phase's own name, for surfaces that show a board in one line.
 *
 * A board's h1 carries mold scaffolding around the name, and each mold puts
 * the name somewhere different:
 *
 *   product  `# Checkout v1`
 *   system   `# System Work — Restructure the trackers (ACTIVE)`
 *   side     `# Sweep — P87 · P88 — opened 2026-07-28`
 *
 * So strip the scaffolding. Splitting on the first em dash instead reads the
 * mold's prefix as the name on every system board.
 */
export function boardName(title: string): string {
  return title
    .replace(/\s*\((?:ACTIVE|PAUSED)\)\s*$/i, "")
    .replace(/\s+—\s+opened\s+\d{4}-\d{2}-\d{2}\s*$/i, "")
    .replace(/^System Work\s+—\s+/i, "")
    .trim();
}

/** A board's three states. `waiting` is a claim of *completion* — cleared its
 *  kind, queued for the next — so it could not describe a board that stopped
 *  mid-kind, and one stopped mid-walkthrough read as finished. `paused` says
 *  the board is NOT finished at the kind its `stage:` names and nobody is on
 *  it (CONTRIBUTING § Rules shared by all modes). It holds no mode slot, and
 *  it ranks above `waiting` everywhere a surface orders boards: the state
 *  exists to be seen. */
export type BoardStatus = "active" | "waiting" | "paused";

/** How a status ranks when a surface orders boards: active · paused ·
 *  waiting. Paused sits second on purpose — a board that stopped must never
 *  hide behind boards that cleared their kind, which is the failure the state
 *  was added for. Shared by `getActiveBoards` and `groupBoards` so the
 *  surfaces cannot disagree about the order. */
export const STATUS_RANK: Record<BoardStatus, number> = { active: 0, paused: 1, waiting: 2 };

/** A status's word on a surface, the way `MODE_META` carries a mode's — so a
 *  tile's label, a badge row and a run's count line cannot spell the same
 *  state three ways. */
export const STATUS_LABEL: Record<BoardStatus, string> = {
  active: "Active",
  waiting: "Waiting",
  paused: "Paused",
};

/** The kinds each mode's boards pass through, in sequence order — the
 *  pipeline's own words (CONTRIBUTING § The phase pipeline), as a board
 *  declares them in `stage:`. Hard-coded like MODE_META's labels: the canon
 *  states the sequences in one prose sentence per mode, and a parser that
 *  read them out of it would be the fragile prose-reading the declared
 *  fields exist to avoid. The list orders a run's members and lets the drift
 *  alarms check a declared stage. Queue-shaping runs one unnamed kind, so its
 *  list is empty and a declared stage there is never checked. */
export const MODE_KINDS: Record<BoardMode, string[]> = {
  product: ["open", "build", "basic-layer", "survey", "deepen", "close"],
  system: ["open", "build", "close"],
  side: ["sweep", "research"],
  "queue-shaping": [],
};

export interface ActivePhase {
  slug: string;
  title: string;
  mode: BoardMode;
  /** `status:` as declared. A board with no field reads as active — boards
   *  written before the field existed must render as they did; only an
   *  unknown value is drift (`statusRaw` keeps it for the alarm). */
  status: BoardStatus;
  statusRaw: string | null;
  /** `stage:` — the kind the board sits at, or null when undeclared. */
  stage: string | null;
  /** `run:` — the run this board belongs to, or null. */
  run: string | null;
  /** The doc the board's `**Picture:**` line links — a run board's one-frame
   *  view (`planning/<run>-picture.md`, CONTRIBUTING § The phase pipeline),
   *  as a docs-relative path. Null where the line is absent or links
   *  nothing; a member or standalone board deletes the line. */
  picture: string | null;
  /** V items sitting unwalked under the board's `## Deepening` section —
   *  written by the basic layer and moved there at its close, walked by the
   *  deepen kind. A **board** fact, not a walkthrough one: the items have left
   *  the walkthrough by the time they are counted here, which is exactly why
   *  a board whose walkthrough asks nothing can still have work outstanding.
   *  Zero when the section is absent or holds no `V#.#` bullets — presence,
   *  not count. */
  deferred: number;
  workstreams: Workstream[];
  done: number;
  total: number;
  /** What the walkthrough still asks of the PO, and what it already got:
   *  `calls` is its open O items (`- **O1.` lines), `checks` its unwalked V
   *  items (`- [ ] **V`), `walked` the V items already passed (`- [x] **V`).
   *  Null when no walkthrough sibling exists. The counts are why the link
   *  exists — the board is long and the O items are not on it — so a
   *  walkthrough asking nothing has no claim on the reader's attention, and
   *  `walked` is what separates "walked clean" from "never asked": both
   *  leave `calls` and `checks` at zero, and only one of them is worth
   *  saying out loud. */
  walkthrough: WalkthroughCounts | null;
  /** The board in full — Work renders it here; it isn't a doc-page pointer. */
  body: string;
}

/** All open boards — at most one *active* per mode (Work Model concurrency
 *  rule; a run holds several waiting product boards). Ordered by mode in the
 *  order the Levels line and the starters use — product · system · side ·
 *  queue-shaping (MODE_META's own order) — so the board a reader meets first
 *  is chosen, not whatever readdir returned; inside a mode the active board
 *  leads, then the rest by slug. Grouping by run is `groupBoards`' job. Empty
 *  array = fully between boards. */
export function getActiveBoards(): ActivePhase[] {
  const dir = path.join(DOCS_DIR, "phases");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && !f.endsWith("-walkthrough.md"));
  const boards: ActivePhase[] = [];
  for (const file of files) {
    const parsed = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf-8"));
    const workstreams: Workstream[] = [];
    for (const section of parsed.body.split(/^## /m).slice(1)) {
      const header = section.slice(0, section.indexOf("\n")).trim();
      if (!/^Workstream/i.test(header)) continue;
      const { done, total } = countWorkstreamTasks(section);
      workstreams.push({ title: header, done, total });
    }
    let done = workstreams.reduce((n, w) => n + w.done, 0);
    let total = workstreams.reduce((n, w) => n + w.total, 0);
    // Light board (no workstreams): count its `## Items` checkboxes directly,
    // skipping the closing checklist (`## Close…`) so progress reflects the
    // work, not the close ritual — mirrors heavy boards, whose Closing
    // Checklist doesn't count either.
    if (workstreams.length === 0) {
      for (const section of parsed.body.split(/^## /m).slice(1)) {
        const header = section.slice(0, section.indexOf("\n")).trim();
        if (/^clos/i.test(header)) continue;
        const c = countWorkstreamTasks(section);
        done += c.done;
        total += c.total;
      }
    }
    const slug = file.replace(/\.md$/, "");
    const mode: BoardMode = resolveMode(parsed.fm.mode);
    const statusRaw = parsed.fm.status?.trim() || null;
    boards.push({
      slug,
      title: stripMd(firstHeading(parsed.body) ?? slug),
      mode,
      status: statusRaw === "waiting" || statusRaw === "paused" ? statusRaw : "active",
      statusRaw,
      stage: parsed.fm.stage?.trim() || null,
      run: parsed.fm.run?.trim() || null,
      picture: pictureLink(parsed.body),
      deferred: countDeferredV(parsed.body),
      workstreams,
      done,
      total,
      walkthrough: readWalkthroughCounts(path.join(dir, `${slug}-walkthrough.md`)),
      body: parsed.body,
    });
  }
  const order = Object.keys(MODE_META) as BoardMode[];
  const rank = (b: ActivePhase) => STATUS_RANK[b.status];
  return boards.sort(
    (a, b) =>
      order.indexOf(a.mode) - order.indexOf(b.mode) || rank(a) - rank(b) || a.slug.localeCompare(b.slug)
  );
}

/** Open boards, grouped for a surface that shows them together.
 *
 *  A standalone board is a group of one. Boards sharing a `run:` form one
 *  group under the **run board** — the board whose name is the run's name
 *  (the product mold's `run:` line names the run on every board of it, the
 *  run board included, and a member's name is its chunk's, never the run's).
 *  A run whose run board is not open still groups; the run name heads it.
 *
 *  Order: by mode, the group holding the active board first inside a mode,
 *  then by name. Inside a run: active first, then by the mode's kind sequence
 *  (MODE_KINDS) so a run reads as its pipeline, then by slug. */
export interface BoardGroup {
  mode: BoardMode;
  /** The run's name, or null for a standalone board. */
  run: string | null;
  runBoard: ActivePhase | null;
  /** The run's members (run board excluded), or the one standalone board. */
  boards: ActivePhase[];
}

/* ── The walkthrough, parsed ───────────────────────────────────────────────
 *
 * A walkthrough is read by someone *walking* it, not by someone reading a
 * file, so it gets a parse and a page of its own rather than the generic doc
 * viewer's flat prose.
 *
 * **It keys on the identifiers, never on the section headings.** `O##`,
 * `V#.#` and `G##` are load-bearing across the docs, the molds, this code and
 * the record — the same bargain the `P##` / `§N` / `FC##` schemes make — while
 * "Open for your call" is a heading an adopter may rename. So the items are
 * found by their ids wherever they sit, and the *page's* section headings are
 * the doc's own `##` lines in the doc's own order. Renaming a section moves
 * its name on the page and nothing else; deleting one (G, which the mold says
 * to delete when a phase has none) renders nothing, correctly.
 */

/** One walked item, or an unidentified bullet in a section that has none
 *  (the Decisions log, whose lines carry no scheme). */
export interface WalkthroughItem {
  /** `O1` · `V1.1` · `G1`, or null for a bullet carrying no identifier. */
  id: string | null;
  kind: "call" | "check" | "glance" | "note";
  /** The rest of the bold run after the id — the item's one-line framing. */
  title: string;
  /** Everything after the bold run, markdown kept (URLs, Expect, evidence). */
  body: string;
  /** `[x]` vs `[ ]`. Null for O items and notes: an O item is a bullet, not a
   *  checkbox — it is open, or it is gone (the mold's own rule). */
  walked: boolean | null;
}

/** Items under one `### V1 — workstream` heading, or directly under the `##`. */
export interface WalkthroughGroup {
  heading: string | null;
  items: WalkthroughItem[];
}

export interface WalkthroughSection {
  /** The doc's own `##` text. */
  heading: string;
  id: string;
  groups: WalkthroughGroup[];
  /** Whatever in the section is neither a parsed bullet nor a `###` — the
   *  mold's author card lands here rather than being silently dropped. */
  prose: string;
}

export interface Walkthrough {
  /** The BOARD's slug — the file is `<slug>-walkthrough.md`. */
  slug: string;
  title: string;
  /** Everything between the h1 and the first `##` — the mold's "How this
   *  works" card. Markdown kept. */
  intro: string;
  sections: WalkthroughSection[];
  counts: WalkthroughCounts;
}

export interface WalkthroughCounts {
  calls: number;
  checks: number;
  walked: number;
  glances: number;
  /** Bullets carrying no identifier — which is what the Decisions log is, and
   *  in practice the only place they occur (the page already renders them
   *  unornamented on exactly that reading). It is the count that makes a
   *  walkthrough asking nothing worth a card: a basic layer that passed leaves
   *  calls, checks and walked at zero and its decisions on the file, and
   *  without this count the board said nothing over all of them. The limit is
   *  the reading: an unidentified bullet written anywhere else counts here
   *  too. */
  notes: number;
}

const ITEM_RE = /^\s*-\s+(?:\[([ xX])\]\s+)?\*\*(.+?)\*\*\s*(.*)$/;
const ID_RE = /^(O\d+|V\d+(?:\.\d+)?|G\d+)[.:]?\s*/;

function itemKind(id: string | null): WalkthroughItem["kind"] {
  if (!id) return "note";
  return id[0] === "O" ? "call" : id[0] === "V" ? "check" : "glance";
}

/** The V items a board is holding under `## Deepening` — written by the basic
 *  layer, moved there unwalked at its close, walked by the deepen kind.
 *
 *  It lives here, beside the walkthrough parse, because what it recognises is
 *  a **walkthrough item**: the same `- [ ] **V1.1 …**` line, read after it has
 *  moved onto the board. Only the section is the board's, and that part is
 *  keyed on the mold's heading rather than on an identifier — the one place
 *  this file reads a board by heading other than `## Workstream` and the
 *  closing checklist, which `getActiveBoards` already does for progress.
 *
 *  Presence-not-count, like the invariants: a standalone board deletes the
 *  section (the mold says to), a member board carries it empty until the
 *  survey writes it, and both read zero rather than firing anything. */
/** The first `.md` link on the board's `**Picture:**` line, resolved from
 *  `phases/` to a docs-relative path. The mold's placeholder links the mold
 *  itself, which is not a picture, so that resolves to null too. */
function pictureLink(body: string): string | null {
  const line = body.split("\n").find((l) => l.startsWith("**Picture:**"));
  const href = line?.match(/\]\(([^)]+\.md)\)/)?.[1];
  if (!href || href.startsWith("http")) return null;
  const rel = path.posix.normalize(path.posix.join("phases", href));
  return path.posix.basename(rel).startsWith("_") ? null : rel;
}

function countDeferredV(body: string): number {
  let n = 0;
  for (const line of sectionOf(body, "Deepening").split("\n")) {
    const m = line.match(ITEM_RE);
    if (!m) continue;
    const id = m[2].trim().match(ID_RE)?.[1];
    if (id && itemKind(id) === "check") n += 1;
  }
  return n;
}

/** The counts the board surfaces quote, derived from the parse rather than
 *  from a second pass of regexes over the same file: `calls` is the open O
 *  items (they only leave the list by being deleted), `checks` the unwalked V
 *  items, `walked` the passed ones. `walked` is what separates "walked clean"
 *  from "never asked" — both leave calls and checks at zero, and only one of
 *  them is worth saying out loud. */
function countWalkthrough(sections: WalkthroughSection[]): WalkthroughCounts {
  const c: WalkthroughCounts = { calls: 0, checks: 0, walked: 0, glances: 0, notes: 0 };
  for (const s of sections)
    for (const g of s.groups)
      for (const it of g.items) {
        if (it.kind === "call") c.calls += 1;
        else if (it.kind === "check") it.walked ? (c.walked += 1) : (c.checks += 1);
        else if (it.kind === "glance") c.glances += 1;
        else c.notes += 1;
      }
  return c;
}

function parseWalkthrough(slug: string, raw: string): Walkthrough {
  const { body } = parseFrontmatter(raw);
  const title = stripMd(firstHeading(body) ?? slug);
  const sections: WalkthroughSection[] = [];
  let intro: string[] = [];
  let section: WalkthroughSection | null = null;
  let group: WalkthroughGroup | null = null;
  let prose: string[] = [];
  let fence: string | null = null;

  const flushProse = () => {
    if (section) section.prose = prose.join("\n").trim();
    prose = [];
  };

  for (const line of body.split("\n")) {
    // Fence-aware for the same reason docHeadings is: a `## ` or a `- **…**`
    // inside a code block is code, and a walkthrough's evidence is often a
    // fenced command output.
    const f = line.match(/^\s{0,3}(```+|~~~+)/);
    if (f) {
      if (fence === null) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      (section ? prose : intro).push(line);
      continue;
    }
    if (fence !== null) {
      (section ? prose : intro).push(line);
      continue;
    }

    const h2 = line.match(/^##\s+(.*?)\s*#*\s*$/);
    if (h2) {
      flushProse();
      const heading = stripMd(h2[1]);
      section = { heading, id: headingSlug(heading), groups: [], prose: "" };
      sections.push(section);
      group = null;
      continue;
    }
    if (!section) {
      if (!/^#\s/.test(line)) intro.push(line);
      continue;
    }

    const h3 = line.match(/^###\s+(.*?)\s*#*\s*$/);
    if (h3) {
      group = { heading: stripMd(h3[1]), items: [] };
      section.groups.push(group);
      continue;
    }

    const m = line.match(ITEM_RE);
    if (m) {
      const box = m[1];
      const bold = m[2].trim();
      const idm = bold.match(ID_RE);
      const id = idm ? idm[1] : null;
      if (!group) {
        group = { heading: null, items: [] };
        section.groups.push(group);
      }
      const kind = itemKind(id);
      group.items.push({
        id,
        kind,
        title: idm ? bold.slice(idm[0].length).trim() : bold,
        body: m[3].trim(),
        // An O item is a bullet by rule, so it has no box even if someone
        // writes one; a note never had one.
        walked: kind === "call" || kind === "note" ? null : box?.toLowerCase() === "x",
      });
      continue;
    }

    // A continuation line belongs to the item above it — evidence hung under
    // a check is the case that matters, and dropping it would drop the proof.
    const last = group?.items.at(-1);
    if (last && /^\s+\S/.test(line)) {
      last.body = `${last.body}\n${line.trim()}`.trim();
      continue;
    }
    prose.push(line);
  }
  flushProse();
  if (!section) intro = intro.concat(prose);

  return {
    slug,
    title,
    intro: intro.join("\n").replace(/^\s*-{3,}\s*$/gm, "").trim(),
    sections,
    counts: countWalkthrough(sections),
  };
}

/** The walkthrough sibling of one board, or null when the board has none.
 *  Absence is a legitimate state — most boards have no walkthrough until the
 *  build commits, and an example project may have none at all. */
export function getWalkthrough(slug: string): Walkthrough | null {
  const file = path.join(DOCS_DIR, "phases", `${slug}-walkthrough.md`);
  if (!fs.existsSync(file)) return null;
  return parseWalkthrough(slug, fs.readFileSync(file, "utf-8"));
}

/** The board slugs that have a walkthrough — the walkthrough route's params.
 *  Templates are excluded the same way `getActiveBoards` excludes them. */
export function getWalkthroughSlugs(): string[] {
  const dir = path.join(DOCS_DIR, "phases");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith("-walkthrough.md") && !f.startsWith("_"))
    .map((f) => f.replace(/-walkthrough\.md$/, ""))
    .sort();
}

function readWalkthroughCounts(file: string): ActivePhase["walkthrough"] {
  if (!fs.existsSync(file)) return null;
  return parseWalkthrough("", fs.readFileSync(file, "utf-8")).counts;
}

export function groupBoards(boards: ActivePhase[]): BoardGroup[] {
  const order = Object.keys(MODE_META) as BoardMode[];
  const groups: BoardGroup[] = [];
  const byRun = new Map<string, BoardGroup>();
  for (const b of boards) {
    if (!b.run) {
      groups.push({ mode: b.mode, run: null, runBoard: null, boards: [b] });
      continue;
    }
    const key = `${b.mode}\u0000${b.run}`;
    let g = byRun.get(key);
    if (!g) {
      g = { mode: b.mode, run: b.run, runBoard: null, boards: [] };
      byRun.set(key, g);
      groups.push(g);
    }
    if (boardName(b.title) === b.run && !g.runBoard) g.runBoard = b;
    else g.boards.push(b);
  }
  const stageRank = (b: ActivePhase) => {
    const i = b.stage ? MODE_KINDS[b.mode].indexOf(b.stage) : -1;
    return i === -1 ? MODE_KINDS[b.mode].length : i;
  };
  const activeRank = (b: ActivePhase) => STATUS_RANK[b.status];
  for (const g of groups) {
    g.boards.sort((a, b) => activeRank(a) - activeRank(b) || stageRank(a) - stageRank(b) || a.slug.localeCompare(b.slug));
  }
  const holdsActive = (g: BoardGroup) =>
    g.runBoard?.status === "active" || g.boards.some((b) => b.status === "active") ? 0 : 1;
  const nameOf = (g: BoardGroup) => g.run ?? boardName(g.boards[0].title);
  return groups.sort(
    (a, b) =>
      order.indexOf(a.mode) - order.indexOf(b.mode) ||
      holdsActive(a) - holdsActive(b) ||
      nameOf(a).localeCompare(nameOf(b))
  );
}

/* ── Shipped timeline (docs/archive/phases/*.md) ─────────────────────
   Modern boards open with a close-banner blockquote summarizing what
   shipped; walkthrough siblings are skipped. Sorted newest first by
   last-reviewed (the close sweep bumps it). */

export interface ArchivedPhase {
  slug: string;
  title: string;
  banner: string | null; // markdown kept
  lastReviewed: string | null;
  hasWalkthrough: boolean;
}

export function getArchivedPhases(): ArchivedPhase[] {
  const dir = path.join(DOCS_DIR, "archive", "phases");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md");
  const walkthroughs = new Set(files.filter((f) => f.endsWith("-walkthrough.md")));
  const phases: ArchivedPhase[] = [];
  for (const file of files) {
    if (walkthroughs.has(file)) continue;
    const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf-8"));
    const afterTitle = body.slice(body.search(/^# /m));
    const bannerLines: string[] = [];
    for (const line of afterTitle.split("\n").slice(1)) {
      if (line.startsWith(">")) bannerLines.push(line.replace(/^>\s?/, ""));
      else if (bannerLines.length > 0) break;
      else if (line.trim() !== "") break;
    }
    const slug = file.replace(/\.md$/, "");
    phases.push({
      slug,
      title: stripMd(firstHeading(body) ?? slug),
      banner: bannerLines.length ? bannerLines.join(" ").trim() : null,
      lastReviewed: fm["last-reviewed"] ?? null,
      hasWalkthrough: walkthroughs.has(`${slug}-walkthrough.md`),
    });
  }
  return phases.sort((a, b) => (b.lastReviewed ?? "").localeCompare(a.lastReviewed ?? ""));
}

/* ── The site map, derived from the routes directory ───────────────── */

/** One route in the tree `/[surface]/site` draws.
 *
 *  Read from the mount's routes directory (`Surface.routesDir`), never from a
 *  doc: the site map is the one surface here whose source is code, and it is
 *  derived for the same reason every other page is — an authored map of the
 *  routes is a second thing to review, and the run's picture doc already
 *  holds the *aspirational* map. This is the map it is reconciled against at
 *  the run's close (CONTRIBUTING § The phase pipeline). */
export interface RouteNode {
  /** The segment as the folder names it — `[id]`, `[...slug]`, `docs`. */
  segment: string;
  /** The URL path down to this node, dynamic segments kept in brackets. */
  path: string;
  /** A bracketed segment: `[id]`, `[...slug]`, `[[...slug]]`. */
  dynamic: boolean;
  /** What the folder holds at this level — a page, a route handler, both,
   *  or nothing (a folder that only groups its children). */
  page: string | null;
  handler: string | null;
  children: RouteNode[];
}

/** The routing conventions, in one place — Next's App Router as this project
 *  runs it. An adopter on another file-based router edits these three and
 *  nothing else: what names a page, what names a handler, and which folders
 *  are not URL segments. */
const ROUTE_PAGE = /^page\.(tsx|ts|jsx|js|mdx|md)$/;
const ROUTE_HANDLER = /^route\.(tsx|ts|jsx|js)$/;
/** Route groups `(name)` add no segment; parallel slots `@name`, private
 *  folders `_name` and dotfiles are not routes. */
function routeSegment(name: string): { kind: "segment" | "transparent" | "skip"; segment: string } {
  if (name.startsWith(".") || name.startsWith("_") || name.startsWith("@")) return { kind: "skip", segment: "" };
  if (/^\(.+\)$/.test(name)) return { kind: "transparent", segment: "" };
  return { kind: "segment", segment: name };
}

function readRouteDir(dir: string, urlPath: string, node: RouteNode, root: string): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isFile()) {
      if (ROUTE_PAGE.test(entry.name)) node.page = path.relative(root, full);
      else if (ROUTE_HANDLER.test(entry.name)) node.handler = path.relative(root, full);
      continue;
    }
    if (!entry.isDirectory()) continue;
    const seg = routeSegment(entry.name);
    if (seg.kind === "skip") continue;
    if (seg.kind === "transparent") {
      // A route group folds into its parent: its children are the parent's.
      readRouteDir(full, urlPath, node, root);
      continue;
    }
    const childPath = urlPath === "/" ? `/${seg.segment}` : `${urlPath}/${seg.segment}`;
    const child: RouteNode = {
      segment: seg.segment,
      path: childPath,
      dynamic: seg.segment.startsWith("["),
      page: null,
      handler: null,
      children: [],
    };
    readRouteDir(full, childPath, child, root);
    // A folder with nothing routable under it (components, styles) is not a
    // node — the tree shows routes, not the filesystem.
    if (child.page || child.handler || child.children.length > 0) node.children.push(child);
  }
}

/** The route tree under a routes directory. Null when the directory does not
 *  exist — distinct from an empty tree, which is a routes directory holding
 *  no page files. */
/** The routes directory the site map reads — the app router's own folder,
 *  beside `docs/`. */
const ROUTES_DIR = path.join(path.dirname(DOCS_DIR), "app");

export function getSiteMap(): RouteNode | null {
  const routesDir = ROUTES_DIR;
  if (!fs.existsSync(routesDir)) return null;
  const root: RouteNode = { segment: "", path: "/", dynamic: false, page: null, handler: null, children: [] };
  readRouteDir(routesDir, "/", root, routesDir);
  return root;
}

/** Every node of a tree, depth-first, the root included. */
export function flattenRoutes(root: RouteNode): RouteNode[] {
  const out: RouteNode[] = [];
  const visit = (n: RouteNode) => {
    out.push(n);
    n.children.forEach(visit);
  };
  visit(root);
  return out;
}

/** A row of a run board's survey table — the shown / launch / later table on
 *  the product mold (CONTRIBUTING § The phase pipeline). The first column
 *  names the surface; the column set after it is the board's own, so the
 *  rest of the row is kept as the header names it rather than as three fixed
 *  fields. `paths` are the URL paths the Surface cell names, which is how a
 *  row is matched to a route: a row that names no path covers no route. */
export interface SurveyRow {
  board: string;
  surface: string;
  paths: string[];
  cells: { header: string; value: string }[];
}

const ROUTE_PATH_IN_CELL = /(?<![\w/])\/[\w\-.[\]/]*/g;

/** Every survey-table row across the open product boards. Presence-not-count:
 *  a mount with no run board, or a run board whose table still holds the
 *  mold's placeholder row, yields nothing. */
export function getSurveyRows(): SurveyRow[] {
  const rows: SurveyRow[] = [];
  for (const board of getActiveBoards()) {
    if (board.mode !== "product") continue;
    for (const section of board.body.split(/^## /m).slice(1)) {
      const header = section.slice(0, section.indexOf("\n")).trim();
      if (!/^survey/i.test(header)) continue;
      let headers: string[] | null = null;
      for (const line of section.split("\n")) {
        const m = line.match(/^\s*\|(.+)\|\s*$/);
        if (!m) {
          if (headers && line.trim() === "") headers = null;
          continue;
        }
        const cells = m[1].split("|").map((c) => c.trim());
        if (!headers) {
          headers = cells;
          continue;
        }
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        const surface = stripMd(cells[0] ?? "");
        // The mold's placeholder is not a row.
        if (!surface || /^\(.*\)$/.test(surface)) continue;
        rows.push({
          board: board.slug,
          surface,
          paths: (cells[0].match(ROUTE_PATH_IN_CELL) ?? []).map((p) => p.replace(/\/$/, "") || "/"),
          cells: headers.slice(1).map((h, i) => ({ header: h, value: cells[i + 1] ?? "" })),
        });
      }
    }
  }
  return rows;
}

/** Whether a survey row's path covers a route: equal, or a prefix by whole
 *  segments, with a dynamic segment on either side matching any one segment
 *  (`/demo/site` covers `/[surface]/site`; `/dogs` covers `/dogs/[id]`). */
export function routeCovered(routePath: string, rowPaths: string[]): boolean {
  const route = routePath.split("/").filter(Boolean);
  const isDynamic = (s: string) => s.startsWith("[");
  return rowPaths.some((rp) => {
    const row = rp.split("/").filter(Boolean);
    if (row.length > route.length) return false;
    return row.every((seg, i) => seg === route[i] || isDynamic(seg) || isDynamic(route[i]));
  });
}
