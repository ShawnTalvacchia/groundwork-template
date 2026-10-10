import type { ComponentDetail, Reach, SiblingGroup, StyleInventory } from "@/lib/styleguide";

/**
 * Client-side resolution for the element inspector: the feed's types, the
 * one report a pin is read into, and the block rendered from it. Token
 * names are the system's vocabulary (globals.css: names are load-bearing,
 * values are yours), so the inspector reports names, never bare values.
 *
 * A token line says where its name came from, and the sources are tried in
 * the order the cascade ranks them (`styles.ts` reads the first three): a
 * rule in the project's stylesheets, as written; a utility class the element
 * wears, as written; inherited from the nearest ancestor that sets it; and
 * only when none of those says, the element's computed value matched
 * against every token. That last match is the one this file does.
 *
 * How the value match works: token values as authored (oklch, rem,
 * keywords) and an element's computed styles (rgb/oklch serializations, px)
 * rarely compare equal as strings. So every token is probed once per pin
 * through a hidden element, letting the browser canonicalize both sides
 * into the same serialization before comparison. Probing ~200 tokens is
 * single-digit milliseconds, and doing it per pin keeps the index correct
 * across theme flips without watching `data-theme`.
 *
 * No "use client" directive on purpose: these are plain functions imported
 * only by the overlay (see component-patterns.md on style constants for the
 * general rule). What it takes from lib/styleguide.ts is types only, which
 * compile away; a value from there would pull `node:fs` into the browser.
 */

export interface InspectorToken {
  name: string; // "--text-primary"
  raw: string; // "var(--neutral-900)" — the authored chain, for context
  /** The Tailwind class for it: on a token line, the one for that line's
   *  property (`text-fg-primary` for a color), or the class as worn. */
  utility: string | null;
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

/** A shared UI rule: one H2 of component-patterns.md. */
export interface InspectorUiRule {
  title: string;
  body: string;
  /** Deep link to this exact rule on the rendered doc page. */
  url: string;
}

/** A name in the @theme layer and the :root token it reads; `target` is
 *  null when the theme name is itself the token (`--radius-panel`). */
export interface ThemeToken {
  name: string;
  raw: string;
  target: string | null;
}

export interface InspectorData {
  project: string;
  tokens: InspectorToken[];
  theme: ThemeToken[];
  components: InspectorComponent[];
  /** Every rule in the project's stylesheets, and the patterns they style. */
  styles: StyleInventory;
  uiRules: InspectorUiRule[];
  /** Where a missing rule would be written — the "none recorded" nudge links
   *  here, so a documentation gap is one click from being filled. */
  uiRulesDocUrl: string;
  /** `path` is repo-relative for a session to open; `url` is the rendered
   *  page for the human. A page that is not a doc carries no path. */
  docs: { label: string; path: string | null; url: string }[];
}

/** What a refused feed leaves: token names read from the page's own
 *  stylesheets, and nothing about components, patterns or rules. */
export function gatedData(tokens: InspectorToken[]): InspectorData {
  return {
    project: "",
    tokens,
    theme: [],
    components: [],
    styles: { files: [], rules: [], patterns: [] },
    uiRules: [],
    uiRulesDocUrl: "",
    docs: [],
  };
}

/**
 * Split a docblock or a stylesheet comment into its summary sentence and the
 * depth behind it.
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
export function rulesFor(data: InspectorData | null, componentName: string): InspectorUiRule[] {
  return data?.uiRules.filter((p) => `${p.title} ${p.body}`.includes(componentName)) ?? [];
}

/* ── Utilities: a Tailwind class, read back to its token ────────────────
   Tailwind's own table is not something a page can read, so the prefixes
   this inspector understands are written here, each with the @theme
   namespace its value names and the property it sets. A class none of them
   reads is left alone, never guessed at. Longest prefix first, so
   `border-t-edge-light` is a top border's colour, not `--color-t-edge-light`. */

const SIDES = { t: "top", r: "right", b: "bottom", l: "left" } as const;

export const UTILITIES: [prefix: string, ns: string, property: string][] = (
  [
    ["bg", "--color-", "background-color"],
    ["text", "--color-", "color"],
    ["text", "--text-", "font-size"],
    ...Object.entries(SIDES).map(([k, side]) => [`border-${k}`, "--color-", `border-${side}-color`]),
    ["border-x", "--color-", "border-inline-color"],
    ["border-y", "--color-", "border-block-color"],
    ["border", "--color-", "border-color"],
    ["outline", "--color-", "outline-color"],
    ["decoration", "--color-", "text-decoration-color"],
    ["fill", "--color-", "fill"],
    ["stroke", "--color-", "stroke"],
    ["p", "--spacing-", "padding"],
    ["px", "--spacing-", "padding-inline"],
    ["py", "--spacing-", "padding-block"],
    ...Object.entries(SIDES).map(([k, side]) => [`p${k}`, "--spacing-", `padding-${side}`]),
    ["m", "--spacing-", "margin"],
    ["mx", "--spacing-", "margin-inline"],
    ["my", "--spacing-", "margin-block"],
    ...Object.entries(SIDES).map(([k, side]) => [`m${k}`, "--spacing-", `margin-${side}`]),
    ["gap-x", "--spacing-", "column-gap"],
    ["gap-y", "--spacing-", "row-gap"],
    ["gap", "--spacing-", "gap"],
    ["rounded", "--radius-", "border-radius"],
    ...["t", "r", "b", "l", "tl", "tr", "br", "bl"].map((k) => [`rounded-${k}`, "--radius-", `border-radius (${k})`]),
    ["shadow", "--shadow-", "box-shadow"],
    ["font", "--font-weight-", "font-weight"],
    ["font", "--font-", "font-family"],
    ["leading", "--leading-", "line-height"],
    ["tracking", "--tracking-", "letter-spacing"],
    ["max-w", "--container-", "max-width"],
  ] as [string, string, string][]
).sort((a, b) => b[0].length - a[0].length);

/** The :root token a theme name reads, or the name itself when it is one. */
function rootOf(themeName: string, theme: ThemeToken[]): string {
  return theme.find((t) => t.name === themeName)?.target ?? themeName;
}

/** `bg-brand-main` → the property it sets and the token it names, or null
 *  when no prefix here reads it into a theme name that exists. A `/20`
 *  opacity modifier is kept on the class and dropped from the lookup. */
export function readUtility(
  cls: string,
  theme: ThemeToken[]
): { property: string; theme: string; token: string } | null {
  const bare = cls.replace(/^-/, "").replace(/\/[\w.]+$/, "");
  for (const [prefix, ns, property] of UTILITIES) {
    if (!bare.startsWith(`${prefix}-`)) continue;
    const name = `${ns}${bare.slice(prefix.length + 1)}`;
    if (theme.some((t) => t.name === name)) return { property, theme: name, token: rootOf(name, theme) };
  }
  return null;
}

/** The standard names this file reports under, mapped to the property a
 *  utility sets: "background" is `bg-*`, "shadow" is `shadow-*`. */
const UTILITY_PROPERTY: Record<string, string> = {
  background: "background-color",
  shadow: "box-shadow",
};

/** The class that names `token` for `property` (`text-brand-strong` for a
 *  colour, `bg-brand-strong` for a fill), or null when the @theme layer
 *  exposes none. For padding and gap, the all-sides form. */
export function utilityFor(property: string, token: string, theme: ThemeToken[]): string | null {
  const wanted = UTILITY_PROPERTY[property] ?? property;
  for (const t of theme) {
    if ((t.target ?? t.name) !== token) continue;
    for (const [prefix, ns, prop] of UTILITIES) {
      if (prop === wanted && t.name.startsWith(ns)) return `${prefix}-${t.name.slice(ns.length)}`;
    }
  }
  return null;
}

/* ── The value match: the last resort ───────────────────────────────────── */

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

export type { TokenIndex };

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

/** The properties a pin reports from computed style when nothing as
 *  written covers them, in the order the panel lists them. */
export const STANDARD = [
  "color",
  "background",
  "border-color",
  "font-size",
  "font-weight",
  "font-family",
  "border-radius",
  "shadow",
  "padding",
  "gap",
] as const;
export type StandardProperty = (typeof STANDARD)[number];

/** The value match for one standard property, when it is visibly in play.
 *  Unmatched values are kept, with an empty token list, so the report says
 *  "not a token" out loud.
 *
 *  Same-family ties go to the token whose class the element wears, not to
 *  whichever sorts first (two brand steps can share a value in one theme),
 *  and each token carries the class for this property, so a text colour
 *  prints as `text-*`, never `bg-*`. */
export function valueLines(
  el: Element,
  property: StandardProperty,
  index: TokenIndex,
  theme: ThemeToken[]
): TokenLine[] {
  const cs = getComputedStyle(el);
  const out: TokenLine[] = [];
  const line = (value: string, tokens: InspectorToken[]) => {
    const named = tokens.map((t) => ({ ...t, utility: utilityFor(property, t.name, theme) }));
    const worn = named.filter((t) => t.utility && el.classList.contains(t.utility));
    const ordered = [...worn, ...named.filter((t) => !worn.includes(t))];
    out.push({ property, value, tokens: ordered, from: { kind: "value" }, state: null, pseudo: null });
  };
  const color = (value: string) => {
    if (!value || TRANSPARENT.has(value)) return;
    line(value, byProperty(property, index.colors.get(value) ?? []));
  };
  const length = (value: string) => {
    if (!value || value === "0px") return;
    line(value, byProperty(property, index.lengths.get(value) ?? []));
  };

  switch (property) {
    case "color":
      color(cs.color);
      break;
    case "background":
      color(cs.backgroundColor);
      break;
    case "border-color":
      if (parseFloat(cs.borderTopWidth) > 0) color(cs.borderTopColor);
      break;
    case "font-size":
      length(cs.fontSize);
      break;
    case "font-weight": {
      const hits = index.weights.get(cs.fontWeight);
      if (hits?.length) line(cs.fontWeight, hits);
      break;
    }
    case "font-family": {
      const first = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
      const hit = index.fonts.find((f) => f.family === first);
      if (hit) line(first, [hit.token]);
      break;
    }
    case "border-radius":
      length(cs.borderTopLeftRadius);
      break;
    case "shadow":
      if (cs.boxShadow !== "none") line(cs.boxShadow, index.shadows.get(cs.boxShadow) ?? []);
      break;
    case "padding":
      for (const v of new Set([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft])) length(v);
      break;
    case "gap":
      if ((cs.display.includes("flex") || cs.display.includes("grid")) && cs.gap !== "normal") {
        for (const v of new Set(cs.gap.split(" "))) length(v);
      }
      break;
  }
  return out;
}

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
  /** The node it was identified on: the pinned element or an ancestor. */
  node: Element;
  /** Variant names whose classes are all present on the matched node. */
  activeVariants: string[];
}

function withVariants(component: InspectorComponent, node: Element): IdentifiedComponent {
  const activeVariants = component.variants
    .filter((v) => v.classes.split(/\s+/).every((t) => node.classList.contains(t)))
    .map((v) => v.name);
  return { component, node, activeVariants };
}

/** The React fiber a DOM node hangs off, under its per-render key. Present
 *  in dev and production alike; what it carries beyond the tree is dev-only. */
export function fiberOf(el: Element): Fiber | null {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
  return key ? ((el as unknown as Record<string, unknown>)[key] as Fiber) : null;
}

/** The fields of a React fiber this inspector reads. Internal to React, and
 *  every one of them may be absent: callers treat a missing field as an
 *  honest "not known". */
export interface Fiber {
  type: unknown;
  return: Fiber | null;
  /** The same instance's other copy: React keeps a current and a
   *  work-in-progress fiber per instance, and a child's `return` may point
   *  at either. */
  alternate: Fiber | null;
  stateNode: unknown;
  _debugStack?: { stack?: string } | null;
  _debugInfo?: { name?: string; env?: string; stack?: unknown[] }[] | null;
}

/** A fiber's component name, as React would print it. */
export function fiberTypeName(fiber: Fiber): string | null {
  const t = fiber.type as { displayName?: string; name?: string; render?: { name?: string } } | string | null;
  if (typeof t === "string") return t;
  if (typeof t === "function" || (t && typeof t === "object")) {
    return t.displayName ?? t.name ?? t.render?.name ?? null;
  }
  return null;
}

/** The nearest fiber at or above `el` whose name the inventory knows. */
export function componentFiber(el: Element, known: Set<string>): { name: string; fiber: Fiber } | null {
  for (let fiber = fiberOf(el); fiber; fiber = fiber.return) {
    const name = fiberTypeName(fiber);
    if (name && typeof fiber.type !== "string" && known.has(name)) return { name, fiber };
  }
  return null;
}

export function identifyComponent(el: Element, components: InspectorComponent[]): IdentifiedComponent | null {
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
  const hit = componentFiber(el, new Set(components.map((c) => c.name)));
  if (hit) {
    const c = components.find((x) => x.name === hit.name)!;
    return withVariants(c, el);
  }
  return null;
}

/** Every instance of a component on the page, by the node the detectors
 *  identify it on: its signature where it has one, else the first element
 *  each instance renders, found through the fiber the inventory names. */
export function componentElements(c: InspectorComponent, ignore: string): Element[] {
  if (c.signature) {
    return Array.from(document.querySelectorAll(c.signature.map((t) => `.${CSS.escape(t)}`).join(""))).filter(
      (e) => !e.closest(ignore) && (c.rootTags.length === 0 || c.rootTags.includes(e.tagName.toLowerCase()))
    );
  }
  const seen = new Set<Fiber>();
  const out: Element[] = [];
  const name = new Set([c.name]);
  for (const e of Array.from(document.body.querySelectorAll("*"))) {
    if (e.closest(ignore)) continue;
    const hit = componentFiber(e, name);
    if (hit && !seen.has(hit.fiber) && !(hit.fiber.alternate && seen.has(hit.fiber.alternate))) {
      seen.add(hit.fiber);
      out.push(e);
    }
  }
  return out;
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

/** An element as the report names it: enough to recognize it, nothing live. */
export interface NodeReport {
  tag: string;
  id: string | null;
  classes: string[];
}

export function nodeOf(el: Element): NodeReport {
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    classes: typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean) : [],
  };
}

/** Where a token line's name came from, in the order the sources are tried. */
export type TokenSource =
  /** A rule in the project's stylesheets, as written. */
  | { kind: "rule"; selector: string; file: string; line: number }
  /** A utility class the element wears, as written. */
  | { kind: "class"; className: string }
  /** The element's own style attribute. */
  | { kind: "inline" }
  /** Inherited from the nearest ancestor that sets it, and how it does. A
   *  null `node` is a value nothing on the element or above it sets, such
   *  as the browser's 16px. */
  | { kind: "inherited"; node: NodeReport | null; levelsUp: number; via: TokenSource | null }
  /** Matched by its computed value: nothing as written says which token. */
  | { kind: "value" };

export interface TokenLine {
  /** As written (`border-left`, `background-color`), or the standard name a
   *  computed value is read under (`color`, `padding`). */
  property: string;
  /** As written (`3px solid var(--brand-main)`), or computed (`12px`). */
  value: string;
  /** The tokens it names, best first; empty when it names none. */
  tokens: InspectorToken[];
  from: TokenSource;
  /** The user-action state the line applies in (`hover`); null at rest. */
  state: string | null;
  /** The pseudo-element it styles (`::after`); null for the element. */
  pseudo: string | null;
}

/** A rule that styles the pinned element, as its stylesheet writes it. */
export interface RuleReport {
  /** The selector from the rule's list that matches. */
  selector: string;
  file: string;
  line: number;
  /** The at-rules it sits inside, each holding now: `@media (min-width: 900px)`. */
  conditions: string[];
  /** The user-action states it applies in; empty at rest. */
  states: string[];
  pseudo: string | null;
  pattern: string | null;
  declarations: { property: string; value: string; line: number; overriddenBy: string | null }[];
}

/** A pattern the node wears, read from the stylesheet that styles it. */
export interface PatternReport {
  name: string;
  /** The first sentence of the comment above its base rule; null when it
   *  is named by its class. */
  label: string | null;
  /** That comment, whole. */
  comment: string | null;
  file: string;
  line: number;
  /** Each variant its stylesheet writes (`--call`, `[data-walked]`), on or
   *  off for the node wearing it, how many on the page wear it, and the
   *  comment above its rule. */
  variants: { modifier: string; on: boolean; instances: number; comment: string | null; file: string; line: number }[];
  /** How many elements on the page wear it. */
  instances: number;
}

/** A place in source: the file, and once the dev server's map has been
 *  read, the line and its text. */
export interface SourceSpot {
  /** Repo-relative path. */
  file: string;
  line: number | null;
  /** The line's own text, trimmed. */
  text: string | null;
  /** The function the line sits in: `Home`, `Item`. */
  fn: string | null;
}

export type LocationReport =
  /** A production build: React records no source there. */
  | { status: "unavailable" }
  /** Dev, and React's records name no project file for this element. */
  | { status: "unknown" }
  | {
      status: "found";
      /** Where the element is written. `element`: its own JSX. `component`:
       *  the component element that renders it, when library code writes
       *  the node itself (`<Link>` writes the `<a>`). `ancestor`: an
       *  ancestor's JSX, when nothing nearer is project code. */
      rendered: SourceSpot & { by: "element" | "component" | "ancestor"; name: string | null; node: NodeReport | null };
      /** For a node a shared component renders: where that component is used. */
      calledFrom: (SourceSpot & { name: string | null }) | null;
      /** `map`: lines read from the dev server's source map. `pending`: being
       *  read. `unmapped`: the map was missing or did not cover them. */
      lines: "pending" | "map" | "unmapped";
    };

/** Everything the overlay reads off a pinned element, before the report
 *  joins it to the feed. */
export interface PinnedContext {
  element: Element;
  component: IdentifiedComponent | null;
  /** The node wearing patterns and the patterns it wears. */
  patterns: { node: Element; levelsUp: number; list: PatternReport[] } | null;
  styledBy: RuleReport[];
  tokens: TokenLine[];
  /** User-action states at the moment of the pin. */
  state: string[];
  location: LocationReport;
  /** Instances on the page of the identified component. */
  componentInstances: number;
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

/** How many ancestors the report names, nearest first. Enough to place an
 *  element in its section; ↑ in the panel goes as far as `body`. */
const TRAIL = 4;

export interface PinReport {
  project: string | null;
  page: string;
  /** The feed was refused: tokens come from the page's stylesheets, and
   *  nothing about components, patterns, rules or docs is known. */
  gated: boolean;
  element: NodeReport & {
    text: string | null;
    /** The nearest ancestors, parent first, `html` never among them. */
    ancestors: NodeReport[];
    /** How many more ancestors sit above the ones named, `html` excluded. */
    moreAbove: number;
  };
  /** The user-action states it was in when pinned: `hovered`, `focused`,
   *  `active`. Its computed values may sit mid-transition into them. */
  state: string[];
  /** What only the page knows about how it was seen: the theme its root
   *  declares (`data-theme`) and the viewport's width, each null when the
   *  page does not say (no `data-theme`; a pane that lays nothing out). */
  view: { theme: string | null; width: number | null };
  /** Where it is written in source. Dev only. */
  location: LocationReport;
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
    /** How many instances are on this page. */
    instances: number;
  } | null;
  /** The patterns worn by the pinned element, or by its nearest ancestor
   *  wearing any, with that node when it is an ancestor. */
  patterns: { node: NodeReport | null; levelsUp: number; list: PatternReport[] } | null;
  /** Every rule in the project's stylesheets that styles the element. */
  styledBy: RuleReport[];
  tokens: TokenLine[];
  /** Shared UI rules naming the pinned component. A rule that names it
   *  constrains any edit, so these travel whole. */
  rules: InspectorUiRule[];
  /** The rest, which travel as titles: discoverable without spending a
   *  session's context on rules that do not apply here. */
  otherRules: InspectorUiRule[];
  /** Where a missing rule would be written; null when that doc is absent. */
  rulesDocUrl: string | null;
  docs: { label: string; path: string | null; url: string }[];
}

/** An element's text in the source's own casing, with a space wherever the
 *  page starts a new block. `textContent` runs blocks together ("O1The
 *  pattern…"), and `innerText` applies `text-transform`, so a search of the
 *  source would not find what it prints ("ACTIVE"). */
function textOf(el: Element): string {
  let out = "";
  let lastBlock: Element | null = null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n && out.length < 200; n = walker.nextNode()) {
    let block = n.parentElement;
    while (block && block !== el && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
    if (out && block !== lastBlock) out += " ";
    out += n.nodeValue ?? "";
    lastBlock = block;
  }
  return out.replace(/\s+/g, " ").trim();
}

export function describePin(
  data: InspectorData | null,
  pinned: PinnedContext,
  where: { gated: boolean; page: string }
): PinReport {
  const el = pinned.element;
  const text = textOf(el).slice(0, 80);
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
    state: pinned.state,
    view: { theme: document.documentElement.getAttribute("data-theme"), width: window.innerWidth || null },
    location: pinned.location,
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
            instances: pinned.componentInstances,
          }
        : null,
    patterns: pinned.patterns
      ? {
          node: pinned.patterns.levelsUp ? nodeOf(pinned.patterns.node) : null,
          levelsUp: pinned.patterns.levelsUp,
          list: pinned.patterns.list,
        }
      : null,
    styledBy: pinned.styledBy,
    tokens: pinned.tokens,
    rules,
    otherRules: (data?.uiRules ?? []).filter((p) => !ruleTitles.has(p.title)),
    rulesDocUrl: data?.uiRulesDocUrl || null,
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

/** "2 levels up", for a node the report found on an ancestor. */
export function levelsUp(n: number): string {
  return `${n} level${n === 1 ? "" : "s"} up`;
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

/** "9 on this page", the count the show-all action outlines. */
export function instancesLine(n: number): string {
  return `${n} on this page`;
}

/** `app/page.tsx:42`, or the bare path while the line is unknown. */
export function spotPath(s: { file: string; line: number | null }): string {
  return s.line ? `${s.file}:${s.line}` : s.file;
}

/** A variant's name without the `&` the inventory writes for the class:
 *  `--call`, `[data-walked]`, `.active`. */
export function variantName(modifier: string): string {
  return modifier.replace(/^&/, "");
}

/** "hovered and focused", "the user-action state" a pin was taken in. */
export function stateWords(state: string[]): string {
  return state.map((s, i) => `${listSeparator(i, state.length)}${s}`).join("");
}

/** Where a token line came from, in words: "as written in .sys-wt-item",
 *  "its class bg-brand-main", "inherited from div.sys-layout", "by value".
 *  `detail` adds the file and line, for the block. */
export function sourcePhrase(from: TokenSource, detail: boolean): string {
  switch (from.kind) {
    case "rule":
      return `as written in ${from.selector}${detail ? ` (${from.file}:${from.line})` : ""}`;
    case "class":
      return `its class ${from.className}`;
    case "inline":
      return "its style attribute";
    case "inherited":
      if (!from.node) return "inherited; nothing on it or above it sets one";
      return `inherited from ${nodeLabel(from.node)}${from.via ? `, ${sourcePhrase(from.via, detail)}` : ""}`;
    case "value":
      return "by value";
  }
}

/** The rendered-at line's words for a location, shared by both renderers. */
export function locationPhrase(loc: LocationReport): { lead: string; spot: string | null; note: string | null } {
  if (loc.status === "unavailable") return { lead: "Rendered at", spot: null, note: "not available on a production build" };
  if (loc.status === "unknown") return { lead: "Rendered at", spot: null, note: "no project file in React's dev records for it" };
  const r = loc.rendered;
  const lines =
    loc.lines === "pending"
      ? "line pending: reading the dev server's source map"
      : loc.lines === "unmapped"
        ? "line unknown: the dev server's source map does not cover it"
        : null;
  const lead = r.by === "ancestor" ? "Rendered inside" : "Rendered at";
  const through =
    r.by === "component" && r.name ? `through ${r.name}` : r.by === "ancestor" && r.node ? `in ${nodeLabel(r.node)}` : null;
  return { lead, spot: spotPath(r), note: [r.fn ? `in ${r.fn}` : null, through, lines].filter(Boolean).join(", ") || null };
}

/** Shorten a value written for a machine (a data URL) for a human line. */
export function shortValue(v: string): string {
  return v.length > 120 ? `${v.slice(0, 117)}…` : v;
}

/** A path's last segment: `system.css` for `app/[surface]/system.css`. */
export function baseName(file: string): string {
  return file.split("/").pop() ?? file;
}

/** A shared UI rule's file, from its deep link: the feed serves rules at
 *  `/system/docs/<path>#<heading>`, and a session opens `docs/<path>`. */
function rulePath(url: string): string {
  return url.replace(/^\/system\/docs\//, "docs/").replace(/#.*$/, "");
}

/** One token line as the block's list prints it: the property, the tokens
 *  it names, and just enough of where they came from to edit them. The
 *  class it wears, the rule's file and line, or the ancestor it inherits
 *  from. */
function tokenPhrase(m: TokenLine): string {
  const lead = [m.state ? `on ${m.state}` : null, m.pseudo ? `its ${m.pseudo}` : null].filter(Boolean).join(", ");
  // A value match lists candidates, best first; only the best is a claim.
  const names = (m.from.kind === "value" ? m.tokens.slice(0, 1) : m.tokens).map((t) => t.name);
  // A declaration that is more than its tokens prints as written, so the
  // 3px of a brand edge or the `- 2px` of a `calc()` is not lost.
  const written = m.from.kind === "inherited" ? m.from.via : m.from;
  if (names.length && written && (written.kind === "rule" || written.kind === "inline") && !/^(var\(--[\w-]+\)\s*)+$/.test(m.value)) {
    names.splice(0, names.length, shortValue(m.value));
  }
  const from =
    m.from.kind === "rule"
      ? ` (${baseName(m.from.file)}:${m.from.line})`
      : m.from.kind === "class"
        ? ` (${m.from.className})`
        : m.from.kind === "inline"
          ? " (style attribute)"
          : m.from.kind === "inherited"
            ? m.from.node
              ? `, inherited from ${nodeLabel(m.from.node)}`
              : ", inherited"
            : names.length
              ? ", by value"
              : "";
  return `${lead ? `${lead}, ` : ""}${m.property} ${names.length ? names.join(" ") : shortValue(m.value)}${from}${names.length ? "" : ", no token"}`;
}

/** Which location line writes the element's visible text, when the text
 *  appears on it verbatim. A label passed as children is written where the
 *  component is used, not where it renders, and a session changing copy
 *  should not have to work out which. */
function textWrittenAt(r: PinReport): "rendered" | "calledFrom" | null {
  const t = r.element.text?.slice(0, 24).trim();
  if (!t || t.length < 3 || r.location.status !== "found") return null;
  if (r.location.calledFrom?.text?.includes(t)) return "calledFrom";
  if (r.location.rendered.text?.includes(t)) return "rendered";
  return null;
}

/** One block, shaped to paste into a session beside the ask: a pointer, not
 *  a briefing. It carries what maps the page to the code (where the element
 *  is written, what it is, what styles it, how many on the page share it)
 *  and what only the page knows (the tokens in play, the theme, the width,
 *  the state), and nothing a session gets by opening the file it points at:
 *  no docblock, no siblings, no rule text, no declarations, no doc list. A
 *  picker that already sends the element's HTML and a screenshot (Claude's
 *  preview does) is matched by this, not repeated. The whole reading stays
 *  on `window.__inspectorPin.report`. Rendered from the report alone; voice
 *  rules apply (short chunks, no em dashes). */
export function buildContextBlock(r: PinReport): string {
  const lines: string[] = ["## Pinned in the element inspector", ""];
  const view = [
    r.view.theme,
    r.view.width ? `${r.view.width}px wide` : null,
    r.state.length ? `${stateWords(r.state)} when pinned` : null,
  ];
  lines.push(`Page: ${[r.page, ...view].filter(Boolean).join(" · ")}`);
  const { tag, id, classes, text } = r.element;
  lines.push(
    `Element: <${tag}${id ? ` id="${id}"` : ""}${classes.length ? ` class="${classes.join(" ")}"` : ""}>${text ? `, "${text}"` : ""}`
  );
  const where = locationPhrase(r.location);
  const textAt = textWrittenAt(r);
  const spotText = r.location.status === "found" && r.location.rendered.text ? `: ${r.location.rendered.text}` : "";
  const renderedNote = [where.note, textAt === "rendered" ? "where its text is written" : null].filter(Boolean).join(", ");
  lines.push(`${where.lead}: ${[where.spot, renderedNote].filter(Boolean).join(", ")}${spotText}`);
  // Without this line a gated block reads like page-local markup: no
  // pattern or component either way, for two different reasons.
  if (r.gated) lines.push(`Record: gated on this deploy, so patterns, components and rules are not known here`);

  const wornBy = r.patterns?.node ? `, worn by ${nodeLabel(r.patterns.node)} ${levelsUp(r.patterns.levelsUp)}` : "";
  // Every variant its stylesheet writes, on or off, each with its own count:
  // a change to every instance has to know the range, and "every call" is
  // not "every item".
  for (const p of r.patterns?.list ?? []) {
    lines.push(`Pattern: .${p.name}${wornBy}, ${instancesLine(p.instances)}`);
    if (p.variants.length) {
      lines.push(`Variants: ${p.variants.map((v) => `${variantName(v.modifier)} ${v.on ? "on" : "off"}, ${instancesLine(v.instances)}`).join(" · ")}`);
    }
  }
  const c = r.component;
  if (c) {
    const active = c.variants.flatMap((v) => v.active);
    lines.push(`Component: ${c.name} (${c.file})${active.length ? `, ${active.join(" · ")}` : ""}, ${instancesLine(c.instances)}`);
    if (r.location.status === "found" && r.location.calledFrom) {
      const cf = r.location.calledFrom;
      const note = [cf.fn ? `in ${cf.fn}` : null, textAt === "calledFrom" ? "where its text is written" : null].filter(Boolean);
      lines.push(`Called from: ${spotPath(cf)}${note.length ? `, ${note.join(", ")}` : ""}${cf.text ? `: ${cf.text}` : ""}`);
    }
  }
  if (!r.gated && !r.patterns && !c) lines.push(`Pattern and component: none, so its styling is its own classes`);

  if (r.styledBy.length) {
    const rules = r.styledBy.map((rule) => {
      const when = [
        ...rule.conditions.map((cond) => cond.replace(/^@media\s*/, "at ")),
        ...rule.states.map((st) => `on ${st}`),
        ...(rule.pseudo ? [`its ${rule.pseudo}`] : []),
      ];
      return `${rule.selector} (${rule.file}:${rule.line}${when.length ? `, ${when.join(", ")}` : ""})`;
    });
    lines.push(`Styled by: ${rules.join(" · ")}`);
  }
  // A rule naming the component constrains any edit, so it travels, but as
  // a pointer: the session reads it where it lives.
  if (r.rules.length) {
    lines.push(`${r.rules.length === 1 ? "Rule" : "Rules"} naming it: ${r.rules.map((u) => `${u.title} (${rulePath(u.url)})`).join(" · ")}`);
  }
  lines.push(`Tokens: ${r.tokens.length ? r.tokens.map(tokenPhrase).join(" · ") : "none resolved on this element"}`);
  return lines.join("\n");
}
