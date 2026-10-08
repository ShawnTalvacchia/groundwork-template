"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { REACH_LABEL } from "@/lib/reach";
import {
  buildContextBlock,
  buildIndex,
  describePin,
  identifyComponent,
  listSeparator,
  nodeLabel,
  resolveElement,
  SIBLING_VERB,
  summaryOf,
  tokensFromStylesheets,
  usageLine,
  variantPhrase,
  type InspectorData,
  type PinnedContext,
  type PinReport,
} from "./resolve";

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
 * copied block both render from it, so they say the same things.
 *
 * ↑ moves the pin to the pinned element's parent and ↓ back the way it came,
 * because a click usually lands on the innermost node, and a container its
 * children cover cannot be clicked at all.
 *
 * A session driving this browser reads the current pin from
 * `window.__inspectorPin`: the report and the block the Copy button copies.
 * It is null while inspecting with nothing pinned, and absent when inspect
 * mode is off, so the three states read apart.
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
  const [pinned, setPinned] = useState<PinnedContext | null>(null);
  const [report, setReport] = useState<PinReport | null>(null);
  const [pinnedRect, setPinnedRect] = useState<Rect | null>(null);
  const [copied, setCopied] = useState(false);
  const [docExpanded, setDocExpanded] = useState(false);
  const probeRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<InspectorData | null>(null);
  const gatedRef = useRef(false);
  const pinnedRef = useRef<PinnedContext | null>(null);
  /** The elements ↑ climbed out of, the current pin's own child first, so ↓
   *  retraces them. */
  const climbedRef = useRef<Element[]>([]);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

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
        setData({
          project: "",
          tokens: tokensFromStylesheets(),
          components: [],
          patterns: [],
          patternsDocUrl: "",
          docs: [],
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  const pin = useCallback((el: Element) => {
    const d = dataRef.current;
    const probe = probeRef.current;
    if (!d || !probe) return;
    const index = buildIndex(d.tokens, probe);
    const next: PinnedContext = {
      element: el,
      component: identifyComponent(el, d.components),
      matches: resolveElement(el, index),
    };
    // Set here as well as by the effect below, so a key pressed before the
    // re-render moves from this pin rather than the last one.
    pinnedRef.current = next;
    setPinned(next);
    setReport(describePin(d, next, { gated: gatedRef.current, page: window.location.pathname }));
    setPinnedRect(rectOf(el));
    setCopied(false);
    setDocExpanded(false); // a new pin starts collapsed
  }, []);

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
        climbedRef.current = [];
        setPinned(null);
        setReport(null);
        setPinnedRect(null);
      } else {
        onExit();
      }
    };
    const onScroll = () => {
      setHoverRect(null);
      if (pinnedRef.current) setPinnedRect(rectOf(pinnedRef.current.element));
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
  }, [pin, climb, descend, onExit]);

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

  const c = report?.component ?? null;

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
                  pinned element a step in, the way a layers panel nests
                  them. One level orients; ↑ and ↓ explore the rest, so the
                  panel stays short. The copied block names four. */}
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
                    (() => {
                      // Summary by default. The depth is one click away here
                      // and always whole in the copied block, so trimming the
                      // panel costs the reader nothing.
                      const { head, rest } = summaryOf(c.docblock);
                      return (
                        <p className="leading-relaxed text-fg-secondary">
                          {docExpanded ? `${head} ${rest}` : head}
                          {rest && (
                            <button type="button" onClick={() => setDocExpanded((v) => !v)} className={`ml-1 ${LINK}`}>
                              {docExpanded ? "less" : "more"}
                            </button>
                          )}
                        </p>
                      );
                    })()
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
                </section>
              )}
              <ul className={`space-y-1 ${c ? "mt-3 border-t border-edge-light pt-2" : "mt-2"}`}>
                {report.tokens.map((m, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="w-24 shrink-0 text-fg-tertiary">{m.property}</span>
                    {m.tokens[0] ? (
                      <span className="font-mono text-fg-primary">
                        {m.tokens[0].name}
                        {m.tokens[0].utility && (
                          <span className="text-fg-tertiary"> · {m.tokens[0].utility}</span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-warning-strong">{m.value} · no token</span>
                    )}
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
