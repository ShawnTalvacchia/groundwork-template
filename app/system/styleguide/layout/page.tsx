import { getStyleguide, utilityFor, utilityByRootToken } from "@/lib/styleguide";
import { SgSection, cleanNote, getBackings } from "../derived-ui";

// Layout — the measurement system: spacing, radius, shadows, border widths,
// breakpoints, and the shell constants. Derived from globals.css.
// (Was the "Tokens" tab; its color half now lives on Colors.)

const px = (v: string) => parseInt(v, 10) || 0;

function Row({
  name,
  value,
  mobile,
  note,
  utility,
  preview,
}: {
  name: string;
  value: string;
  mobile?: string | null;
  note?: string | null;
  utility?: string;
  preview?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0">
      <span className="flex w-64 shrink-0 flex-col gap-[2px] min-w-0">
        <span className="flex items-baseline gap-sm min-w-0">
          <code className="text-xs font-mono text-fg-primary whitespace-nowrap">{name}</code>
          {utility && <code className="text-2xs font-mono text-brand-strong truncate">{utility}</code>}
        </span>
        <span className="text-2xs text-fg-tertiary tabular-nums">
          {value}
          {mobile ? ` · ${mobile} mobile` : ""}
        </span>
      </span>
      {preview}
      {note && <span className="text-2xs text-fg-tertiary min-w-0 flex-1 basis-40 truncate">{note}</span>}
    </div>
  );
}

export default function LayoutScalePage() {
  const data = getStyleguide();
  const backings = getBackings();
  const utilities = utilityByRootToken();
  const rootOf = (frag: string) => data.root.find((s) => s.title.includes(frag))?.tokens ?? [];
  const themeOf = (title: string) => data.theme.find((s) => s.title === title)?.tokens ?? [];

  const spacingAll = rootOf("SPACING");
  const spacing = spacingAll.filter((t) => !/^--space-\d+$/.test(t.name));
  const spacingNumeric = spacingAll.filter((t) => /^--space-\d+$/.test(t.name));
  const radiusAll = rootOf("RADIUS");
  const radiusScale = radiusAll.filter((t) => !t.target);
  const radiusAliases = radiusAll.filter((t) => t.target);
  const shadows = rootOf("SHADOWS");
  const borderWidths = rootOf("SEMANTIC TOKENS — Border").filter((t) => t.name.startsWith("--border-width"));
  const layoutTokens = rootOf("LAYOUT");
  const breakpoints = themeOf("Breakpoints");
  const containers = themeOf("Container max-widths");

  return (
    <main className="flex flex-col gap-3xl">
      <SgSection title="Spacing" note="The named scale. Tailwind: gap-md, p-xl, m-sm…">
        <div className="flex flex-col">
          {spacing.map((t) => (
            <Row
              key={t.name}
              name={t.name}
              value={t.light}
              utility={utilities.get(t.name)}
              note={cleanNote(t.note)}
              preview={
                <span
                  className="h-3 rounded-tiny bg-brand-light shrink-0"
                  style={{ width: Math.min(px(t.light) * 2.5, 220) }}
                />
              }
            />
          ))}
        </div>
        <details>
          <summary className="text-xs text-fg-secondary cursor-pointer">
            Numeric aliases ({spacingNumeric.length}) — legacy compat; use the named scale in new code
          </summary>
          <p className="mt-sm text-2xs font-mono text-fg-tertiary leading-relaxed">
            {spacingNumeric.map((t) => `${t.name}: ${t.light}`).join(" · ")}
          </p>
        </details>
      </SgSection>

      <div className="grid gap-3xl lg:grid-cols-2">
        <SgSection title="Radius scale">
          <div className="flex flex-col">
            {radiusScale.map((t) => (
              <Row
                key={t.name}
                name={t.name}
                value={t.light}
                utility={utilities.get(t.name)}
                preview={
                  <span
                    className="h-9 w-14 shrink-0 border-2 border-edge-strongest bg-surface-inset"
                    style={{ borderRadius: Math.min(px(t.light), 24) }}
                  />
                }
              />
            ))}
          </div>
        </SgSection>

        <SgSection title="Radius aliases" note="What components actually reach for.">
          <div className="flex flex-col">
            {radiusAliases.map((t) => (
              <Row
                key={t.name}
                name={t.name}
                value={`→ ${t.target} (${t.light})`}
                utility={utilities.get(t.name)}
                note={cleanNote(t.note)}
                preview={
                  <span
                    className="h-9 w-14 shrink-0 border-2 border-edge-strongest bg-surface-inset"
                    style={{ borderRadius: t.light.endsWith("%") ? t.light : Math.min(px(t.light), 24) }}
                  />
                }
              />
            ))}
          </div>
        </SgSection>
      </div>

      <SgSection
        title="Shadows"
        note="Elevation. Dark mode deepens every step so elevation still reads on dark surfaces — both values shown."
      >
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {shadows.map((t) => (
            <div key={t.name} className="flex flex-col gap-sm">
              <code className="text-xs font-mono text-fg-primary">{t.name}</code>
              <div className="flex items-center gap-md">
                <span
                  className="flex h-16 flex-1 items-center justify-center rounded-panel text-2xs text-fg-tertiary"
                  style={{ background: "var(--surface-top)", boxShadow: t.light }}
                >
                  light
                </span>
                <span
                  className="flex h-16 flex-1 items-center justify-center rounded-panel text-2xs"
                  style={{ background: backings.dark, boxShadow: t.dark ?? t.light, color: backings.darkText }}
                >
                  dark
                </span>
              </div>
              <code className="text-2xs font-mono text-fg-tertiary leading-snug">{t.light}</code>
            </div>
          ))}
        </div>
      </SgSection>

      <div className="grid gap-3xl lg:grid-cols-2">
        <SgSection title="Border widths">
          <div className="flex flex-col">
            {borderWidths.map((t) => (
              <Row
                key={t.name}
                name={t.name}
                value={t.light}
                preview={
                  <span className="w-24 shrink-0" style={{ borderTop: `${t.light} solid var(--text-primary)` }} />
                }
              />
            ))}
          </div>
        </SgSection>

        <SgSection title="Breakpoints & containers" note="Tailwind variants (md:) and max-w-* stops.">
          <div className="flex flex-col">
            {[...breakpoints, ...containers].map((t) => (
              <Row key={t.name} name={t.name} value={t.light} utility={utilityFor(t.name)} note={cleanNote(t.note)} />
            ))}
          </div>
        </SgSection>
      </div>

      <SgSection title="Shell constants" note="The layout skeleton — nav, sidebar, content column. Mobile overrides shown where they exist.">
        <div className="flex flex-col">
          {layoutTokens.map((t) => (
            <Row key={t.name} name={t.name} value={t.light} mobile={t.mobile} note={cleanNote(t.note)} />
          ))}
        </div>
      </SgSection>

      <p className="text-xs leading-relaxed text-fg-tertiary">
        Source: <code className="sys-code">app/globals.css</code>, parsed at build time.
      </p>
    </main>
  );
}
