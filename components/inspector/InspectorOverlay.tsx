"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { REACH_LABEL } from "@/lib/reach";
import {
  baseName,
  buildContextBlock,
  buildIndex,
  componentElements,
  describePin,
  gatedData,
  identifyComponent,
  instancesLine,
  levelsUp,
  listSeparator,
  locationPhrase,
  nodeLabel,
  SIBLING_VERB,
  sourcePhrase,
  stateWords,
  summaryOf,
  tokensFromStylesheets,
  usageLine,
  variantName,
  variantPhrase,
  type InspectorData,
  type PinnedContext,
  type PinReport,
  type TokenLine,
} from "./resolve";
import { readLocation } from "./source";
import { patternElements, readPatterns, readState, readStyles } from "./styles";

/**
 * The inspect mode. Lazy-loaded by InspectorGate only when the URL carries
 * `?inspect` — nothing here runs during normal use (phase board: opt-in,
 * never always-on; read-only by design: the mode selects and reports, it
 * never writes).
 *
 * Interaction: hover highlights, click pins (and is swallowed, so links and
 * buttons don't fire while inspecting), Esc unpins then exits. The panel and
 * its children are excluded from targeting via the data-gw-inspector root.
 *
 * Context comes from `/system/inspector.json`, which sits behind the same
 * gate as the rest of the record (proxy.ts). When that fetch fails (a gated
 * deploy, cookie absent), the mode degrades to token names read from the
 * page's own stylesheets: still useful, never a leak.
 *
 * A pin is read once into a report (`describePin`), and the panel and the
 * copied block both render from it, so they say the same things. Where the
 * element is written arrives a moment later: the dev server's source map is
 * read for it, and the report's `location` is replaced when it lands.
 *
 * ↑ moves the pin to the pinned element's parent and ↓ back the way it came,
 * because a click usually lands on the innermost node, and a container its
 * children cover cannot be clicked at all.
 *
 * "Show all" outlines every element on the page wearing the pinned pattern,
 * or every instance of the pinned component, until the next pin or Esc.
 *
 * A session driving this browser reads the current pin from
 * `window.__inspectorPin`: the report and the block the Copy button copies.
 * It is null while inspecting with nothing pinned, and absent when inspect
 * mode is off, so the three states read apart. While the location's
 * `lines` is `pending`, the block says so; it is rewritten when they land.
 */

declare global {
  interface Window {
    __inspectorPin?: { report: PinReport; block: string } | null;
  }
}

const IGNORE = "[data-gw-inspector]";

/** Children ↓ never lands on: nothing that renders, and never the overlay. */
const UNPINNABLE = "script, style, template, noscript, link, meta";

/** The parent ↑ moves to. `body` is as far as it goes. */
function parentToPin(el: Element): Element | null {
  const p = el.parentElement;
  return p && p !== document.documentElement ? p : null;
}

/** The first child ↓ can land on: one that draws a box. */
function childToPin(el: Element): Element | null {
  for (const ch of Array.from(el.children)) {
    if (ch.matches(UNPINNABLE) || ch.closest(IGNORE)) continue;
    if (ch.getClientRects().length > 0) return ch;
  }
  return null;
}

/** Keys typed into a field are the field's, not the inspector's. */
function typing(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName)));
}

const LINK = "text-brand-main underline-offset-2 hover:underline";

/** A named absence, as the styleguide's components page prints one: a slot
 *  that says it is empty rather than disappearing. */
function Missing({ children }: { children: ReactNode }) {
  return <span className="italic text-fg-gray">{children}</span>;
}

/** The short word for where a token line came from. */
const SOURCE_TAG: Record<TokenLine["from"]["kind"], string> = {
  rule: "rule",
  class: "class",
  inline: "style",
  inherited: "inherited",
  value: "by value",
};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function InspectorOverlay({ onExit }: { onExit: () => void }) {
  const [data, setData] = useState<InspectorData | null>(null);
  const [gated, setGated] = useState(false);
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [report, setReport] = useState<PinReport | null>(null);
  const [pinnedRect, setPinnedRect] = useState<Rect | null>(null);
  const [shown, setShown] = useState<{ key: string; rects: Rect[] } | null>(null);
  const [copied, setCopied] = useState(false);
  /** Which "more" toggles are open, by key; a new pin starts them shut. */
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const probeRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<InspectorData | null>(null);
  const gatedRef = useRef(false);
  const pinnedRef = useRef<PinnedContext | null>(null);
  /** Bumped per pin, so a source map landing after the next pin is dropped. */
  const pinSeq = useRef(0);
  const shownRef = useRef<{ key: string; elements: Element[] } | null>(null);
  /** The elements ↑ climbed out of, the current pin's own child first, so ↓
   *  retraces them. */
  const climbedRef = useRef<Element[]>([]);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    let alive = true;
    fetch("/system/inspector.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: InspectorData) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (!alive) return;
        gatedRef.current = true;
        setGated(true);
        setData(gatedData(tokensFromStylesheets()));
      });
    return () => {
      alive = false;
    };
  }, []);

  const clearShown = useCallback(() => {
    shownRef.current = null;
    setShown(null);
  }, []);

  const pin = useCallback(
    (el: Element) => {
      const d = dataRef.current;
      const probe = probeRef.current;
      if (!d || !probe) return;
      // State first: nothing below may move the pointer or the focus, but
      // reading it before anything else keeps it the state the click saw.
      const state = readState(el);
      const index = buildIndex(d.tokens, probe);
      const component = identifyComponent(el, d.components);
      const location = readLocation(el, new Set(d.components.map((c) => c.file)));
      const next: PinnedContext = {
        element: el,
        component,
        patterns: readPatterns(el, d, IGNORE),
        ...readStyles(el, d, index),
        state,
        location: location.now,
        componentInstances: component ? componentElements(component.component, IGNORE).length : 0,
      };
      // Set here as well as in state, so a key pressed before the re-render
      // moves from this pin rather than the last one.
      pinnedRef.current = next;
      const seq = ++pinSeq.current;
      setReport(describePin(d, next, { gated: gatedRef.current, page: window.location.pathname }));
      setPinnedRect(rectOf(el));
      clearShown();
      setCopied(false);
      setOpen({}); // a new pin starts collapsed
      location.mapped.then((loc) => {
        if (pinSeq.current === seq) setReport((r) => (r ? { ...r, location: loc } : r));
      });
    },
    [clearShown]
  );

  /** Pin an ancestor `levels` up, remembering the way back down. */
  const climb = useCallback(
    (levels: number) => {
      let el = pinnedRef.current?.element ?? null;
      if (!el) return;
      const climbed = [...climbedRef.current];
      for (let i = 0; i < levels; i++) {
        const p = parentToPin(el);
        if (!p) break;
        climbed.unshift(el);
        el = p;
      }
      if (el === pinnedRef.current?.element) return;
      climbedRef.current = climbed;
      pin(el);
    },
    [pin]
  );

  /** Pin the child ↑ came from, or else the first child that draws a box. */
  const descend = useCallback(() => {
    const el = pinnedRef.current?.element;
    if (!el) return;
    const [back, ...rest] = climbedRef.current;
    if (back && back.parentElement === el) {
      climbedRef.current = rest;
      pin(back);
      return;
    }
    const child = childToPin(el);
    if (!child) return;
    climbedRef.current = [];
    pin(child);
  }, [pin]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest(IGNORE)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(rectOf(t));
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest(IGNORE)) return; // panel clicks pass through
      e.preventDefault();
      e.stopPropagation();
      climbedRef.current = []; // a click starts a new way down
      pin(t);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // With nothing pinned the arrows keep scrolling the page.
        if (!pinnedRef.current || typing(e.target)) return;
        e.preventDefault();
        if (e.key === "ArrowUp") climb(1);
        else descend();
        return;
      }
      if (e.key !== "Escape") return;
      if (pinnedRef.current) {
        pinnedRef.current = null;
        pinSeq.current++;
        climbedRef.current = [];
        clearShown();
        setReport(null);
        setPinnedRect(null);
      } else {
        onExit();
      }
    };
    const onScroll = () => {
      setHoverRect(null);
      if (pinnedRef.current) setPinnedRect(rectOf(pinnedRef.current.element));
      const s = shownRef.current;
      if (s) setShown({ key: s.key, rects: s.elements.map(rectOf) });
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [pin, climb, descend, onExit, clearShown]);

  // One rendering of the block, so the global and the Copy button can never
  // hand over two different texts.
  const block = useMemo(() => (report ? buildContextBlock(report) : null), [report]);

  useEffect(() => {
    window.__inspectorPin = report && block ? { report, block } : null;
  }, [report, block]);
  useEffect(
    () => () => {
      delete window.__inspectorPin;
    },
    []
  );

  const copy = async () => {
    if (!block) return;
    await navigator.clipboard.writeText(block);
    setCopied(true);
  };

  /** Outline every element on the page in `elements`, or clear the outlines
   *  when this set is the one shown. Read-only: boxes over the page. */
  const toggleShown = (key: string, elements: () => Element[]) => {
    if (shownRef.current?.key === key) {
      clearShown();
      return;
    }
    const list = elements();
    shownRef.current = { key, elements: list };
    setShown({ key, rects: list.map(rectOf) });
  };

  /** A source location as a path: the file's name and line, the full path
   *  in its tooltip; the block carries it whole. Not a link: no rendered
   *  page exists for a source file, and the dev server's editor launcher
   *  opens whatever editor it guesses, which for a terminal user is `vi` in
   *  a new window, not the line asked for. */
  const spot = (file: string, line: number | null) => (
    <span className="font-mono text-fg-secondary" title={`${file}${line ? `:${line}` : ""}`}>
      {baseName(file)}
      {line ? `:${line}` : ""}
    </span>
  );

  /** A sentence that may run long: its first sentence, the rest a click away. */
  const more = (id: string, text: string, className: string) => {
    const { head, rest } = summaryOf(text);
    return (
      <p key={id} className={className}>
        {open[id] ? `${head} ${rest}` : head}
        {rest && (
          <button type="button" onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))} className={`ml-1 ${LINK}`}>
            {open[id] ? "less" : "more"}
          </button>
        )}
      </p>
    );
  };

  const c = report?.component ?? null;
  const loc = report?.location ?? null;
  const where = loc ? locationPhrase(loc) : null;

  const box = (r: Rect, cls: string, key: string) => (
    <div
      key={key}
      data-gw-inspector
      className={`pointer-events-none fixed z-[9998] ${cls}`}
      style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
    />
  );

  return (
    <div data-gw-inspector>
      {/* Probe: owned here, and drawn nowhere (display: none). buildIndex
          canonicalizes token values through it, and an element with no box
          reports a width from its style alone. A drawn one reports the
          width layout rounded it to, which at any page zoom but 100% is
          11.9965px for a 12px token, and every length then missed. */}
      <div ref={probeRef} aria-hidden className="hidden" />

      {shown?.rects.map((r, i) => box(r, "border-2 border-dotted border-brand-strong", `shown-${i}`))}
      {hoverRect && box(hoverRect, "border border-dashed border-brand-main", "hover")}
      {pinnedRect && box(pinnedRect, "border-2 border-brand-main bg-brand-subtle/20", "pinned")}

      <aside
        data-gw-inspector
        className="fixed bottom-4 right-4 z-[9999] flex max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-panel border border-edge-regular bg-surface-popout text-fg-primary shadow-modal"
      >
        <header className="flex items-center justify-between gap-sm border-b border-edge-light px-md py-sm">
          <div>
            <p className="text-sm font-semibold">Inspect mode</p>
            <p className="text-2xs text-fg-tertiary">Read-only. Click to pin. ↑ ↓ move the pin. Esc exits.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Exit
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-md py-sm text-xs">
          {gated && (
            <p className="mb-2 rounded-sm bg-surface-inset px-2 py-1 text-2xs text-fg-tertiary">
              The record is gated on this deploy. Showing token names from the stylesheet only.
            </p>
          )}
          {!report && <p className="text-fg-secondary">Nothing pinned yet. Hover to highlight, click to pin.</p>}
          {report && (
            <>
              {/* What it sits in: the parent, which pins on click, and the
                  pinned element a step in under it, the way a layers panel
                  nests them. One level orients; ↑ and ↓ explore the rest, so
                  the panel stays short. The copied block names four. */}
              <nav aria-label="The pinned element and its parent" className="font-mono text-2xs">
                <ol>
                  {report.element.ancestors[0] && (
                    <li>
                      <button
                        type="button"
                        onClick={() => climb(1)}
                        className="text-fg-tertiary underline-offset-2 hover:text-fg-primary hover:underline"
                      >
                        {nodeLabel(report.element.ancestors[0])}
                      </button>
                    </li>
                  )}
                  <li
                    aria-current="true"
                    className={`break-all font-semibold text-fg-primary ${report.element.ancestors[0] ? "pl-sm" : ""}`}
                  >
                    {report.element.tag}
                    {report.element.classes.length ? `.${report.element.classes.slice(0, 4).join(".")}` : ""}
                  </li>
                </ol>
              </nav>
              {report.state.length > 0 && (
                <p className="mt-1 text-2xs text-fg-tertiary">
                  Pinned while {stateWords(report.state)}, so a value read from it may sit mid-transition.
                </p>
              )}

              {/* Where it lives: the line that writes it, and for a shared
                  component's node the line that uses the component. Lines
                  come from the dev server's source map, a moment after the
                  pin; a production build says it has none. */}
              {where && loc && (
                <section aria-label="Where it lives" className="mt-2 flex flex-col gap-0.5 border-t border-edge-light pt-2 text-2xs">
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="font-semibold text-fg-tertiary">{where.lead}</span>
                    {loc.status === "found" ? spot(loc.rendered.file, loc.rendered.line) : null}
                    {where.note && <span className="text-fg-tertiary">{where.note}</span>}
                  </p>
                  {loc.status === "found" && loc.rendered.text && (
                    <code className="block truncate font-mono text-fg-secondary" title={loc.rendered.text}>
                      {loc.rendered.text}
                    </code>
                  )}
                  {loc.status === "found" && loc.calledFrom && (
                    <p className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="font-semibold text-fg-tertiary">Called from</span>
                      {spot(loc.calledFrom.file, loc.calledFrom.line)}
                      {loc.calledFrom.fn && <span className="text-fg-tertiary">in {loc.calledFrom.fn}</span>}
                    </p>
                  )}
                  {report.styledBy.length > 0 && (
                    <div className="flex gap-1.5">
                      <span className="shrink-0 font-semibold text-fg-tertiary">Styled by</span>
                      <ul className="flex min-w-0 flex-col">
                        {report.styledBy.map((r) => (
                          <li key={`${r.file}:${r.line}:${r.selector}`} className="flex min-w-0 items-baseline gap-1.5">
                            <span className="truncate font-mono text-fg-secondary" title={r.selector}>
                              {r.selector}
                            </span>
                            {spot(r.file, r.line)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Neither detector found anything: said in words, as a missing
                  docblock is, never left as a bare class list. A refused
                  feed knows no patterns or components, and the gated note
                  above already says so. */}
              {!gated && !report.patterns && !c && (
                <p className="mt-2 border-t border-edge-light pt-2 leading-relaxed">
                  <Missing>No pattern and no shared component covers it. Its styling is its own classes.</Missing>
                </p>
              )}

              {/* The patterns it wears, from the stylesheet that styles them:
                  the class, the comment above its rule, its variants, and
                  how many on the page wear it. */}
              {report.patterns?.list.map((p) => (
                <section key={p.name} className="mt-2 flex flex-col gap-1 border-t border-edge-light pt-2">
                  <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="font-mono font-semibold">.{p.name}</span>
                    <span className="text-2xs text-fg-tertiary">pattern</span>
                    {report.patterns?.node && (
                      <span className="text-2xs text-fg-tertiary">
                        on {nodeLabel(report.patterns.node)}, {levelsUp(report.patterns.levelsUp)}
                      </span>
                    )}
                  </p>
                  {p.comment ? (
                    more(`pattern:${p.name}`, p.comment, "leading-relaxed text-fg-secondary")
                  ) : (
                    <p className="leading-relaxed">
                      <Missing>Named by its class: no comment sits above its rule.</Missing>
                    </p>
                  )}
                  {p.variants.length > 0 && (
                    <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-2xs">
                      <span className="font-semibold text-fg-tertiary">Variants</span>
                      {p.variants.map((v) => (
                        <span key={v.modifier} className={`font-mono ${v.on ? "font-semibold text-fg-primary" : "text-fg-tertiary"}`}>
                          {variantName(v.modifier)} {v.on ? "on" : "off"} · {v.instances}
                        </span>
                      ))}
                    </p>
                  )}
                  {p.variants
                    .filter((v) => v.on && v.comment)
                    .map((v) =>
                      more(`variant:${p.name}${v.modifier}`, `${variantName(v.modifier)}: ${v.comment}`, "leading-relaxed text-fg-secondary")
                    )}
                  <p className="flex items-baseline gap-2 text-2xs text-fg-tertiary">
                    <span>{instancesLine(p.instances)}</span>
                    <button
                      type="button"
                      onClick={() => toggleShown(`pattern:${p.name}`, () => patternElements(p.name, IGNORE))}
                      className={LINK}
                    >
                      {shown?.key === `pattern:${p.name}` ? "Hide them" : "Show all"}
                    </button>
                  </p>
                </section>
              ))}

              {c && (
                <section className="mt-2 flex flex-col gap-1.5 border-t border-edge-light pt-2">
                  {/* The reach pill sits on the panel's own surface: the
                      Badge's quiet fill is the inset surface, so on an inset
                      box it would vanish into its ground. */}
                  <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="font-mono font-semibold">{c.name}</span>
                    <span className="text-2xs text-fg-tertiary">{c.file}</span>
                    <Badge>{REACH_LABEL[c.reach]}</Badge>
                  </p>
                  {c.docblock ? (
                    // Summary by default. The depth is one click away here
                    // and always whole in the copied block, so trimming the
                    // panel costs the reader nothing.
                    more("docblock", c.docblock, "leading-relaxed text-fg-secondary")
                  ) : (
                    <p className="leading-relaxed">
                      <Missing>No docblock. Its file is the one home for what it is.</Missing>
                    </p>
                  )}
                  <p className="leading-relaxed text-fg-secondary">
                    <span className="font-semibold">When: </span>
                    {c.whenToUse ?? <Missing>No @when tag in the docblock.</Missing>}
                  </p>
                  <p className="leading-relaxed text-fg-tertiary">
                    <span className="font-semibold">Not for: </span>
                    {c.whenNot ?? <Missing>No @whenNot tag in the docblock.</Missing>}
                  </p>
                  {c.variants.length > 0 && (
                    <p className="text-2xs text-fg-tertiary">{c.variants.map(variantPhrase).join(" · ")}</p>
                  )}
                  <p className="text-2xs text-fg-tertiary">{usageLine(c.usage)}</p>
                  <div className="flex gap-1 text-2xs text-fg-tertiary">
                    <span className="shrink-0 font-semibold">Siblings:</span>
                    {c.siblings.length === 0 ? (
                      <Missing>none. No other component shares a style module or a word of its name.</Missing>
                    ) : (
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {c.siblings.map((g) => (
                          <p key={`${g.reason}:${g.shared}`}>
                            1 of {g.total} {SIBLING_VERB[g.reason]}{" "}
                            <code className="font-mono text-fg-secondary">{g.shared}</code>, with{" "}
                            {g.others.map((o, i) => (
                              <Fragment key={o.name}>
                                {listSeparator(i, g.others.length)}
                                <a href={o.url} target="_blank" rel="noreferrer" className={LINK}>
                                  {o.name}
                                </a>
                              </Fragment>
                            ))}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="flex items-baseline gap-2 text-2xs text-fg-tertiary">
                    <span>{instancesLine(c.instances)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const component = data?.components.find((x) => x.name === c.name);
                        if (component) toggleShown(`component:${c.name}`, () => componentElements(component, IGNORE));
                      }}
                      className={LINK}
                    >
                      {shown?.key === `component:${c.name}` ? "Hide them" : "Show all"}
                    </button>
                  </p>
                </section>
              )}

              {/* Tokens in play, each with where its name came from: a rule
                  or a class as written, inherited, or matched by value. The
                  full source, file and line, is in the tooltip and the block. */}
              <ul className="mt-3 space-y-1 border-t border-edge-light pt-2">
                {report.tokens.map((m, i) => (
                  <li key={i} className="flex items-baseline gap-2" title={sourcePhrase(m.from, true)}>
                    <span className="w-24 shrink-0 truncate text-fg-tertiary" title={m.property}>
                      {m.property}
                    </span>
                    <span className="min-w-0 flex-1 break-words font-mono text-fg-primary">
                      {m.tokens.length ? (
                        <>
                          {m.from.kind === "value" ? m.tokens[0].name : m.tokens.map((t) => t.name).join(" ")}
                          {/* The class beside the token where the class is
                              the answer: the one it wears, or the one a value
                              match names. A rule's line is the rule's. */}
                          {(m.from.kind === "class" || m.from.kind === "value") && m.tokens[0].utility && (
                            <span className="text-fg-tertiary"> · {m.tokens[0].utility}</span>
                          )}
                        </>
                      ) : (
                        <span className={m.from.kind === "inherited" ? "text-fg-secondary" : "text-warning-strong"}>
                          {m.value} · no token
                        </span>
                      )}
                    </span>
                    {/* A state or pseudo-element line says so beside its
                        source, where the column has room: "rule on hover". */}
                    <span className="shrink-0 text-2xs text-fg-tertiary">
                      {[SOURCE_TAG[m.from.kind], m.state && `on ${m.state}`, m.pseudo].filter(Boolean).join(" ")}
                    </span>
                  </li>
                ))}
                {report.tokens.length === 0 && <li className="text-fg-tertiary">No tokens resolved here.</li>}
              </ul>
            </>
          )}

          {/* Docs. A pinned component links first to its own styleguide
              entry, then to the rules that name it, each straight to its own
              heading; when no rule names it, the gap is stated and links to
              the file where one would be written. Everything opens in a new
              tab so the pin survives the detour. */}
          {data && (data.docs.length > 0 || c) && (
            <div className="mt-3 border-t border-edge-light pt-2">
              <p className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">Docs</p>

              {c && report && (
                <ul className="mt-1 space-y-0.5">
                  <li>
                    <a href={c.url} target="_blank" rel="noreferrer" className={LINK}>
                      {c.name} in the styleguide
                    </a>
                  </li>
                  {report.rules.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noreferrer" className={LINK}>
                        {r.title}
                      </a>
                    </li>
                  ))}
                  {report.rules.length === 0 && (
                    <li className="text-fg-tertiary">
                      No rules recorded for {c.name}.
                      {report.rulesDocUrl && (
                        <>
                          {" "}
                          <a href={report.rulesDocUrl} target="_blank" rel="noreferrer" className={LINK}>
                            Write one
                          </a>
                        </>
                      )}
                    </li>
                  )}
                </ul>
              )}

              {data.docs.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-2xs">
                  {data.docs.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-fg-secondary underline-offset-2 hover:text-fg-primary hover:underline"
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-edge-light px-md py-sm">
          <Button size="sm" onClick={copy} disabled={!report}>
            {copied ? "Copied" : "Copy context for the session"}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
