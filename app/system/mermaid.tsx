"use client";

import { useEffect, useId, useState } from "react";
import { THEME_CHANGED_EVENT } from "@/lib/theme";

// A mermaid fence in a rendered doc becomes a diagram.
//
// The doc reader showed a fence as a code block, which is fine for code and
// useless for a map: the run's picture doc exists so a person can SEE the
// loop and the site the run is building toward, and a flow map read as
// source is not a picture. Rendered on the client because mermaid is a DOM
// library; the doc's own text is the source of truth and stays one click
// away under the diagram, so nothing here authors anything.
//
// Skinned from the tokens at render time — the diagram reads the same
// variables the page does, so it holds in dark mode and follows the theme
// toggle live rather than shipping mermaid's own palette.

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function themeVariables() {
  const fg = token("--text-primary");
  const fgSoft = token("--text-secondary");
  const edge = token("--border-strong") || token("--border-regular");
  const surface = token("--surface-top") || token("--surface-base");
  const inset = token("--surface-inset");
  const brand = token("--brand-main");
  const font = token("--font-sans") || "system-ui, sans-serif";
  return {
    fontFamily: font,
    fontSize: "13px",
    background: surface,
    primaryColor: inset,
    primaryTextColor: fg,
    primaryBorderColor: edge,
    secondaryColor: inset,
    secondaryTextColor: fg,
    secondaryBorderColor: edge,
    tertiaryColor: surface,
    tertiaryTextColor: fg,
    tertiaryBorderColor: edge,
    lineColor: fgSoft,
    textColor: fg,
    mainBkg: inset,
    nodeBorder: edge,
    clusterBkg: surface,
    clusterBorder: edge,
    titleColor: fg,
    edgeLabelBackground: surface,
    nodeTextColor: fg,
    // The one accent: the active node / highlight class, off the brand ramp.
    noteBkgColor: inset,
    noteTextColor: fg,
    noteBorderColor: brand,
  };
}

export function Mermaid({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Re-render when the theme changes — the toggle broadcasts, and the OS
  // flip under `system` lands as a `data-theme` mutation.
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(THEME_CHANGED_EVENT, bump);
    const obs = new MutationObserver(bump);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, bump);
      obs.disconnect();
    };
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: themeVariables(),
          flowchart: { htmlLabels: false, curve: "basis" },
        });
        const { svg } = await mermaid.render(`m${id}${tick}`, code);
        if (live) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      live = false;
    };
  }, [code, id, tick]);

  return (
    <figure className="sys-diagram">
      {error ? (
        // A map that fails to parse is still the doc's content: show the
        // source, say why, and never render nothing.
        <p className="text-xs leading-relaxed text-fg-tertiary">Diagram did not render — {error.split("\n")[0]}</p>
      ) : svg ? (
        <div className="sys-diagram-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="text-xs leading-relaxed text-fg-tertiary">Rendering diagram…</p>
      )}
      <details className="sys-diagram-source">
        <summary className="text-2xs text-fg-tertiary">source</summary>
        <pre>
          <code>{code}</code>
        </pre>
      </details>
    </figure>
  );
}
