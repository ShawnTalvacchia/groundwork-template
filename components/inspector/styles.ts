import type { RuleSelector, StyleRule } from "@/lib/styleguide";
import {
  nodeOf,
  readUtility,
  STANDARD,
  summaryOf,
  tokensEqualTo,
  UTILITIES,
  utilityFor,
  valueLines,
  type InspectorData,
  type InspectorToken,
  type PatternReport,
  type RuleReport,
  type StandardProperty,
  type TokenIndex,
  type TokenLine,
  type TokenSource,
} from "./resolve";

/**
 * The project's stylesheets, read against a pinned element. The feed
 * carries every rule with its selectors pre-read at build (the pattern
 * inventory, `getStyleInventory` in lib/styleguide.ts), so everything here
 * asks the browser one question, `Element.matches`, and never parses a
 * selector of its own.
 *
 * What it answers:
 * - which rules style the element, each declaration marked when a stronger
 *   one overrides it, the way the cascade ranks them: style attribute, then
 *   specificity, then the order the stylesheets load in;
 * - which patterns the element wears, or the nearest ancestor that wears
 *   any, with each variant on or off;
 * - each token in play and where its name comes from, as written first: a
 *   rule's declaration, a utility class the element wears, its style
 *   attribute. A property none of those sets is inherited from the nearest
 *   ancestor that sets it, or, last, matched by its computed value
 *   (`valueLines` in resolve.ts). A `:hover` rule or a `hover:` class reads
 *   as a line of its own, so the stylesheet says what the hover state is,
 *   whatever instant of the transition the pin landed on.
 *
 * Unlayered rules beat Tailwind's utilities whatever their specificity, and
 * every rule the inventory reads is unlayered: `@layer` would put a rule
 * among the utilities, and a rule under one is read as written but ranked as
 * if it were not. Tailwind's own order between utilities is not readable
 * from the page; where two of a property's utilities apply, the one under
 * the widest breakpoint wins, which is how Tailwind sorts them.
 */

/** One rule styling an element, through the selector of its list that
 *  matches. `order` is its place in the inventory, the cascade's order
 *  between selectors of equal specificity. */
interface RuleMatch {
  rule: StyleRule;
  selector: RuleSelector;
  order: number;
}

function matchesSafely(el: Element, selector: string): boolean {
  try {
    return el.matches(selector);
  } catch {
    return false; // a selector this browser cannot read styles nothing here
  }
}

/** Whether every at-rule a rule sits inside holds right now. `@layer` names
 *  a layer and holds; `@container` and `@scope` are not read and hold. */
function conditionsHold(conditions: string[]): boolean {
  return conditions.every((c) => {
    const m = c.match(/^@(media|supports)\s*([\s\S]*)$/);
    if (!m) return true;
    try {
      return m[1] === "media" ? window.matchMedia(m[2]).matches : CSS.supports(m[2]);
    } catch {
      return true;
    }
  });
}

/** The selector of a rule's list a node matches: a resting one before a
 *  state one before a pseudo-element, then the most specific. */
function bestSelector(el: Element, rule: StyleRule): RuleSelector | null {
  let best: RuleSelector | null = null;
  const weight = (s: RuleSelector) => (s.pseudo ? 2 : s.states.length ? 1 : 0);
  for (const s of rule.selectors) {
    if (!s.test || !matchesSafely(el, s.test)) continue;
    if (!best || weight(s) < weight(best) || (weight(s) === weight(best) && outranks(s.specificity, best.specificity))) {
      best = s;
    }
  }
  return best;
}

function outranks(a: [number, number, number], b: [number, number, number]): boolean {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

/** Every rule in the inventory that styles `el` now, in inventory order. */
function matchRules(el: Element, data: InspectorData): RuleMatch[] {
  const out: RuleMatch[] = [];
  data.styles.rules.forEach((rule, order) => {
    if (!conditionsHold(rule.conditions)) return;
    const selector = bestSelector(el, rule);
    if (selector) out.push({ rule, selector, order });
  });
  return out;
}

/** A declaration in play, ranked: `inline` beats every rule, then
 *  `!important`, specificity and order. */
interface Candidate {
  property: string;
  value: string;
  line: number;
  states: string[];
  pseudo: string | null;
  important: boolean;
  inline: boolean;
  specificity: [number, number, number];
  order: number;
  source: TokenSource;
  /** The selector text it sits under, or "its style attribute". */
  by: string;
}

function beats(a: Candidate, b: Candidate): boolean {
  if (a.important !== b.important) return a.important;
  if (a.inline !== b.inline) return a.inline;
  if (outranks(a.specificity, b.specificity)) return true;
  if (outranks(b.specificity, a.specificity)) return false;
  return a.order > b.order || (a.order === b.order && a.line > b.line);
}

/** The declarations of the element's own style attribute, as written. */
function inlineDeclarations(el: Element): { property: string; value: string }[] {
  return (el.getAttribute("style") ?? "")
    .split(";")
    .map((d) => d.match(/^\s*(-{0,2}[a-zA-Z][\w-]*)\s*:([\s\S]*)$/))
    .flatMap((m) => (m ? [{ property: m[1].toLowerCase(), value: m[2].trim() }] : []));
}

function candidatesOf(el: Element, matches: RuleMatch[]): Candidate[] {
  const out: Candidate[] = [];
  for (const m of matches) {
    for (const d of m.rule.declarations) {
      out.push({
        property: d.property,
        value: d.value.replace(/\s*!important$/, ""),
        line: d.line,
        states: m.selector.states,
        pseudo: m.selector.pseudo,
        important: /!important$/.test(d.value),
        inline: false,
        specificity: m.selector.specificity,
        order: m.order,
        source: { kind: "rule", selector: m.selector.text, file: m.rule.file, line: d.line },
        by: m.selector.text,
      });
    }
  }
  for (const d of inlineDeclarations(el)) {
    out.push({
      ...d,
      line: 0,
      states: [],
      pseudo: null,
      important: false,
      inline: true,
      specificity: [0, 0, 0],
      order: Infinity,
      source: { kind: "inline" },
      by: "its style attribute",
    });
  }
  return out;
}

/** The candidate that beats `c` where `c` applies: the same property, on the
 *  same pseudo-element, from a rule that holds in every state `c` asks for.
 *  A resting rule can override a `:hover` one, and on a waiting tile inside
 *  a run it does. Null when `c` wins. */
function overrider(c: Candidate, all: Candidate[]): Candidate | null {
  let winner = c;
  for (const o of all) {
    if (o === c || o.property !== c.property || o.pseudo !== c.pseudo) continue;
    if (!o.states.every((s) => c.states.includes(s))) continue;
    if (beats(o, winner)) winner = o;
  }
  return winner === c ? null : winner;
}

/* ── Token names, as written ───────────────────────────────────────────── */

/** The property a utility for this declaration would name: a border's
 *  colour, a background's colour. */
function utilityProperty(property: string): string {
  if (/^border(-(top|right|bottom|left))?$/.test(property)) return `${property}-color`;
  if (property === "background") return "background-color";
  return property;
}

/** `var(--x)` names in a value that are design-system tokens, :root or
 *  @theme, each with its chain and its class. A custom property the
 *  stylesheet defines for itself (`--sys-icon-check`) is not one. */
function tokensIn(value: string, property: string, data: InspectorData): InspectorToken[] {
  const out: InspectorToken[] = [];
  for (const m of value.matchAll(/var\((--[\w-]+)/g)) {
    const root = data.tokens.find((t) => t.name === m[1]);
    const theme = root ? null : data.theme.find((t) => t.name === m[1]);
    if (!root && !theme) continue;
    const target = root ? root.name : (theme!.target ?? theme!.name);
    out.push({ name: m[1], raw: root ? root.raw : theme!.raw, utility: utilityFor(utilityProperty(property), target, data.theme) });
  }
  return out;
}

/** Properties the token set has a family for, so a value written without a
 *  token is a line of its own: "not a token", as written. A value made only
 *  of keywords and percentages (`none`, `0 auto`, `100%`) says nothing a
 *  token would. A border shorthand counts only for a colour written into it,
 *  since widths have no tokens.
 *
 *  Two tables answer it, and they must agree. This list is what holds on
 *  any feed, a refused one included; `UTILITIES` adds each property a prefix
 *  there sets whose @theme namespace the project fills (`hasFamily`). That
 *  is how margin counts (`--spacing-`, the padding family), and max-width
 *  counts only where a project defines `--container-*`. */
const DESIGN_PROPERTY = /^(color|background(-color)?|font-(size|weight|family)|letter-spacing|line-height|border(-(top|right|bottom|left))?-color|(border-(top|bottom)-(left|right)-)?radius|border-radius|box-shadow|padding(-[\w-]+)?|(row-|column-)?gap)$/;
const BORDER = /^border(-(top|right|bottom|left))?$/;
const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|color-mix)\(/i;
const KEYWORD = /^(none|0|0px|transparent|auto|normal|inherit|initial|unset|revert|currentcolor|[\d.]+%)$/i;

/** Whether a value is only keywords: nothing a token would say. */
function keywordsOnly(value: string): boolean {
  return value.trim().split(/\s+/).every((w) => KEYWORD.test(w));
}

/** Whether a utility in `UTILITIES` sets `property` exactly, and the @theme
 *  layer holds a name in its namespace. */
function themedFamily(property: string, data: InspectorData): boolean {
  return UTILITIES.some(([, ns, prop]) => prop === property && data.theme.some((t) => t.name.startsWith(ns)));
}

function hasFamily(property: string, data: InspectorData): boolean {
  return DESIGN_PROPERTY.test(property) || themedFamily(property, data);
}

/** A declaration that leaves the value to the parent sets nothing itself. */
const DEFERS = /^(inherit|unset)$/i;

function asWrittenLine(c: Candidate, data: InspectorData): TokenLine | null {
  if (c.property.startsWith("--")) return null;
  const tokens = tokensIn(c.value, c.property, data);
  const untokened =
    (hasFamily(c.property, data) && !keywordsOnly(c.value)) || (BORDER.test(c.property) && COLOR_LITERAL.test(c.value));
  if (!tokens.length && !untokened) return null;
  return {
    property: c.property,
    value: c.value,
    tokens,
    from: c.source,
    state: c.states.length ? c.states.join(", ") : null,
    pseudo: c.pseudo,
  };
}

/* ── Utility classes, as worn ─────────────────────────────────────────── */

/** A token's authored chain, :root or @theme (`--container-prose` is
 *  @theme's alone). */
function rawOf(name: string, data: InspectorData): string {
  return data.tokens.find((t) => t.name === name)?.raw ?? data.theme.find((t) => t.name === name)?.raw ?? "";
}

const STATE_VARIANTS = new Set(["hover", "focus", "focus-visible", "focus-within", "active"]);

/** A bracketed class read back: the property its prefix sets and, when the
 *  brackets hold a token (`bg-[var(--x)]`, v4's `bg-(--x)`), that token.
 *  Null when no prefix in `UTILITIES` sets a property the project has a
 *  family for, so `h-[24px]` says nothing. Where a prefix sets two
 *  (`text-` is a colour or a size), the value's type picks, as Tailwind's
 *  does: a colour is a colour, a number is a weight. */
function readArbitrary(
  utility: string,
  data: InspectorData
): { property: string; token: string | null } | null {
  const m = utility.match(/^-?(.+?)-(?:\[(.+)\]|\((--[\w-]+)\))(?:\/[\w.]+)?$/);
  if (!m) return null;
  const inner = m[3] ? `var(${m[3]})` : m[2].replace(/^[\w-]+:(?=.)/, "").replace(/_/g, " ");
  const named = inner.match(/^var\((--[\w-]+)\)$/)?.[1] ?? null;
  const known = named && (data.tokens.some((t) => t.name === named) || data.theme.some((t) => t.name === named)) ? named : null;
  if (!known && keywordsOnly(inner)) return null; // `rounded-[inherit]` says nothing a token would
  const rows = UTILITIES.filter(([prefix, ns]) => prefix === m[1] && data.theme.some((t) => t.name.startsWith(ns)));
  if (!rows.length) return null;
  const value = known ? getComputedStyle(document.documentElement).getPropertyValue(known).trim() : inner;
  const colour = CSS.supports("color", value);
  const row =
    rows.length === 1
      ? rows[0]
      : (rows.find(([, ns]) => (ns === "--color-") === colour && (ns !== "--font-weight-" || /^\d+$/.test(value))) ??
        rows.find(([, ns]) => (ns === "--color-") === colour) ??
        rows[0]);
  const token = known ? (data.theme.find((t) => t.name === known)?.target ?? known) : null;
  return { property: row[2], token };
}

/** A worn class read back to its token: the property it sets, the token it
 *  names (null for a bracketed value that is not one), the states it waits
 *  for, and the widest breakpoint it sits under (0 for none). Null when it
 *  is not a utility this reads, or carries a variant this does not read
 *  (`dark:`, `group-hover:`), or sits under a breakpoint that does not hold. */
function readClass(
  cls: string,
  data: InspectorData
): { property: string; token: string | null; states: string[]; breakpoint: number } | null {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of cls) {
    if (ch === "[" || ch === "(") depth++;
    else if (ch === "]" || ch === ")") depth--;
    if (ch === ":" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  const utility = cur.replace(/^!|!$/g, "");
  const read = readUtility(utility, data.theme) ?? readArbitrary(utility, data);
  if (!read) return null;
  const states: string[] = [];
  let breakpoint = 0;
  for (const v of parts) {
    if (STATE_VARIANTS.has(v)) {
      states.push(v);
      continue;
    }
    const bp = v.match(/^(max-)?(.+)$/)!;
    const width = data.theme.find((t) => t.name === `--breakpoint-${bp[2]}`)?.raw;
    if (!width) return null;
    const query = bp[1] ? `(width < ${width})` : `(min-width: ${width})`;
    if (!window.matchMedia(query).matches) return null;
    breakpoint = Math.max(breakpoint, bp[1] ? 0 : parseFloat(width));
  }
  return { property: read.property, token: read.token, states, breakpoint };
}

/** Does a declaration of `decl` set `prop`? A shorthand sets its longhands;
 *  a border sets its colours, never its radius. */
function sets(decl: string, prop: string): boolean {
  if (decl === prop) return true;
  if (decl === "border") return /^border(-(top|right|bottom|left|inline|block))?-color$/.test(prop);
  if (decl === "font") return /^(font-(size|weight|family)|line-height)$/.test(prop);
  if (/^border-(top|right|bottom|left)$/.test(decl)) return prop === `${decl}-color`;
  return prop.startsWith(`${decl}-`);
}

/** The token lines a worn class writes: per property, the resting class
 *  under the widest breakpoint that holds, unless a rule sets that property
 *  (unlayered rules beat every utility, `inherit` included); then each state
 *  class as its own line. */
function classLines(el: Element, data: InspectorData, ruledAtAll: Set<string>): TokenLine[] {
  const resting = new Map<string, { line: TokenLine; breakpoint: number }>();
  const states: TokenLine[] = [];
  for (const cls of Array.from(el.classList)) {
    const read = readClass(cls, data);
    if (!read) continue;
    const line: TokenLine = {
      property: read.property,
      value: cls,
      tokens: read.token ? [{ name: read.token, raw: rawOf(read.token, data), utility: cls }] : [],
      from: { kind: "class", className: cls },
      state: read.states.length ? read.states.join(", ") : null,
      pseudo: null,
    };
    if (read.states.length) states.push(line);
    else if (![...ruledAtAll].some((decl) => sets(decl, read.property))) {
      const held = resting.get(read.property);
      if (!held || read.breakpoint >= held.breakpoint) resting.set(read.property, { line, breakpoint: read.breakpoint });
    }
  }
  return [...[...resting.values()].map((r) => r.line), ...states];
}

/* ── Reading one element ───────────────────────────────────────────────── */

/** Which standard property a written line covers, so the value match runs
 *  only where nothing as written answers. */
const COVERS: Record<StandardProperty, (p: string) => boolean> = {
  color: (p) => p === "color",
  background: (p) => p === "background" || p === "background-color",
  "border-color": (p) => /^border(-top)?(-color)?$/.test(p),
  "font-size": (p) => p === "font-size" || p === "font",
  "font-weight": (p) => p === "font-weight" || p === "font",
  "font-family": (p) => p === "font-family" || p === "font",
  "border-radius": (p) => /radius/.test(p),
  shadow: (p) => p === "box-shadow",
  padding: (p) => p.startsWith("padding"),
  gap: (p) => /^(row-|column-)?gap$/.test(p),
};

const INHERITED = new Set<StandardProperty>(["color", "font-size", "font-weight", "font-family"]);

export interface StyleReading {
  styledBy: RuleReport[];
  /** As written on the element: rules, its style attribute, its classes. */
  written: TokenLine[];
  /** Every property a winning rule or the style attribute sets at rest,
   *  token or not, with the declaration that sets it: what nothing below
   *  it may answer for. */
  ruled: Map<string, Candidate>;
}

/** The rules styling `el` and the token lines they and its classes write. */
function readWritten(el: Element, data: InspectorData): StyleReading {
  const matches = matchRules(el, data);
  const all = candidatesOf(el, matches);
  const lines: TokenLine[] = [];
  const ruled = new Map<string, Candidate>();
  const ruledAtAll = new Set<string>();
  for (const c of all) {
    if (overrider(c, all)) continue;
    if (!c.states.length && !c.pseudo) {
      ruledAtAll.add(c.property);
      if (!DEFERS.test(c.value)) ruled.set(c.property, c);
    }
    const line = asWrittenLine(c, data);
    if (line) lines.push(line);
  }
  const styledBy: RuleReport[] = matches.map((m) => ({
    selector: m.selector.text,
    file: m.rule.file,
    line: m.rule.line,
    conditions: m.rule.conditions,
    states: m.selector.states,
    pseudo: m.selector.pseudo,
    pattern: m.selector.pattern,
    declarations: m.rule.declarations.map((d) => {
      const c = all.find((x) => x.order === m.order && x.line === d.line && x.property === d.property && !x.inline)!;
      const over = overrider(c, all);
      return { property: d.property, value: d.value, line: d.line, overriddenBy: over ? over.by : null };
    }),
  }));
  return { styledBy, written: [...lines, ...classLines(el, data, ruledAtAll)], ruled };
}

/** The nearest ancestor that sets an inherited property, read as written,
 *  while the computed value stays the same all the way down. Null when the
 *  value changes between with nothing read setting it (a browser default on
 *  the element, such as `code`'s monospace); the value match answers then. */
function inheritedLine(
  el: Element,
  property: StandardProperty,
  data: InspectorData,
  index: TokenIndex,
  cache: Map<Element, StyleReading>
): TokenLine | null {
  const value = getComputedStyle(el).getPropertyValue(property);
  let levels = 0;
  for (let node = el.parentElement; node; node = node.parentElement) {
    levels++;
    if (getComputedStyle(node).getPropertyValue(property) !== value) return null;
    let reading = cache.get(node);
    if (!reading) {
      reading = readWritten(node, data);
      cache.set(node, reading);
    }
    const set = reading.written.find((l) => !l.state && !l.pseudo && COVERS[property](l.property));
    // A keyword sets it too (`font-weight: normal`), with no token to name.
    const keyword = set ? null : [...reading.ruled.values()].find((c) => COVERS[property](c.property));
    if (set || keyword) {
      return {
        property,
        value: set ? set.value : keyword!.value,
        tokens: set ? set.tokens : [],
        from: { kind: "inherited", node: nodeOf(node), levelsUp: levels, via: set ? set.from : keyword!.source },
        state: null,
        pseudo: null,
      };
    }
  }
  // Nothing on it or above it sets one: the browser's own default, such as
  // the 16px a `body` without a font size passes down.
  return {
    property,
    value,
    tokens: valueLines(el, property, index, data.theme)[0]?.tokens ?? [],
    from: { kind: "inherited", node: null, levelsUp: 0, via: null },
    state: null,
    pseudo: null,
  };
}

/** Whether the stylesheets, the style attribute or a class set a node's own
 *  colour at rest. `inherit` and `unset` leave it to the parent. */
export function setsColor(el: Element, data: InspectorData): boolean {
  const { written, ruled } = readWritten(el, data);
  return written.some((l) => !l.state && !l.pseudo && COVERS.color(l.property)) || [...ruled.keys()].some(COVERS.color);
}

/** Everything the stylesheets and the element's classes say about it, then
 *  the computed values nothing written answers for. */
export function readStyles(
  el: Element,
  data: InspectorData,
  index: TokenIndex
): { styledBy: RuleReport[]; tokens: TokenLine[] } {
  const cache = new Map<Element, StyleReading>();
  const { styledBy, written, ruled } = readWritten(el, data);
  const resting = written.filter((l) => !l.state && !l.pseudo);
  // A one-off class in play names the token its value equals, if one does:
  // the fix is that token's class.
  const cs = getComputedStyle(el);
  for (const l of resting) {
    if (l.from.kind !== "class" || l.tokens.length) continue;
    const property = l.property.replace(/ \((\w+)\)$/, "");
    l.equals = tokensEqualTo(property, cs.getPropertyValue(property).trim(), index)[0]?.name ?? null;
  }
  const fallback: TokenLine[] = [];
  for (const p of STANDARD) {
    // Something as written answers it, a line or a keyword (`background:
    // none`): the value match would only guess at what a rule already says.
    if (resting.some((l) => COVERS[p](l.property)) || [...ruled.keys()].some((d) => COVERS[p](d))) continue;
    const byValue = valueLines(el, p, index, data.theme);
    const inherited = INHERITED.has(p) ? inheritedLine(el, p, data, index, cache) : null;
    // A default nothing sets is said only where the value match would have
    // reported the property at all: a font size always, a weight only when
    // a token holds it, so an unset 400 is not a line on every element.
    if (inherited && (inherited.from.kind !== "inherited" || inherited.from.node || byValue.length)) {
      fallback.push(inherited);
    } else if (!inherited) fallback.push(...byValue);
  }
  return {
    styledBy,
    tokens: [
      ...resting,
      ...fallback,
      ...written.filter((l) => l.state && !l.pseudo),
      ...written.filter((l) => l.pseudo),
    ],
  };
}

/* ── Patterns ─────────────────────────────────────────────────────────── */

/** How many elements on the page a selector matches, the inspector's own
 *  excepted. */
function countMatching(selector: string, ignore: string): number {
  try {
    return Array.from(document.querySelectorAll(selector)).filter((e) => !e.closest(ignore)).length;
  } catch {
    return 0;
  }
}

/** Every element on the page wearing a pattern, its BEM variants included. */
export function patternElements(name: string, ignore: string): Element[] {
  return Array.from(document.querySelectorAll(`.${CSS.escape(name)}, [class*="${name}--"]`)).filter(
    (e) =>
      !e.closest(ignore) &&
      (e.classList.contains(name) || Array.from(e.classList).some((c) => c.startsWith(`${name}--`)))
  );
}

/** How far up a pattern on an ancestor still counts. Three levels reach a
 *  card from its title or a paragraph inside it; the component detector's
 *  eight let the page's own column (`.sys-main`) answer for any element four
 *  to seven levels into it, which named where an element sat, not what it
 *  was. */
const PATTERN_REACH = 3;

/** The patterns the pinned element wears, or else the nearest ancestor that
 *  wears any, within `PATTERN_REACH` levels above it. Its class names the
 *  pattern, a BEM suffix cut off. */
export function readPatterns(
  el: Element,
  data: InspectorData,
  ignore: string
): { node: Element; levelsUp: number; list: PatternReport[] } | null {
  const byName = new Map(data.styles.patterns.map((p) => [p.name, p]));
  const chain: Element[] = [];
  for (let n: Element | null = el; n && chain.length <= PATTERN_REACH; n = n.parentElement) chain.push(n);
  for (const [depth, here] of chain.entries()) {
    const worn = [...new Set(Array.from(here.classList).map((c) => c.replace(/--.*$/, "")))].flatMap((n) => {
      const p = byName.get(n);
      return p ? [p] : [];
    });
    if (!worn.length) continue;
    const list = worn.map((p): PatternReport => {
      const seen = new Set<string>();
      const variants: PatternReport["variants"] = [];
      for (const ref of p.rules) {
        const rule = data.styles.rules[ref.rule];
        const s = rule.selectors[ref.selector];
        if (s.kind !== "variant" || seen.has(s.modifier)) continue;
        seen.add(s.modifier);
        variants.push({
          modifier: s.modifier,
          on: Boolean(s.compound && matchesSafely(here, s.compound)),
          instances: s.compound ? countMatching(s.compound, ignore) : 0,
          comment: rule.comment,
          file: rule.file,
          line: rule.line,
        });
      }
      return {
        name: p.name,
        label: p.comment ? summaryOf(p.comment).head : null,
        comment: p.comment,
        file: p.file,
        line: p.line,
        variants,
        instances: patternElements(p.name, ignore).length,
      };
    });
    return { node: here, levelsUp: depth, list };
  }
  return null;
}

/** The user-action states an element is in: what its computed values may
 *  sit mid-transition into. Touch has none worth reading: inspect mode is a
 *  desktop tool, and a narrow window inspects a phone layout. */
export function readState(el: Element): string[] {
  return [
    matchesSafely(el, ":hover") ? "hovered" : null,
    matchesSafely(el, ":focus") ? "focused" : null,
    matchesSafely(el, ":active") ? "active" : null,
  ].filter((s): s is string => Boolean(s));
}
