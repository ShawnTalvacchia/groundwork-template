import { REACH_LABEL } from "@/lib/reach";
import type { ComponentDetail, Reach, SiblingGroup } from "@/lib/styleguide";

/**
 * Client-side resolution for the element inspector: turn a pinned element's
 * computed styles back into design-system token NAMES. Token names are the
 * system's vocabulary (globals.css: names are load-bearing, values are
 * yours), so the inspector reports names, never bare values.
 *
 * How matching works: token values as authored (oklch, rem, keywords) and an
 * element's computed styles (rgb/oklch serializations, px) rarely compare
 * equal as strings. So every token is probed once per pin through a hidden
 * element, letting the browser canonicalize both sides into the same
 * serialization before comparison. Probing ~200 tokens is single-digit
 * milliseconds, and doing it per pin keeps the index correct across theme
 * flips without watching `data-theme`.
 *
 * No "use client" directive on purpose: these are plain functions imported
 * only by the overlay (see component-patterns.md on style constants for the
 * general rule). What it takes from lib/styleguide.ts is types only, which
 * compile away; a value from there would pull `node:fs` into the browser.
 */

export interface InspectorToken {
  name: string; // "--text-primary"
  raw: string; // "var(--neutral-900)" — the authored chain, for context
  utility: string | null; // "text-fg-primary" — the Tailwind name, if mapped
}

/** A shared component as the feed serves it: everything the build derives
 *  from its file, so this type cannot fall behind the parser, plus whose it
 *  is and where its styleguide entry sits. */
export interface InspectorComponent extends ComponentDetail {
  /** Who reaches for it: the census the styleguide labels with. */
  reach: Reach;
  /** Its entry on the styleguide's components page. */
  url: string;
}

export interface InspectorPattern {
  title: string;
  body: string;
  /** Deep link to this exact rule on the rendered doc page. */
  url: string;
}

export interface InspectorData {
  project: string;
  tokens: InspectorToken[];
  components: InspectorComponent[];
  patterns: InspectorPattern[];
  /** Where a missing rule would be written — the "none recorded" nudge links
   *  here, so a documentation gap is one click from being filled. */
  patternsDocUrl: string;
  /** `path` is repo-relative for a session to open; `url` is the rendered
   *  page for the human. A page that is not a doc carries no path. */
  docs: { label: string; path: string | null; url: string }[];
}

/**
 * Split a docblock into its summary sentence and the depth behind it.
 *
 * Shared components open with "Name — one line of what it is." and then
 * explain themselves, so the first sentence is already a written summary and
 * the panel can honor that convention rather than truncating blindly. The
 * panel shows the head and puts `rest` behind a toggle; the copy block always
 * sends the whole thing, because a session has the budget for it and a reader
 * squinting at a 24rem panel does not.
 */
export function summaryOf(docblock: string): { head: string; rest: string } {
  // `[\s\S]` rather than `.` with the `s` flag: the build's TS target predates
  // dotAll, and a docblock arrives already flattened but may still hold one.
  const m = docblock.match(/^([\s\S]*?[.!?])\s+([\s\S]+)$/);
  return m ? { head: m[1], rest: m[2] } : { head: docblock, rest: "" };
}

/** Shared UI rules that name this component. One home for the match, so the
 *  panel and the copy block can never disagree about what applies. */
export function rulesFor(
  data: InspectorData | null,
  componentName: string
): InspectorPattern[] {
  return data?.patterns.filter((p) => `${p.title} ${p.body}`.includes(componentName)) ?? [];
}

export interface TokenMatch {
  /** CSS property being reported, e.g. "color", "padding". */
  property: string;
  /** The computed value that matched, e.g. "rgb(33, 38, 46)" or "8px". */
  value: string;
  /** Matching token names, best first. Empty = no token matched. */
  tokens: InspectorToken[];
}

interface TokenIndex {
  colors: Map<string, InspectorToken[]>;
  lengths: Map<string, InspectorToken[]>;
  shadows: Map<string, InspectorToken[]>;
  weights: Map<string, InspectorToken[]>;
  /** Font-family tokens with their resolved first family, lowercased. */
  fonts: { token: InspectorToken; family: string }[];
}

/** Semantic names beat raw ramp steps ("--neutral-200") in reports; a token
 *  the @theme layer maps to a utility is the public API and beats both. */
function rank(t: InspectorToken): number {
  if (t.utility) return 0;
  if (!/-\d{2,4}$/.test(t.name)) return 1;
  return 2;
}

function push(map: Map<string, InspectorToken[]>, key: string, t: InspectorToken) {
  const list = map.get(key) ?? [];
  list.push(t);
  list.sort((a, b) => rank(a) - rank(b));
  map.set(key, list);
}

/** Build the value → token-name index for the CURRENT theme. `probe` must be
 *  an element the caller owns that draws no box (`display: none`), so a
 *  length reads back from style, exact at any page zoom, never from layout. */
export function buildIndex(tokens: InspectorToken[], probe: HTMLElement): TokenIndex {
  const index: TokenIndex = {
    colors: new Map(),
    lengths: new Map(),
    shadows: new Map(),
    weights: new Map(),
    fonts: [],
  };
  const rootStyle = getComputedStyle(document.documentElement);
  const probeStyle = getComputedStyle(probe);

  for (const t of tokens) {
    const value = rootStyle.getPropertyValue(t.name).trim();
    if (!value) continue;

    // Order matters: "0.9375rem" contains letters but is a length, and a
    // bare "0" parses as several things. Colors, then lengths, then shadows,
    // and font families only as the fallback for --font-* names.
    if (t.name.startsWith("--font-weight-")) {
      push(index.weights, value, t);
      continue;
    }
    if (CSS.supports("color", value)) {
      probe.style.color = "";
      probe.style.color = value;
      if (probe.style.color) push(index.colors, probeStyle.color, t);
      continue;
    }
    if (!value.endsWith("%") && CSS.supports("width", value)) {
      probe.style.width = "";
      probe.style.width = value;
      if (probe.style.width) push(index.lengths, probeStyle.width, t);
      continue;
    }
    if (CSS.supports("box-shadow", value)) {
      probe.style.boxShadow = "";
      probe.style.boxShadow = value;
      if (probe.style.boxShadow && probeStyle.boxShadow !== "none") {
        push(index.shadows, probeStyle.boxShadow, t);
        continue;
      }
    }
    if (/^--font-/.test(t.name) && /[a-zA-Z]/.test(value)) {
      const family = value.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
      if (family) index.fonts.push({ token: t, family });
    }
  }
  return index;
}

const TRANSPARENT = new Set(["rgba(0, 0, 0, 0)", "transparent"]);

/** Several tokens can resolve to one value (white is a surface AND a text
 *  color; --radius-sm and --space-sm are both 8px). The property being
 *  reported disambiguates: put the token family that property draws from
 *  first, keep the rank order within each half.
 *
 *  Every reported property must go through this. It is not a nicety on top of
 *  rank() — rank() cannot separate the radius/space collision at all, and on
 *  the full feed it only appears to, because the @theme layer retargets
 *  --space-sm (via --spacing-sm) and gives it a utility while --radius-sm
 *  retargets nothing and gets none. On a gated deploy tokensFromStylesheets()
 *  drops every utility, both tokens rank equal, and the stable sort falls
 *  through to declaration order, where --radius-* is written first. Padding
 *  used to skip this call and reported --radius-sm for an 8px pad.
 *
 *  A length takes its own family or nothing. A font-size is never a spacing
 *  token, however equal the pixels: a container inheriting the browser's
 *  16px reported --space-lg. So for these properties the other families are
 *  dropped, and a value only they match reads as "not a token". Colors keep
 *  the other families behind their own, since brand text and a status fill
 *  are real tokens from outside the property's usual family. */
const PREFER: Record<string, RegExp> = {
  color: /^--text-/,
  background: /^--(surface|brand|status)-/,
  "border-color": /^--border-/,
  "font-size": /^--font-size-/,
  "border-radius": /^--radius-/,
  padding: /^--space-/,
  gap: /^--space-/,
};

const OWN_FAMILY_ONLY = new Set(["font-size", "border-radius", "padding", "gap"]);

function byProperty(property: string, tokens: InspectorToken[]): InspectorToken[] {
  const re = PREFER[property];
  if (!re) return tokens;
  const own = tokens.filter((t) => re.test(t.name));
  return OWN_FAMILY_ONLY.has(property) ? own : [...own, ...tokens.filter((t) => !re.test(t.name))];
}

/** Resolve one element's computed styles against the index. Only properties
 *  that are visibly in play are reported; unmatched values are kept (with an
 *  empty token list) so the report says "not a token" out loud. */
export function resolveElement(el: Element, index: TokenIndex): TokenMatch[] {
  const cs = getComputedStyle(el);
  const out: TokenMatch[] = [];

  const color = (property: string, value: string) => {
    if (!value || TRANSPARENT.has(value)) return;
    out.push({ property, value, tokens: byProperty(property, index.colors.get(value) ?? []) });
  };
  const length = (property: string, value: string) => {
    if (!value || value === "0px") return;
    out.push({ property, value, tokens: byProperty(property, index.lengths.get(value) ?? []) });
  };

  color("color", cs.color);
  color("background", cs.backgroundColor);
  if (parseFloat(cs.borderTopWidth) > 0) color("border-color", cs.borderTopColor);

  length("font-size", cs.fontSize);

  const weightTokens = index.weights.get(cs.fontWeight);
  if (weightTokens?.length) out.push({ property: "font-weight", value: cs.fontWeight, tokens: weightTokens });

  const firstFamily = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
  const fontHit = index.fonts.find((f) => f.family === firstFamily);
  if (fontHit) out.push({ property: "font-family", value: firstFamily, tokens: [fontHit.token] });

  length("border-radius", cs.borderTopLeftRadius);
  if (cs.boxShadow !== "none") {
    out.push({ property: "shadow", value: cs.boxShadow, tokens: index.shadows.get(cs.boxShadow) ?? [] });
  }

  const sides = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
  for (const v of [...new Set(sides)]) length("padding", v);
  if ((cs.display.includes("flex") || cs.display.includes("grid")) && cs.gap !== "normal") {
    for (const v of [...new Set(cs.gap.split(" "))]) length("gap", v);
  }

  return out;
}

/** Best-effort React component identity via the fiber tree. Component names
 *  survive in dev; production minification erases most, so callers must
 *  treat null / unknown as normal, not as an error. */
/* ── Component identity ──────────────────────────────────────────────────
   Two detectors, inventory matches ONLY:

   1. SIGNATURE — the component's static class tokens (parsed from its source
      at build) checked against the pinned element and its ancestors,
      innermost first. This is what identifies SERVER components, which never
      appear in the client fiber tree.
   2. FIBER — the client-component fallback. Names in the fiber tree are only
      trusted when they match the inventory: the plumbing between an element
      and its component also reads as PascalCase (LinkComponent,
      SegmentViewNode, InnerScrollAndFocusHandlerOld…), and no suffix pattern
      keeps up with it, so unknown names are never reported.

   Null is still a normal answer — identity stays best-effort. */

export interface IdentifiedComponent {
  component: InspectorComponent;
  /** Variant names whose classes are all present on the matched node. */
  activeVariants: string[];
}

function withVariants(component: InspectorComponent, node: Element): IdentifiedComponent {
  const activeVariants = component.variants
    .filter((v) => v.classes.split(/\s+/).every((t) => node.classList.contains(t)))
    .map((v) => v.name);
  return { component, activeVariants };
}

function fiberName(el: Element, known: Set<string>): string | null {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
  if (!key) return null;
  // The fiber node hangs off the DOM element under a per-render key.
  let fiber = (el as unknown as Record<string, unknown>)[key] as
    | { type: unknown; return: unknown }
    | null;
  while (fiber) {
    const t = fiber.type as { displayName?: string; name?: string; render?: { name?: string } } | string | null;
    const name =
      typeof t === "function" || (t && typeof t === "object")
        ? ((t as { displayName?: string }).displayName ??
          (t as { name?: string }).name ??
          (t as { render?: { name?: string } }).render?.name ??
          null)
        : null;
    if (name && known.has(name)) return name;
    fiber = fiber.return as typeof fiber;
  }
  return null;
}

export function identifyComponent(
  el: Element,
  components: InspectorComponent[]
): IdentifiedComponent | null {
  let node: Element | null = el;
  for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
    const tag = node.tagName.toLowerCase();
    for (const c of components) {
      if (c.rootTags.length > 0 && !c.rootTags.includes(tag)) continue;
      if (c.signature && c.signature.every((t) => node!.classList.contains(t))) {
        return withVariants(c, node);
      }
    }
  }
  const name = fiberName(el, new Set(components.map((c) => c.name)));
  if (name) {
    const c = components.find((x) => x.name === name)!;
    return withVariants(c, el);
  }
  return null;
}

/** Fallback token list when the data route is unreachable (a gated deploy):
 *  read :root custom properties straight from the same-origin stylesheets.
 *  Names and current values only — no authored chains, no utilities.
 *
 *  Every rule is walked, not just the top level, because compiled CSS does
 *  not keep :root flat, and how it nests depends on the build. Tailwind
 *  writes its theme variables inside `@layer theme`, a mobile override sits
 *  inside `@media`, and the fallback the compiler adds for `color-mix()` is
 *  an `@supports` block: unminified, it sits inside :root, and every later
 *  declaration moves into a nested rule; minified, :root is split around it.
 *  A reader of top-level :root rules alone missed the theme layer in every
 *  build, and in dev reported every token after the first `color-mix()` as
 *  off the design system. */
export function tokensFromStylesheets(): InspectorToken[] {
  const names = new Set<string>();
  const walk = (rules: CSSRuleList, underRoot: boolean) => {
    for (const rule of Array.from(rules)) {
      const root = underRoot || (rule instanceof CSSStyleRule && rule.selectorText.includes(":root"));
      const { style, cssRules } = rule as CSSRule & { style?: CSSStyleDeclaration; cssRules?: CSSRuleList };
      if (root && style) {
        for (const prop of Array.from(style)) {
          if (prop.startsWith("--")) names.add(prop);
        }
      }
      if (cssRules) walk(cssRules, root);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // throws on cross-origin sheets
    } catch {
      continue;
    }
    walk(rules, false);
  }
  return [...names].map((name) => ({ name, raw: "", utility: null }));
}

/* ── The report: one reading of a pin ─────────────────────────────────────
   A pin is read once, against the feed, into plain data: no DOM node, no
   lookup left for a renderer to make. The panel and the copied block both
   render from this alone, so they cannot disagree about what was pinned, and
   anything else that needs the selection (an edit surface, say) can take it
   without the panel. */

export interface PinnedContext {
  element: Element;
  component: IdentifiedComponent | null;
  matches: TokenMatch[];
}

export interface SiblingReport {
  reason: SiblingGroup["reason"];
  /** What the group shares: a module's name, or a word of the name. */
  shared: string;
  /** The module's path for a `module` group; null for a `name` group. */
  file: string | null;
  /** How many share it, the pinned component included. */
  total: number;
  /** The others, each with its file and its styleguide entry. */
  others: { name: string; file: string; url: string }[];
}

/** An element as the report names it: enough to recognize it, nothing live. */
export interface NodeReport {
  tag: string;
  id: string | null;
  classes: string[];
}

/** How many ancestors the report names, nearest first. Enough to place an
 *  element in its section; ↑ in the panel goes as far as `body`. */
const TRAIL = 4;

export interface PinReport {
  project: string | null;
  page: string;
  /** The feed was refused: tokens come from the page's stylesheets, and
   *  nothing about components, rules or docs is known. */
  gated: boolean;
  element: NodeReport & {
    text: string | null;
    /** The nearest ancestors, parent first, `html` never among them. */
    ancestors: NodeReport[];
    /** How many more ancestors sit above the ones named, `html` excluded. */
    moreAbove: number;
  };
  component: {
    name: string;
    file: string;
    reach: Reach;
    /** Its entry on the styleguide's components page. */
    url: string;
    docblock: string | null;
    whenToUse: string | null;
    whenNot: string | null;
    /** One per variant map: its options, and the ones this element wears. */
    variants: { map: string; options: string[]; active: string[] }[];
    usage: { count: number; files: string[] };
    siblings: SiblingReport[];
  } | null;
  tokens: TokenMatch[];
  /** Shared UI rules naming the pinned component. A rule that names it
   *  constrains any edit, so these travel whole. */
  rules: InspectorPattern[];
  /** The rest, which travel as titles: discoverable without spending a
   *  session's context on rules that do not apply here. */
  otherRules: InspectorPattern[];
  /** Where a missing rule would be written; null when that doc is absent. */
  rulesDocUrl: string | null;
  docs: { label: string; path: string | null; url: string }[];
}

function nodeOf(el: Element): NodeReport {
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    classes: typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean) : [],
  };
}

export function describePin(
  data: InspectorData | null,
  pinned: PinnedContext,
  where: { gated: boolean; page: string }
): PinReport {
  const el = pinned.element;
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const known = new Map((data?.components ?? []).map((c) => [c.name, c]));
  const id = pinned.component;
  const c = id?.component;
  const rules = c ? rulesFor(data, c.name) : [];
  const ruleTitles = new Set(rules.map((p) => p.title));

  const ancestors: NodeReport[] = [];
  let moreAbove = 0;
  for (let up = el.parentElement; up && up !== document.documentElement; up = up.parentElement) {
    if (ancestors.length < TRAIL) ancestors.push(nodeOf(up));
    else moreAbove++;
  }

  return {
    project: data?.project || null,
    page: where.page,
    gated: where.gated,
    element: {
      ...nodeOf(el),
      text: text || null,
      ancestors,
      moreAbove,
    },
    component:
      id && c
        ? {
            name: c.name,
            file: c.file,
            reach: c.reach,
            url: c.url,
            docblock: c.docblock,
            whenToUse: c.whenToUse,
            whenNot: c.whenNot,
            variants: [...new Set(c.variants.map((v) => v.map))].map((map) => {
              const options = c.variants.filter((v) => v.map === map).map((v) => v.name);
              return { map, options, active: id.activeVariants.filter((a) => options.includes(a)) };
            }),
            usage: c.usage,
            siblings: c.siblings.map((g) => ({
              reason: g.reason,
              shared: g.shared,
              file: g.file,
              total: g.members.length,
              others: g.members
                .filter((m) => m !== c.name)
                .flatMap((m) => {
                  const s = known.get(m);
                  return s ? [{ name: s.name, file: s.file, url: s.url }] : [];
                }),
            })),
          }
        : null,
    tokens: pinned.matches,
    rules,
    otherRules: (data?.patterns ?? []).filter((p) => !ruleTitles.has(p.title)),
    rulesDocUrl: data?.patternsDocUrl || null,
    docs: data?.docs ?? [],
  };
}

/* ── The words both renderers share ─────────────────────────────────────
   One home for each phrase the panel and the block both print, so the two
   cannot drift into different sentences about the same fact. */

/** "section#how", "div.grid", "main": the tag, then its id or else its first
 *  class. Short enough for a trail, specific enough to find in a page. */
export function nodeLabel(n: NodeReport): string {
  return `${n.tag}${n.id ? `#${n.id}` : n.classes[0] ? `.${n.classes[0]}` : ""}`;
}

/** "2 more levels above": the ancestors the report does not name, counted
 *  in words, since an ellipsis reads as skipping the nearest ones. */
export function levelsAbove(n: number): string {
  return `${n} more level${n === 1 ? "" : "s"} above`;
}

/** "1 of 2 sharing buttonStyles" · "1 of 3 named Toggle". */
export const SIBLING_VERB: Record<SiblingGroup["reason"], string> = {
  module: "sharing",
  name: "named",
};

/** What goes before item `i` of `n` in a list read as prose: "A", "A and B",
 *  "A, B and C". */
export function listSeparator(i: number, n: number): string {
  return i === 0 ? "" : i === n - 1 ? " and " : ", ";
}

/** What the callsite count counts, said every time it is printed. */
export function usageLine(usage: { count: number; files: string[] }): string {
  const scope = "outside its own file and the styleguide's demo registry";
  return usage.count > 0
    ? `${usage.count} callsite${usage.count === 1 ? "" : "s"} ${scope}: ${usage.files.join(", ")}`
    : `No callsites ${scope}`;
}

/** "primary of primary/secondary/ghost", or "one of sm/md" when the element
 *  wears none of a map's options. */
export function variantPhrase(v: { options: string[]; active: string[] }): string {
  return `${v.active.length ? `${v.active.join("/")} of` : "one of"} ${v.options.join("/")}`;
}

/** One markdown block, shaped to paste into an LLM session, rendered from the
 *  report alone. Voice rules apply (short chunks, no em dashes). */
export function buildContextBlock(r: PinReport): string {
  const lines: string[] = [];
  const section = (heading: string) => lines.push("", `### ${heading}`);

  lines.push(`## UI context from the element inspector (read-only)`);
  lines.push("");
  if (r.project) lines.push(`Project: ${r.project}`);
  lines.push(`Page: ${r.page}`);
  const { tag, id, classes, text, ancestors, moreAbove } = r.element;
  lines.push(`Element: <${tag}${id ? ` id="${id}"` : ""}${classes.length ? ` class="${classes.join(" ")}"` : ""}>`);
  if (ancestors.length) {
    const above = moreAbove ? ` (${levelsAbove(moreAbove)})` : "";
    lines.push(`Inside: ${[...ancestors].reverse().map(nodeLabel).join(" > ")}${above}`);
  }
  if (text) lines.push(`Text: "${text}"`);
  // Without this line a gated block reads like page-local markup: no
  // component section either way, for two different reasons.
  if (r.gated) lines.push(`Record: gated on this deploy, so this block carries token names only.`);

  const c = r.component;
  if (c) {
    section(`Component: ${c.name} (${c.file})`);
    lines.push(`Census: ${REACH_LABEL[c.reach]}, by who imports it`);
    lines.push(`About: ${c.docblock ?? `no docblock in ${c.file}`}`);
    lines.push(`When: ${c.whenToUse ?? "no @when tag in its docblock"}`);
    lines.push(`Not for: ${c.whenNot ?? "no @whenNot tag in its docblock"}`);
    if (c.variants.length) lines.push(`Variant here: ${c.variants.map(variantPhrase).join(" · ")}`);
    lines.push(usageLine(c.usage));
    // Only the gap is stated here; rules that DO name it get their own
    // section below, in full, rather than being listed twice.
    if (r.rules.length === 0) lines.push(`Rules for this component: none recorded in component-patterns.md`);

    section(`Siblings`);
    if (c.siblings.length === 0) {
      lines.push(`- none: no other component in the inventory shares a style module or a word of its name`);
    }
    for (const g of c.siblings) {
      const via = g.file ? `${g.shared} (${g.file})` : g.shared;
      const others = g.others.map((o, i) => `${listSeparator(i, g.others.length)}${o.name} (${o.file})`).join("");
      lines.push(`- 1 of ${g.total} ${SIBLING_VERB[g.reason]} ${via}, with ${others}`);
    }
  }

  section(`Tokens in play`);
  if (r.tokens.length === 0) lines.push(`- none resolved on this element`);
  for (const m of r.tokens) {
    const best = m.tokens[0];
    if (best) {
      const util = best.utility ? ` · ${best.utility}` : "";
      const chain = best.raw ? ` · ${best.raw}` : "";
      lines.push(`- ${m.property}: ${best.name}${util}${chain} (${m.value})`);
    } else {
      lines.push(`- ${m.property}: ${m.value} (no token matches: off the design system)`);
    }
  }

  if (r.rules.length) {
    section(`Rules naming this component`);
    for (const p of r.rules) lines.push(`- ${p.title}: ${p.body}`);
  }
  if (r.otherRules.length) {
    section(`Other shared UI rules (titles only)`);
    for (const p of r.otherRules) lines.push(`- ${p.title}`);
  }

  if (c || r.docs.length) {
    section(`Project docs`);
    // Repo-relative paths, not URLs: a session opens files, it does not
    // browse. A page with no file behind it, the styleguide entry included,
    // falls back to its route.
    if (c) lines.push(`- ${c.name} in the styleguide: ${c.url}`);
    for (const d of r.docs) lines.push(`- ${d.label}: ${d.path ?? d.url}`);
  }
  return lines.join("\n");
}
