"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import nextDynamic from "next/dynamic";
import type { PinReport } from "./resolve";

/**
 * The element inspector's entry gate — the only inspector code that ships on
 * a normal page load. Opt-in by constraint: the mode activates when the URL
 * carries `?inspect` or a session calls `window.__inspector.pin`, and until
 * then this renders nothing, holds no listeners, and the overlay bundle is
 * not downloaded. `next/dynamic` with `ssr: false` is what keeps the overlay
 * out of every page's JS until one of the two asks for it.
 *
 * A session driving the browser asks for a reading with
 * `await window.__inspector.pin(target)`, where `target` is an element, a
 * selector matching exactly one, or `{ selector, text }` to pick one by the
 * text or label it contains, ignoring case and spacing. The target is
 * resolved here, so a selector matching none or several is refused, the
 * first matches named, and nothing loads. Otherwise the call
 * enters the mode as the flag does (the URL gains `?inspect`, Esc exits),
 * pins the element through the overlay's own `pin`, and resolves with the
 * object `window.__inspectorPin` then holds: the report, and the block the
 * Copy button copies, once the location's lines have landed.
 *
 * The flag is written and stripped with history.replaceState, which Next's
 * router reads, so `flagged` follows it a render later. `ask` holds the mode
 * on through that render on the way in, and `exited` holds it off on the way
 * out; a fresh `?inspect` or a session's next ask clears `exited`.
 */

/** What a session hands `window.__inspector.pin`. */
export type InspectorTarget = Element | string | { selector: string; text: string };

/** A pin as a session reads it: the report, and the block the Copy button copies. */
export interface InspectorPin {
  report: PinReport;
  block: string;
}

/** A session's ask, settled by the overlay once the pin's location lands. */
export interface InspectorAsk {
  element: Element;
  resolve: (pin: InspectorPin) => void;
  reject: (reason: Error) => void;
}

declare global {
  interface Window {
    __inspector?: { pin: (target: InspectorTarget) => Promise<InspectorPin> };
    __inspectorPin?: InspectorPin | null;
  }
}

/** The inspector's own nodes, which are never a target. */
export const IGNORE = "[data-gw-inspector]";

const InspectorOverlay = nextDynamic(
  () => import("./InspectorOverlay").then((m) => m.InspectorOverlay),
  { ssr: false }
);

/** Text with every space removed and lowercased, so a phrase matches across
 *  the block boundaries `textContent` runs together and whatever case CSS
 *  renders it in. */
const squash = (s: string | null) => (s ?? "").replace(/\s+/g, "").toLowerCase();

/** How a refusal names a match: its tag and first class, so nested matches
 *  read apart, then its opening text or else its label. */
function matchName(el: Element): string {
  const cls = el.classList[0];
  const tag = `<${el.tagName.toLowerCase()}${cls ? `.${cls}` : ""}>`;
  const text = (el instanceof HTMLElement ? el.innerText : el.textContent ?? "").replace(/\s+/g, " ").trim();
  const said = text || el.getAttribute("aria-label");
  return said ? `${tag} "${said.length > 40 ? `${said.slice(0, 39)}…` : said}"` : tag;
}

/** The one element a target names. Throws, in words, when it names none or
 *  several: the inspector pins one and never picks among matches. */
function targetElement(target: InspectorTarget): Element {
  if (target instanceof Element) {
    if (!target.isConnected) throw new Error("That element is not on the page.");
    if (target.closest(IGNORE)) throw new Error("That element is the inspector's own.");
    return target;
  }
  const { selector, text } = typeof target === "string" ? { selector: target, text: null } : target;
  let found = Array.from(document.querySelectorAll(selector)).filter((el) => !el.closest(IGNORE));
  // Text, or the label an icon-only control carries instead: what a refusal
  // names a match by is what a session can pass back.
  const wanted = squash(text);
  if (text != null) found = found.filter((el) => [el.textContent, el.getAttribute("aria-label")].some((t) => squash(t).includes(wanted)));
  const asked = text != null ? `"${selector}" with the text "${text}"` : `"${selector}"`;
  if (found.length === 0) throw new Error(`No element on this page matches ${asked}.`);
  if (found.length > 1) {
    const narrow = text != null ? "narrow the selector or the text" : "narrow the selector, or pass { selector, text }";
    const some = found.slice(0, 3).map(matchName).join(", ");
    throw new Error(`${asked} matches ${found.length} elements: ${some}${found.length > 3 ? `, and ${found.length - 3} more` : ""}. The inspector pins one: ${narrow}.`);
  }
  return found[0];
}

/** Add or strip `?inspect`, keeping every other parameter. */
function writeFlag(on: boolean) {
  const url = new URL(window.location.href);
  if (url.searchParams.has("inspect") === on) return;
  url.searchParams.delete("inspect");
  // Bare, as a person types it, rather than URLSearchParams' `inspect=`.
  if (on) url.search = url.search ? `${url.search}&inspect` : "?inspect";
  window.history.replaceState(null, "", url.toString());
}

function Gate() {
  const flagged = useSearchParams().has("inspect");
  const [exited, setExited] = useState(false);
  const [ask, setAsk] = useState<InspectorAsk | null>(null);
  /** The latest ask, read outside render: two asks in one tick render once,
   *  so the first never reaches the overlay to be answered there. */
  const lastAsk = useRef<InspectorAsk | null>(null);
  const [prevFlagged, setPrevFlagged] = useState(flagged);

  // Adjust-during-render (not an effect): a fresh ?inspect navigation clears
  // a previous exit, so the mode can be re-entered, and a navigation that
  // drops the flag ends a mode a session entered, as it ends the flag's.
  if (flagged !== prevFlagged) {
    setPrevFlagged(flagged);
    if (flagged) setExited(false);
    else setAsk(null);
  }

  useEffect(() => {
    window.__inspector = {
      // A target that names no single element throws inside the executor,
      // which rejects the call before anything loads.
      pin: (target) =>
        new Promise<InspectorPin>((resolve, reject) => {
          const element = targetElement(target);
          // Settling a promise twice is a no-op, so an ask the overlay
          // already answered ignores these rejections.
          lastAsk.current?.reject(new Error("A newer ask replaced this one before its location landed."));
          const next = { element, resolve, reject };
          lastAsk.current = next;
          setExited(false);
          setAsk(next);
          writeFlag(true);
        }),
    };
    return () => {
      delete window.__inspector;
    };
  }, []);

  // The mode ended, by Exit, Esc or a navigation dropping the flag: an ask
  // still waiting is turned away.
  useEffect(() => {
    if (ask) return;
    lastAsk.current?.reject(new Error("Inspect mode ended before the pin's location landed."));
    lastAsk.current = null;
  }, [ask]);

  if ((!flagged && !ask) || exited) return null;

  return (
    <InspectorOverlay
      ask={ask}
      onExit={() => {
        writeFlag(false);
        setExited(true);
        setAsk(null);
      }}
    />
  );
}

export function InspectorGate() {
  // useSearchParams needs a Suspense boundary on statically rendered pages.
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}
