import fs from "node:fs";
import path from "node:path";

// Parses app/globals.css at build time — the styleguide renders exclusively
// from what this returns, so a token edit updates the styleguide in the same
// commit (derived, never authored; same law as lib/system.ts). The parser
// adapts to the CSS as written — its section banners ARE the styleguide's
// grouping — and the CSS never bends to the parser.
//
// Scopes: light (:root), dark (:root[data-theme="dark"] overlaid on light),
// mobile (the max-width:767px :root block overlaid on light). Values shown in
// the styleguide are resolved through the same var() chains the browser walks.
//
// A local `@import "./x.css"` in globals.css is followed: its :root joins the
// light scope as a base layer, so a token re-pointed onto a product's own
// tokens resolves to a value rather than printing a bare var(). Imported
// tokens are the product's, not this file's: they never render as sections,
// never count, and are never censused. A token whose chain lands on one says
// so (`TokenDef.product`).

const CSS_PATH = path.join(process.cwd(), "app", "globals.css");

/* ── Data shapes ───────────────────────────────────────────────────── */

export interface TokenDef {
  name: string; // "--brand-main"
  raw: string; // "var(--brand-600)"
  /** First var() target, when raw is an alias — "--brand-600". */
  target: string | null;
  light: string; // fully resolved light value — "#006862"
  /** Resolved dark value; null when identical to light (doesn't flip). */
  dark: string | null;
  /** Resolved mobile value; null when identical to desktop. */
  mobile: string | null;
  /** Trailing /* comment *​/ on the declaration, cleaned. */
  note: string | null;
  /** The imported token its light value comes from, or null when the value
   *  is this file's own. Derived by walking the alias chain. */
  product: string | null;
}

export interface TokenSection {
  /** Banner text, e.g. "_Neutral", "SEMANTIC TOKENS — Surface". */
  title: string;
  /** The banner's remaining prose, when it carries guidance. */
  note: string | null;
  tokens: TokenDef[];
}

export interface StyleguideData {
  /** :root sections, in file order (primitives first, then semantic…). */
  root: TokenSection[];
  /** @theme sections (the Tailwind mapping layer), in file order. */
  theme: TokenSection[];
  /** Token names the dark theme overrides directly. */
  darkOverridden: string[];
  definedCount: number;
  /** Token names defined by a locally imported stylesheet. */
  imported: string[];
  /** The local stylesheets globals.css imports, relative to the project. */
  importedFrom: string[];
}

export interface TokenHealth {
  defined: number;
  /** var(--x) references with no definition anywhere. `guarded` = every
   *  occurrence carries a fallback (degrades quietly); unguarded ones
   *  render as `unset` — silent bugs. */
  undefinedRefs: { name: string; count: number; files: string[]; guarded: boolean }[];
}

export interface ComponentEntry {
  name: string; // "ButtonAction"
  file: string; // "components/ui/ButtonAction.tsx"
}

export interface ComponentGroup {
  dir: string; // "ui" | "overlays" | "layout"
  components: ComponentEntry[];
}

/* ── CSS block extraction ──────────────────────────────────────────── */

/** Body of the first block opened by `selector` (brace-balanced). Pass
 *  `containing` to skip matches whose block lacks that substring (several
 *  `@media (max-width: 767px)` blocks exist; only one holds `:root`). */
function blockOf(css: string, selector: RegExp, containing?: string): string {
  const re = new RegExp(selector.source, selector.flags.includes("g") ? selector.flags : selector.flags + "g");
  let m;
  while ((m = re.exec(css))) {
    let i = css.indexOf("{", m.index);
    if (i === -1) return "";
    let depth = 0;
    const start = i + 1;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    const body = css.slice(start, i);
    if (!containing || body.includes(containing)) return body;
  }
  return "";
}

const BANNER_LINE = /^[=─═\-\s]*$/; // decorative banner edges

/** Tokens + their section banners, walked in order. */
function parseBlock(body: string): TokenSection[] {
  const sections: TokenSection[] = [];
  let current: TokenSection = { title: "", note: null, tokens: [] };
  const push = () => {
    if (current.tokens.length) sections.push(current);
  };

  // Walk comments and declarations in file order.
  const item = /\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;]+);[ \t]*(\/\*([\s\S]*?)\*\/)?/g;
  let m;
  while ((m = item.exec(body))) {
    if (m[1] !== undefined && m[2] === undefined) {
      // A standalone comment — a banner if it uses the file's banner styles:
      // `====` walls, or a first line bracketed in dashes (`---- X ----` /
      // `── X ──`), whose remaining lines may carry prose (kept as the note).
      const text = m[1].trim();
      const firstLine = text.split("\n")[0].trim();
      const isBanner = /[=═]{8,}/.test(text) || /^[-─]{2,}\s*\S.*?[-─]{2,}$/.test(firstLine);
      if (!isBanner) continue;
      const lines = m[1]
        .split("\n")
        .map((l) => l.replace(/^\s*\*?\s*/, "").replace(/^[-─=═\s]+|[-─=═\s]+$/g, "").trim())
        .filter((l) => l && !BANNER_LINE.test(l));
      if (!lines.length) continue;
      push();
      current = { title: lines[0], note: lines.length > 1 ? lines.slice(1).join(" ") : null, tokens: [] };
    } else if (m[2]) {
      const note = m[5]
        ? m[5]
            .split("\n")
            .map((l) => l.trim())
            .join(" ")
            .trim()
        : null;
      current.tokens.push({
        name: m[2],
        raw: m[3].trim(),
        target: m[3].match(/var\((--[\w-]+)/)?.[1] ?? null,
        light: "",
        dark: null,
        mobile: null,
        note,
        product: null,
      });
    }
  }
  push();
  return sections;
}

/** Resolves var() chains against a scope map (browser-style, with fallbacks). */
function resolveValue(value: string, map: Map<string, string>): string {
  let out = value;
  for (let depth = 0; depth < 12 && out.includes("var("); depth++) {
    out = out.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*))?\)/g, (whole, name, fallback) => {
      const v = map.get(name);
      return v !== undefined ? v : fallback !== undefined ? fallback.trim() : whole;
    });
    if (!/var\((--[\w-]+)/.test(out) || out === value) break;
    value = out;
  }
  return out.trim();
}

/* ── The parse ─────────────────────────────────────────────────────── */

let cache: StyleguideData | null = null;
/** Every alias edge in every scope: token -> the tokens its value reads.
 *  The census walks these, so a primitive is reached through the semantic
 *  token that names it, in whichever theme does the naming. */
let aliasEdges = new Map<string, Set<string>>();

export function getStyleguide(): StyleguideData {
  if (cache) return cache;
  const css = fs.readFileSync(CSS_PATH, "utf-8");

  const themeSections = parseBlock(blockOf(css, /@theme\s*/));
  const rootSections = parseBlock(blockOf(css, /^:root\s*(?=\{)/m));
  const darkSections = parseBlock(blockOf(css, /:root\[data-theme="dark"\]\s*(?=\{)/));
  // The mobile :root override lives inside ONE of the max-width-767 blocks.
  const mobileMedia = blockOf(css, /@media\s*\(max-width:\s*767px\)\s*/, ":root");
  const mobileSections = parseBlock(blockOf(mobileMedia, /:root\s*(?=\{)/));

  const flat = (s: TokenSection[]) => s.flatMap((x) => x.tokens);
  // Self-referential @theme aliases (`--radius-md: var(--radius-md)`) are
  // Tailwind-mapping no-ops — adding them would make resolution circular.
  const asMap = (defs: TokenDef[]) =>
    new Map(defs.filter((d) => d.target !== d.name).map((d) => [d.name, d.raw]));

  // Local imports only (`./x.css`, `../x.css`), never a package like
  // "tailwindcss": their :root is the base this file's tokens override.
  const imported = new Map<string, string>();
  const importedFrom: string[] = [];
  for (const m of css.matchAll(/@import\s+["'](\.{1,2}\/[^"']+\.css)["']/g)) {
    const file = path.resolve(path.dirname(CSS_PATH), m[1]);
    if (!fs.existsSync(file)) continue;
    importedFrom.push(path.relative(process.cwd(), file));
    const body = blockOf(fs.readFileSync(file, "utf-8"), /^:root\s*(?=\{)/m);
    for (const [k, v] of asMap(flat(parseBlock(body)))) imported.set(k, v);
  }

  const ownMap = new Map([...asMap(flat(rootSections)), ...asMap(flat(themeSections))]);
  const lightMap = new Map([...imported, ...ownMap]);
  const darkOnly = asMap(flat(darkSections));
  const darkMap = new Map([...lightMap, ...darkOnly]);
  const mobileOnly = asMap(flat(mobileSections));
  const mobileMap = new Map([...lightMap, ...mobileOnly]);

  for (const section of [...rootSections, ...themeSections]) {
    for (const t of section.tokens) {
      t.light = resolveValue(t.raw, lightMap);
      // A scope's direct override of THIS token wins over resolving the
      // light alias chain through that scope (browser semantics).
      const dark = resolveValue(darkOnly.get(t.name) ?? t.raw, darkMap);
      t.dark = dark !== t.light ? dark : null;
      const mobile = resolveValue(mobileOnly.get(t.name) ?? t.raw, mobileMap);
      t.mobile = mobile !== t.light ? mobile : null;
      // Follow the alias chain until it leaves this file's own tokens.
      let hop = t.target;
      for (let depth = 0; hop && depth < 12; depth++) {
        if (!ownMap.has(hop)) {
          t.product = imported.has(hop) ? hop : null;
          break;
        }
        hop = ownMap.get(hop)!.match(/^var\((--[\w-]+)\)$/)?.[1] ?? null;
      }
    }
  }

  aliasEdges = new Map();
  for (const t of [...flat(rootSections), ...flat(themeSections), ...flat(darkSections), ...flat(mobileSections)]) {
    if (t.target === t.name) continue;
    for (const m of t.raw.matchAll(/var\((--[\w-]+)/g)) {
      if (!aliasEdges.has(t.name)) aliasEdges.set(t.name, new Set());
      aliasEdges.get(t.name)!.add(m[1]);
    }
  }

  cache = {
    root: rootSections,
    theme: themeSections,
    darkOverridden: [...darkOnly.keys()],
    definedCount: ownMap.size,
    imported: [...imported.keys()],
    importedFrom,
  };
  return cache;
}

/* ── Health: undefined references ──────────────────────────────────────
   Scanned across app/, components/, lib/, contexts/, hooks/ (.tsx + .css).
   The styleguide's own pages are excluded — they reference tokens
   dynamically and must never count as usage. Which tokens nothing reaches
   for is the census's question (`getCensus`), not this one. */

const SCAN_DIRS = ["app", "components", "lib", "contexts", "hooks"];
// Both styleguide homes: this repo mounts the dashboard at app/[surface],
// the template at app/system. Each repo has exactly one of the two, and the
// other entry matches nothing — cheaper than re-rendering on export.
const STYLEGUIDE = [path.join("app", "system", "styleguide"), path.join("app", "[surface]", "styleguide")];
const EXCLUDE = [
  ...STYLEGUIDE,
  path.join("lib", "styleguide.ts"), // this parser's own regexes aren't usage
  path.join("lib", "system.ts"),
];
/** The census reads the styleguide's own chrome, which is the dashboard's,
 *  and skips only its demo registry: mounting every component to show it is
 *  not reaching for one. */
const CENSUS_EXCLUDE = [
  ...STYLEGUIDE.map((d) => path.join(d, "components", "demos")),
  ...EXCLUDE.slice(STYLEGUIDE.length),
];

/** The dashboard's own code: the one authored list the census reads. Every
 *  other route file is the product's, and a component or module belongs to
 *  whoever imports it. Both mount points are listed for the same reason
 *  EXCLUDE lists both styleguide homes. The inspector is here because it is
 *  the system's tool laid over any page, not part of the page it inspects.
 *  A project whose root page is the record's own front door, not a product,
 *  adds `app/page.tsx` here. */
export const DASHBOARD = [
  path.join("app", "system"),
  path.join("app", "[surface]"),
  path.join("components", "inspector"),
];

/** The frame every page sits in: the root layout, and globals.css's element
 *  rules (`body`; its declarations are definitions, not usage). Reaching for a
 *  token here serves the dashboard always, and the product whenever there is
 *  one. A class rule in globals.css is not the frame: it belongs to whoever
 *  writes the class (`getCensus`). */
const BASE = [path.join("app", "layout.tsx"), path.join("app", "globals.css")];

/** Comments don't count — a token named in prose is neither used nor broken. */
function stripComments(text: string, isCss: boolean): string {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, " ");
  if (!isCss) out = out.replace(/^\s*\/\/.*$/gm, " ");
  return out;
}

function scanFiles(exclude = EXCLUDE): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      const rel = path.relative(process.cwd(), full);
      if (exclude.some((e) => rel.startsWith(e))) continue;
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx|ts|css)$/.test(entry.name))
        out.push({ file: rel, text: stripComments(fs.readFileSync(full, "utf-8"), rel.endsWith(".css")) });
    }
  };
  for (const d of SCAN_DIRS) walk(path.join(process.cwd(), d));
  return out;
}

/** A file's text with globals.css's own declarations masked, so a token's
 *  definition is never read as its usage. */
function usageText(file: string, text: string): string {
  return file === path.join("app", "globals.css")
    ? text.replace(/^\s*--[\w-]+\s*:[^;]*;/gm, (decl) => decl.replace(/var\(/g, "ref("))
    : text;
}

let healthCache: TokenHealth | null = null;

export function getTokenHealth(): TokenHealth {
  if (healthCache) return healthCache;
  const data = getStyleguide();
  const files = scanFiles();

  const defined = new Set<string>();
  for (const s of [...data.root, ...data.theme]) for (const t of s.tokens) defined.add(t.name);

  // Every var(--x) reference, everywhere.
  const refs = new Map<string, Set<string>>(); // name -> files
  const unguarded = new Set<string>(); // names referenced ≥once with NO fallback
  for (const { file, text } of files) {
    for (const m of usageText(file, text).matchAll(/var\((--[\w-]+)\s*([,)])/g)) {
      if (!refs.has(m[1])) refs.set(m[1], new Set());
      refs.get(m[1])!.add(file);
      if (m[2] === ")") unguarded.add(m[1]);
    }
  }

  // Definitions outside :root are real too: component-scoped custom
  // properties in any CSS selector, style={{ "--x": … }} inline, and
  // el.style.setProperty("--x", …).
  const inlineDefs = new Set<string>();
  for (const { file, text } of files) {
    for (const m of text.matchAll(/["'](--[\w-]+)["']\s*[:,]/g)) inlineDefs.add(m[1]);
    if (file.endsWith(".css")) {
      for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) inlineDefs.add(m[1]);
    }
  }

  // A product's imported tokens are real definitions, just not this file's.
  const known = new Set([...defined, ...data.imported]);
  const undefinedRefs = [...refs.entries()]
    .filter(([name]) => !known.has(name) && !inlineDefs.has(name) && !name.startsWith("--tw-"))
    .map(([name, fileSet]) => ({
      name,
      count: fileSet.size,
      files: [...fileSet].sort(),
      guarded: !unguarded.has(name),
    }))
    .sort((a, b) => Number(a.guarded) - Number(b.guarded) || b.count - a.count);

  healthCache = { defined: defined.size, undefinedRefs };
  return healthCache;
}

/* ── Tailwind utility names ─────────────────────────────────────────────
   The @theme layer is what makes tokens typeable as utilities; these two
   helpers turn a theme token into the class a developer writes, and map a
   :root token back to its utility via the theme alias that targets it. */

export function utilityFor(themeToken: string): string {
  const rules: [RegExp, (s: string) => string][] = [
    [/^--color-fg-(.+)/, (s) => `text-fg-${s}`],
    [/^--color-edge-(.+)/, (s) => `border-edge-${s}`],
    [/^--color-(.+)/, (s) => `bg-${s}`],
    [/^--spacing-(.+)/, (s) => `gap-${s} · p-${s}`],
    [/^--radius-(.+)/, (s) => `rounded-${s}`],
    [/^--shadow-(.+)/, (s) => `shadow-${s}`],
    [/^--text-(.+)/, (s) => `text-${s}`],
    [/^--font-weight-(.+)/, (s) => `font-${s}`],
    [/^--font-(.+)/, (s) => `font-${s}`],
    [/^--leading-(.+)/, (s) => `leading-${s}`],
    [/^--tracking-(.+)/, (s) => `tracking-${s}`],
    [/^--breakpoint-(.+)/, (s) => `${s}:*`],
    [/^--container-(.+)/, (s) => `max-w-${s}`],
  ];
  for (const [re, fn] of rules) {
    const m = themeToken.match(re);
    if (m) return fn(m[1]);
  }
  return themeToken;
}

/** :root token name → the Tailwind utility exposed for it (via @theme). */
export function utilityByRootToken(): Map<string, string> {
  const data = getStyleguide();
  const map = new Map<string, string>();
  for (const s of data.theme) {
    for (const t of s.tokens) {
      if (t.target && t.target !== t.name && !map.has(t.target)) {
        map.set(t.target, utilityFor(t.name));
      }
    }
  }
  return map;
}

/* ── Component inventory (derived from the shared component dirs) ───── */

// A component is shared when its file sits in one of these directories, and
// only then: the components page and the inspector list nothing else, so a
// piece anywhere else joins by moving here.

export function getComponentInventory(): ComponentGroup[] {
  const groups: ComponentGroup[] = [];
  for (const dir of ["ui", "overlays", "layout"]) {
    const full = path.join(process.cwd(), "components", dir);
    if (!fs.existsSync(full)) continue;
    const components = fs
      .readdirSync(full)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => ({ name: f.replace(/\.tsx$/, ""), file: `components/${dir}/${f}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    groups.push({ dir, components });
  }
  return groups;
}

/* ── Component details (derived from each component's own source) ──────
   The component file is the truth about the component: its docblock is the
   why (the convention in component-patterns.md), its variant maps are the
   range, its callsites are the census. Parsed here so the inspector and the
   styleguide derive rather than author — same law as the token parse above.
   Every field is best-effort: a component the heuristics can't read gets
   nulls and empty lists, never an error. */

export interface ComponentVariant {
  /** The map constant's name, e.g. "TONES" — a hint at the prop it backs. */
  map: string;
  name: string; // "brand"
  classes: string; // "bg-brand-subtle text-brand-strong"
}

export interface ComponentDetail extends ComponentEntry {
  /** The leading doc comment's prose, flattened to one string, with the guide
   *  tags below lifted out of it. Null = not written. */
  docblock: string | null;
  /** `@when` — when to reach for this component. Null = the docblock does not
   *  say, which the surfaces render as a named absence. */
  whenToUse: string | null;
  /** `@whenNot` — when to reach for something else instead. */
  whenNot: string | null;
  /** Static class tokens identifying the root element — lets the inspector
   *  recognize SERVER components, which never appear in the client fiber
   *  tree. Heuristic: the longest static run (≥3 tokens) across the file's
   *  class strings, after resolving string constants imported from same-dir
   *  style modules (the buttonStyles.ts pattern). */
  signature: string[] | null;
  /** Lowercased root element tags this component renders (`<Link>` counts
   *  as "a"). Disambiguates components sharing one skin: Button and
   *  LinkButton wear the same base classes on different tags. */
  rootTags: string[];
  variants: ComponentVariant[];
  /** Callsites outside the component's own file and the styleguide's demo
   *  registry. */
  usage: { count: number; files: string[] };
  /** The other shared components it belongs with, each group labelled by a
   *  reason a reader can check from the inventory (`SiblingGroup`). Empty
   *  when nothing qualifies. */
  siblings: SiblingGroup[];
}

/** Shared components grouped by something they verifiably share. Two reasons
 *  only, because a grouping that cannot name its reason is a false one:
 *
 *  - `module` — they wear the same same-dir style module: each imports it,
 *    and it carries a variant map or a class string the component names
 *    (Button and LinkButton both wear `buttonStyles`). A shared helper with
 *    no styling in it is not a skin.
 *  - `name` — their names share a PascalCase word (Toggle, PillToggle and
 *    ThemeToggle share `Toggle`).
 *
 *  A group is reported only when it adds a component no stronger group has
 *  already named, so a pair that shares a skin AND a word appears once, by
 *  its skin. */
export interface SiblingGroup {
  reason: "module" | "name";
  /** What they share: the module's name ("buttonStyles") or the word. */
  shared: string;
  /** The module's path, for a `module` group; null for a `name` group. */
  file: string | null;
  /** Every component in the group, this one included, in inventory order. */
  members: string[];
}

/** The component's own doc comment, split into prose and the two guide tags.
 *
 *  **The comment has to open at column 0.** Every docblock that follows the
 *  convention opens a file or a top-level declaration, and the obvious rule —
 *  the first `/**` anywhere in the file — reads an indented *property* comment
 *  as the component's description. `TabBar` has no docblock, and both surfaces
 *  reported its `Tab.badge` field comment ("Optional badge count — renders a
 *  small dot/number next to the label…") as what TabBar is. A wrong answer is
 *  worse than none here: none is the nudge to write one, and the miss was
 *  invisible for as long as something plausible stood in its place.
 *
 *  Known limit: a top-level doc comment on a helper declared *above* the
 *  component would still be taken. Nothing in the shared dirs does that.
 *
 *  **The tags are `@when` and `@whenNot`** — when to reach for the component,
 *  and when to reach for something else (`component-patterns.md` → The
 *  docblock is a component's one-home "why"). A tag runs to the next tag or
 *  the end of the comment, so either may wrap. Both are lifted out of the
 *  prose, so the "what" stays a description and the page can render the three
 *  as the three separate answers they are. */
function parseDocblock(raw: string): {
  prose: string | null;
  whenToUse: string | null;
  whenNot: string | null;
} {
  const block = raw.match(/^\/\*\*([\s\S]*?)\*\//m);
  if (!block) return { prose: null, whenToUse: null, whenNot: null };

  const parts: { tag: string; lines: string[] }[] = [{ tag: "", lines: [] }];
  for (const line of block[1].split("\n").map((l) => l.replace(/^\s*\*?\s?/, ""))) {
    const tag = line.match(/^@(whenNot|when)\b\s*(.*)$/);
    if (tag) parts.push({ tag: tag[1], lines: [tag[2]] });
    else parts[parts.length - 1].lines.push(line);
  }

  const flatten = (tag: string) => {
    const found = parts.filter((p) => p.tag === tag);
    if (!found.length) return null;
    return found.flatMap((p) => p.lines).join(" ").replace(/\s+/g, " ").trim() || null;
  };
  return { prose: flatten(""), whenToUse: flatten("when"), whenNot: flatten("whenNot") };
}

/** String constants and Record<...> variant maps from one source file.
 *  Constants holding template expressions are skipped — only fully static
 *  strings can serve as substitution values. */
function parseStyleSource(raw: string): { consts: Map<string, string>; maps: ComponentVariant[] } {
  const consts = new Map<string, string>();
  for (const m of raw.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*["'`]([^"'`]+)["'`]/g)) {
    if (!m[2].includes("${")) consts.set(m[1], m[2]);
  }
  const maps: ComponentVariant[] = [];
  for (const m of raw.matchAll(/(?:export\s+)?const\s+(\w+)\s*:\s*Record<[^>]+>\s*=\s*\{([\s\S]*?)\};/g)) {
    for (const e of m[2].matchAll(/(\w+):\s*"([^"]+)"/g)) {
      maps.push({ map: m[1], name: e[1], classes: e[2] });
    }
  }
  return { consts, maps };
}

/** A run of tokens reads as classes when most carry a hyphen or a colon, so
 *  a prose string can never pass for styling. */
function classy(tokens: string[]): boolean {
  return tokens.filter((t) => t.includes("-") || t.includes(":")).length >= tokens.length * 0.6;
}

/** "ThemeToggle" → ["Theme", "Toggle"]; an acronym stays whole ("URLInput"
 *  → ["URL", "Input"]). */
function nameWords(name: string): string[] {
  return [...new Set(name.match(/[A-Z]+(?![a-z])|[A-Z][a-z0-9]*/g) ?? [name])];
}

let detailCache: ComponentDetail[] | null = null;

export function getComponentDetails(): ComponentDetail[] {
  if (detailCache) return detailCache;
  const inventory = getComponentInventory().flatMap((g) => g.components);
  // Comment-stripped, and the census's scan: the styleguide's own chrome is a
  // real callsite, its demo registry is not.
  const scanned = scanFiles(CENSUS_EXCLUDE);
  const moduleCache = new Map<string, { consts: Map<string, string>; maps: ComponentVariant[] }>();
  /** Component name → the same-dir style modules it wears, by path. */
  const skins = new Map<string, string[]>();

  detailCache = inventory.map((c) => {
    const raw = fs.readFileSync(path.join(process.cwd(), c.file), "utf-8");

    const { prose: docblock, whenToUse, whenNot } = parseDocblock(raw);

    // The component's own constants plus those of same-dir modules it
    // imports (`./buttonStyles`) — the shared-skin pattern.
    const own = parseStyleSource(raw);
    const consts = new Map(own.consts);
    const maps = [...own.maps];
    const worn: string[] = [];
    for (const im of raw.matchAll(/from\s+["']\.\/(\w+)["']/g)) {
      const modPath = path.join(path.dirname(c.file), `${im[1]}.ts`);
      if (!moduleCache.has(modPath)) {
        const full = path.join(process.cwd(), modPath);
        moduleCache.set(
          modPath,
          fs.existsSync(full)
            ? parseStyleSource(fs.readFileSync(full, "utf-8"))
            : { consts: new Map(), maps: [] }
        );
      }
      const mod = moduleCache.get(modPath)!;
      for (const [k, v] of mod.consts) consts.set(k, v);
      maps.push(...mod.maps);
      // Worn, not merely imported: the module carries styling this file
      // names. A module that does not resolve parses empty and never counts.
      const styled =
        mod.maps.some((v) => raw.includes(v.map)) ||
        [...mod.consts].some(([k, v]) => raw.includes(k) && classy(v.trim().split(/\s+/)));
      if (styled) worn.push(`${path.posix.dirname(c.file)}/${im[1]}.ts`);
    }
    skins.set(c.name, [...new Set(worn)]); // a type import and a value import are one module

    // Signature: every class-ish string in the file — className attributes
    // AND template literals assigned to variables (LinkButton builds its
    // `classes` string outside the JSX). Resolvable ${CONST} refs are
    // substituted; unresolvable ones become hard segment breaks (a NUL
    // escape, so they cannot merge neighbors the way a space would). A
    // segment only counts when most tokens carry a hyphen or colon, so a
    // prose template literal can never become a signature.
    const BREAK = "\u0000";
    const expand = (tpl: string) =>
      tpl
        .replace(/\$\{(\w+)\}/g, (_, n: string) => consts.get(n) ?? BREAK)
        .replace(/\$\{[^}]*\}/g, BREAK)
        // A `${…}` whose expression contains a nested template literal is cut
        // in half by the outer backtick match above, so its `}` never arrives
        // and the `[^}]*` form cannot see it. What is left is a live `${`
        // that rode into the signature as class tokens: Input's read
        // `…focus:outline-none${className ?`, and the inspector identifies
        // SERVER components by this string. An unterminated expression breaks
        // the segment the way a resolvable one does, keeping the valid prefix.
        .replace(/\$\{[\s\S]*$/, BREAK);
    let signature: string[] | null = null;
    const candidates = [
      ...[...raw.matchAll(/className="([^"]+)"/g)].map((m) => m[1]),
      ...[...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1]),
    ];
    for (const cand of candidates) {
      for (const segment of expand(cand).split(BREAK)) {
        const tokens = segment.trim().split(/\s+/).filter(Boolean);
        if (tokens.length >= 3 && classy(tokens) && tokens.length > (signature?.length ?? 0)) {
          signature = tokens;
        }
      }
    }

    const rootTags = [
      ...new Set(
        [...raw.matchAll(/return\s*\(?\s*<(\w+)/g)]
          .map((m) => (m[1] === "Link" ? "a" : m[1]))
          .filter((t) => /^[a-z]/.test(t))
      ),
    ];

    // Only variant maps the component actually references are its variants.
    const variants = maps.filter((v) => raw.includes(v.map));

    const use = new RegExp(`<${c.name}[\\s/>]`, "g");
    let count = 0;
    const files: string[] = [];
    for (const f of scanned) {
      if (f.file === c.file) continue;
      const hits = f.text.match(use)?.length ?? 0;
      if (hits > 0) {
        count += hits;
        files.push(f.file);
      }
    }

    return {
      ...c,
      docblock,
      whenToUse,
      whenNot,
      signature,
      rootTags,
      variants,
      usage: { count, files: files.sort() },
      siblings: [],
    };
  });

  // Siblings need the whole inventory, so they are a second pass.
  const byModule = new Map<string, string[]>();
  const byWord = new Map<string, string[]>();
  const join = (map: Map<string, string[]>, key: string, name: string) =>
    map.set(key, [...(map.get(key) ?? []), name]);
  for (const d of detailCache) {
    for (const m of skins.get(d.name) ?? []) join(byModule, m, d.name);
    for (const w of nameWords(d.name)) join(byWord, w, d.name);
  }
  for (const d of detailCache) {
    const named = new Set([d.name]);
    const offer = (group: SiblingGroup) => {
      if (group.members.every((m) => named.has(m))) return;
      d.siblings.push(group);
      for (const m of group.members) named.add(m);
    };
    for (const file of skins.get(d.name) ?? []) {
      offer({ reason: "module", shared: path.posix.basename(file, ".ts"), file, members: byModule.get(file)! });
    }
    // A name's last word is what the thing is (a ThemeToggle is a toggle);
    // the words before it say what it is for. So the last word's group,
    // the likelier one to do the same job, comes first.
    for (const w of nameWords(d.name).reverse()) {
      offer({ reason: "name", shared: w, file: null, members: byWord.get(w)! });
    }
  }
  return detailCache;
}

/* ── The census: who reaches for each token and component ──────────────
   Every label the page carries about whose a token is comes from here, and
   from nothing authored but DASHBOARD above. A route file is the dashboard's
   when it sits in DASHBOARD and the product's otherwise; a component or a
   module is whoever's imports it, followed to a fixpoint, so `Button` used
   only by the dashboard is the dashboard's. A file reaches a token through
   `var(--x)` or through the Tailwind utility the @theme layer exposes for it,
   and a token reaches the tokens its value reads, in every scope, so a
   primitive is reached through the semantic token that names it.

   A mount whose project has no code in this codebase (an example that ships
   docs only) passes `withProduct: false`: the product side is not there to
   reach anything, and every label reads from the dashboard alone. */

export type Reach = "product" | "dashboard" | "both" | "none";

export interface Census {
  /** Whether a product side exists: code outside DASHBOARD and the frame
   *  reaches for at least one token. */
  product: boolean;
  /** :root and @theme tokens. Imported tokens are never censused. */
  tokens: Map<string, Reach>;
  /** Shared components, by name, from who imports them. */
  components: Map<string, Reach>;
}

type Side = "product" | "dashboard" | "base";

/** The Tailwind v4 utility namespaces each @theme family feeds, as regex
 *  alternations. Wider than `utilityFor`, which names the one class a
 *  developer is shown; the census has to catch every class that reads it. */
const UTILITY_PREFIXES: [RegExp, string][] = [
  [/^--color-(.+)/, "bg|text|border(?:-[trblxyse])?|outline|ring(?:-offset)?|fill|stroke|decoration|divide|placeholder|caret|accent|shadow|from|via|to"],
  [/^--spacing-(.+)/, "p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-[wh]|max-[wh]|inset(?:-[xy])?|top|right|bottom|left|start|end|translate-[xy]|scroll-[mp][xytrblse]?|indent|basis"],
  [/^--radius-(.+)/, "rounded(?:-(?:[trblse]|tl|tr|bl|br|ss|se|es|ee))?"],
  [/^--shadow-(.+)/, "shadow"],
  [/^--text-(.+)/, "text"],
  [/^--font-weight-(.+)/, "font"],
  [/^--font-(.+)/, "font"],
  [/^--leading-(.+)/, "leading"],
  [/^--tracking-(.+)/, "tracking"],
  [/^--container-(.+)/, "max-w|w|min-w|basis"],
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** One regex per @theme token, matching any utility class that reads it. */
function utilityMatchers(theme: TokenSection[]): { name: string; re: RegExp }[] {
  const out: { name: string; re: RegExp }[] = [];
  for (const t of theme.flatMap((s) => s.tokens)) {
    const bp = t.name.match(/^--breakpoint-(.+)/);
    if (bp) {
      out.push({ name: t.name, re: new RegExp(`(?<![\\w-])${escapeRe(bp[1])}:`) });
      continue;
    }
    for (const [ns, prefixes] of UTILITY_PREFIXES) {
      const m = t.name.match(ns);
      if (!m) continue;
      out.push({ name: t.name, re: new RegExp(`(?<![\\w-])-?(?:${prefixes})-${escapeRe(m[1])}(?![\\w-])`) });
      break;
    }
  }
  return out;
}

/** `@/x`, `./x`, `../x` → the scanned file it names, or null. */
function resolveImport(from: string, spec: string, known: Set<string>): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = path.join(path.dirname(from), spec);
  else return null;
  for (const ext of ["", ".tsx", ".ts", path.join("/", "index.tsx"), path.join("/", "index.ts")]) {
    const candidate = path.normalize(base + ext);
    if (known.has(candidate)) return candidate;
  }
  return null;
}

const censusCache = new Map<boolean, Census>();

export function getCensus(withProduct = true): Census {
  const cached = censusCache.get(withProduct);
  if (cached) return cached;
  const data = getStyleguide();
  const files = scanFiles(CENSUS_EXCLUDE);
  const known = new Set(files.map((f) => f.file));

  // 1. Each file's sides. Route files are rooted by where they sit; every
  //    other file inherits from whoever imports it.
  const sides = new Map<string, Set<Side>>();
  const importers = new Map<string, Set<string>>();
  for (const { file, text } of files) {
    const own = new Set<Side>();
    if (DASHBOARD.some((d) => file.startsWith(d))) own.add("dashboard");
    else if (BASE.includes(file)) own.add("base");
    else if (file.startsWith(`app${path.sep}`)) own.add("product");
    sides.set(file, own);
    for (const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g)) {
      const target = resolveImport(file, m[1], known);
      if (!target || target === file) continue;
      if (!importers.has(target)) importers.set(target, new Set());
      importers.get(target)!.add(file);
    }
  }
  const rooted = new Set(files.filter((f) => sides.get(f.file)!.size).map((f) => f.file));
  for (let changed = true; changed; ) {
    changed = false;
    for (const [target, from] of importers) {
      if (rooted.has(target)) continue;
      const mine = sides.get(target)!;
      for (const f of from) {
        for (const s of sides.get(f) ?? []) {
          if (!mine.has(s)) {
            mine.add(s);
            changed = true;
          }
        }
      }
    }
  }

  // 2. What each piece of code reaches for directly, with the sides it
  //    serves. A file is one piece. globals.css is one per rule: an element
  //    rule (`body`) is the frame, and a class rule (`.pill`) is whoever
  //    writes that class, so a component's styles kept there label their
  //    tokens by the component's callers, not as everyone's.
  const matchers = utilityMatchers(data.theme);
  const reached = (body: string, css: boolean) => {
    const hits = new Set<string>();
    for (const m of body.matchAll(/var\((--[\w-]+)/g)) hits.add(m[1]);
    if (!css) for (const { name, re } of matchers) if (re.test(body)) hits.add(name);
    return hits;
  };
  const code = files.filter((f) => !f.file.endsWith(".css"));
  const writers = (cls: string) => {
    const re = new RegExp(`(?<![\\w-])${escapeRe(cls)}(?![\\w-])`);
    const out = new Set<Side>();
    for (const f of code) if (re.test(f.text)) for (const side of sides.get(f.file) ?? []) out.add(side);
    return out;
  };
  const pieces: { sides: Set<Side>; hits: Set<string> }[] = [];
  for (const { file, text } of files) {
    const body = usageText(file, text);
    if (file !== path.join("app", "globals.css")) {
      const hits = reached(body, file.endsWith(".css"));
      if (hits.size) pieces.push({ sides: sides.get(file) ?? new Set(), hits });
      continue;
    }
    // Innermost blocks only, so a rule inside @media is read on its own.
    for (const m of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const hits = reached(m[2], true);
      if (!hits.size) continue;
      const cls = m[1].match(/\.([\w-]+)/)?.[1];
      pieces.push({ sides: cls ? writers(cls) : new Set<Side>(["base"]), hits });
    }
  }

  // 3. Is there a product side? Something product-side reaches a token.
  const product = withProduct && pieces.some((p) => p.sides.has("product"));
  const settle = (s: Set<Side>): Set<"product" | "dashboard"> => {
    const out = new Set<"product" | "dashboard">();
    if (s.has("dashboard") || s.has("base")) out.add("dashboard");
    if (product && (s.has("product") || s.has("base"))) out.add("product");
    return out;
  };

  // 4. Tokens: direct reach, then down every alias edge to a fixpoint.
  const tokenSides = new Map<string, Set<"product" | "dashboard">>();
  const add = (name: string, from: Set<"product" | "dashboard">) => {
    if (!tokenSides.has(name)) tokenSides.set(name, new Set());
    const mine = tokenSides.get(name)!;
    let grew = false;
    for (const s of from) if (!mine.has(s)) (mine.add(s), (grew = true));
    return grew;
  };
  for (const piece of pieces) {
    const s = settle(piece.sides);
    for (const name of piece.hits) add(name, s);
  }
  for (let changed = true; changed; ) {
    changed = false;
    for (const [name, targets] of aliasEdges) {
      const from = tokenSides.get(name);
      if (!from?.size) continue;
      for (const t of targets) if (add(t, from)) changed = true;
    }
  }

  const reach = (s: Set<"product" | "dashboard"> | undefined): Reach =>
    s?.has("product") && s.has("dashboard")
      ? "both"
      : s?.has("product")
        ? "product"
        : s?.has("dashboard")
          ? "dashboard"
          : "none";

  const tokens = new Map<string, Reach>();
  for (const t of [...data.root, ...data.theme].flatMap((s) => s.tokens)) {
    if (!tokens.has(t.name)) tokens.set(t.name, reach(tokenSides.get(t.name)));
  }
  const components = new Map<string, Reach>();
  for (const c of getComponentInventory().flatMap((g) => g.components)) {
    components.set(c.name, reach(settle(sides.get(path.normalize(c.file)) ?? new Set())));
  }

  const census = { product, tokens, components };
  censusCache.set(withProduct, census);
  return census;
}

/* ── The product's design home, read from the record ───────────────────
   Where a product's design lives outside this set (another app, its own
   token file, a page of its own), the styleguide points at it rather than
   describing it. The pointer is the feature doc carrying `area: design` in
   its frontmatter, and the `routes:` it names; the feature registry already
   parses both, so the page passes its docs in and nothing here is authored.
   Several such docs are several doors. */

export interface DesignHome {
  title: string;
  /** Path under docs/, for the doc reader. */
  relPath: string;
  routes: string[];
}

export function getDesignHomes(
  docs: { dir: string; area: string | null; title: string; relPath: string; routes: string[] }[],
): DesignHome[] {
  return docs
    .filter((d) => d.dir === "features" && d.area === "design")
    .map((d) => ({ title: d.title, relPath: d.relPath, routes: d.routes }));
}
