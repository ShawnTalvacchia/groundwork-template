import { Badge } from "@/components/ui/Badge";
import { getStyleguide, type Reach, type TokenDef, type TokenSection } from "@/lib/styleguide";

// Shared display pieces for the derived styleguide pages. Server-only —
// everything renders from parsed literals (never `var()`), so light and dark
// values show correctly side by side in EITHER viewing theme.

/** "SEMANTIC TOKENS — Surface" → "Surface"; "_Neutral" → "Neutral". */
export function displayTitle(raw: string): string {
  return raw
    .replace(/^SEMANTIC TOKENS\s*—\s*/, "")
    .replace(/^CONVENIENCE ALIASES.*/, "Convenience aliases")
    .replace(/^TYPOGRAPHY\s*—\s*/, "")
    .replace(/^_/, "")
    .replace(/\s\s+/g, " ")
    .trim();
}

/** Inline token comments often lead with a (sometimes stale) hex or length —
 *  the row shows the real value, so drop the duplicate and keep the usage. */
export function cleanNote(note: string | null): string | null {
  if (!note) return null;
  const cleaned = note.replace(/^(#[0-9a-fA-F]{3,8}|\d+(\.\d+)?(px|rem|em))\s*—?\s*/, "").trim();
  return cleaned || null;
}

export type Resolved = { light: string; dark: string };

/** Every token's resolved value per theme, by name — what a contrast
 *  measurement reads, so the page and the CSS cannot disagree. */
export function tokenTable(): Map<string, Resolved> {
  const data = getStyleguide();
  const out = new Map<string, Resolved>();
  for (const t of [...data.root, ...data.theme].flatMap((s) => s.tokens)) {
    if (!out.has(t.name)) out.set(t.name, { light: t.light, dark: t.dark ?? t.light });
  }
  return out;
}

/** The two page backings, parsed — used to render cross-theme previews. */
export function getBackings(): { light: string; dark: string; darkText: string } {
  const all = getStyleguide().root.flatMap((s) => s.tokens);
  const find = (n: string) => all.find((t) => t.name === n);
  return {
    light: find("--surface-top")?.light ?? "#ffffff",
    dark: find("--surface-top")?.dark ?? "#1e1f1f",
    darkText: find("--text-secondary")?.dark ?? "#b6b8b8",
  };
}

/** The two theme panes, derived.
 *
 *  A component demo can only be compared across themes if both themes are on
 *  screen at once, and `:root[data-theme="dark"]` is root-scoped — a nested
 *  `data-theme` changes nothing. Redeclaring the dark values by hand would be
 *  a second copy of the palette, which is the one thing this surface exists
 *  not to do, so the panes are emitted from the same parse the token pages
 *  render: every token that resolves differently in dark, at its parsed value.
 *
 *  BOTH layers have to be set, and that is the part that is easy to get
 *  wrong. A custom property's `var()` is substituted where the property is
 *  DECLARED, so `--color-fg-primary: var(--text-primary)` computed on `:root`
 *  inherits as a literal — overriding `--text-primary` alone on a descendant
 *  does nothing at all. The real dark theme works because it redeclares on
 *  `:root`, the same element. Emitting the `@theme` aliases too is what makes
 *  a nested pane behave.
 *
 *  The light pane is emitted for the same reason the token pages print
 *  literals rather than `var()`: a reader in dark mode still has to see the
 *  light rendering. `color-scheme` rides along so native controls (the
 *  `<input>` caret, a scrollbar) follow their pane. */
export function ThemePanesStyle() {
  const data = getStyleguide();
  const tokens = [...data.root, ...data.theme].flatMap((s) => s.tokens).filter((t) => t.dark);
  const decls = (pick: (t: TokenDef) => string) =>
    tokens.map((t) => `${t.name}:${pick(t)}`).join(";");
  const css =
    `.sg-pane-light{color-scheme:light;${decls((t) => t.light)}}` +
    `.sg-pane-dark{color-scheme:dark;${decls((t) => t.dark ?? t.light)}}`;
  return <style>{css}</style>;
}

export function SgSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string | null;
  children: React.ReactNode;
}) {
  return (
    // min-w-0: sections sit inside grid/flex parents, and a nowrap child
    // (truncate) would otherwise inflate min-content and blow the page out
    // sideways on mobile.
    <section className="flex min-w-0 flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
        {note && <p className="text-xs text-fg-tertiary leading-relaxed max-w-[72ch]">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** Who reaches for a token or component, from the census. The shared Badge
 *  in its quiet tone, so it reads as a mark rather than as more of the name
 *  beside it; the word carries the meaning on every row. */
const REACH_LABEL: Record<Reach, string> = {
  product: "product",
  dashboard: "dashboard",
  both: "both",
  none: "unused",
};

export function ReachTag({ reach }: { reach: Reach | undefined }) {
  if (!reach) return null;
  return <Badge>{REACH_LABEL[reach]}</Badge>;
}

/** A color swatch + its literal value. `checker` shows alpha honestly. */
export function Swatch({ value, checker }: { value: string; checker?: boolean }) {
  return (
    <span
      className={`inline-block h-6 w-9 shrink-0 rounded-xs border border-edge-strong ${checker ? "sgd-checker" : ""}`}
    >
      <span className="block h-full w-full rounded-[inherit]" style={{ background: value }} />
    </span>
  );
}

/** A colour value short enough for its cell. A translucent colour prints as
 *  its hex and its alpha (`#92451f 45%`), whether the CSS writes it as
 *  `rgba()` or as a `color-mix()` toward transparent: written out, either one
 *  wrapped to five lines in a cell sized for a hex. The swatch still paints
 *  the value as written, and the cell's title carries it in full. Anything
 *  else prints as it is. */
export function shortValue(value: string): string {
  const rgba = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s/]+([\d.]+)(%?)\s*\)$/);
  if (rgba) {
    const hex = [rgba[1], rgba[2], rgba[3]].map((c) => Number(c).toString(16).padStart(2, "0")).join("");
    const alpha = rgba[5] ? Number(rgba[4]) : Number(rgba[4]) * 100;
    return `#${hex} ${Math.round(alpha)}%`;
  }
  const mix = value.match(/^color-mix\(in [\w-]+,\s*(#[0-9a-fA-F]{3,8})\s+([\d.]+)%,\s*transparent\s*\)$/);
  if (mix) return `${mix[1]} ${Math.round(Number(mix[2]))}%`;
  return value;
}

/** Light + dark value cells for one token. Dark sits on a dark backing so
 *  lifted dark-mode values read as they will in situ. */
export function ValuePair({
  token,
  backings,
  checker,
}: {
  token: TokenDef;
  backings: { dark: string; darkText: string };
  checker?: boolean;
}) {
  return (
    <span className="flex items-center gap-sm shrink-0">
      <span className="flex items-center gap-xs">
        <Swatch value={token.light} checker={checker} />
        <code className="min-w-[7.5ch] whitespace-nowrap text-2xs text-fg-tertiary font-mono" title={token.light}>
          {shortValue(token.light)}
        </code>
      </span>
      <span
        className="flex items-center gap-xs rounded-xs px-xs py-[3px]"
        style={{ background: backings.dark }}
      >
        {token.dark ? (
          <>
            <Swatch value={token.dark} checker={checker} />
            <code
              className="min-w-[7.5ch] whitespace-nowrap text-2xs font-mono"
              style={{ color: backings.darkText }}
              title={token.dark}
            >
              {shortValue(token.dark)}
            </code>
          </>
        ) : (
          <span className="text-2xs w-[12ch] text-center" style={{ color: backings.darkText }}>
            same in dark
          </span>
        )}
      </span>
    </span>
  );
}

/** One semantic-token row: utility · token · alias target · who reaches for
 *  it · light/dark. A target that lands on an imported token names it. */
export function TokenRow({
  token,
  utility,
  backings,
  checker,
  reach,
}: {
  token: TokenDef;
  utility?: string;
  backings: { dark: string; darkText: string };
  checker?: boolean;
  reach?: Reach;
}) {
  const note = cleanNote(token.note);
  return (
    <div className="flex flex-wrap items-center gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0">
      <span className="flex min-w-0 flex-1 basis-56 flex-col gap-[2px]">
        <span className="flex items-baseline gap-sm min-w-0">
          <code className="text-xs font-mono text-fg-primary whitespace-nowrap">{token.name}</code>
          {token.target && (
            <code className="text-2xs font-mono text-fg-gray truncate">→ {token.target}</code>
          )}
          {token.product && (
            <code className="text-2xs font-mono text-fg-gray truncate">
              {token.product === token.target ? "imported" : `from ${token.product}`}
            </code>
          )}
          <ReachTag reach={reach} />
        </span>
        <span className="flex items-baseline gap-sm min-w-0">
          {utility && <code className="text-2xs font-mono text-brand-strong whitespace-nowrap">{utility}</code>}
          {note && <span className="text-2xs text-fg-tertiary truncate">{note}</span>}
        </span>
      </span>
      <ValuePair token={token} backings={backings} checker={checker} />
    </div>
  );
}

/** A primitive ramp (Neutral, Brand, a status family) as a compact column. */
export function Ramp({
  section,
  backings,
  checker,
  census,
}: {
  section: TokenSection;
  backings: { dark: string; darkText: string };
  checker?: boolean;
  census: Map<string, Reach>;
}) {
  return (
    <div className="flex flex-col gap-xs min-w-0">
      <h3 className="text-sm font-semibold text-fg-primary">{displayTitle(section.title)}</h3>
      <div className="flex flex-col">
        {section.tokens.map((t) => (
          // The name gives way before anything else does: it truncates (the
          // full name is its title) so the row never outgrows its column.
          <div key={t.name} className="flex items-center gap-sm py-[3px] min-w-0">
            <span className="flex min-w-0 flex-1 items-center gap-sm">
              <code className="min-w-0 truncate text-2xs font-mono text-fg-secondary" title={t.name}>
                {t.name}
              </code>
              <span className="shrink-0">
                <ReachTag reach={census.get(t.name)} />
              </span>
            </span>
            <ValuePair token={t} backings={backings} checker={checker} />
          </div>
        ))}
      </div>
    </div>
  );
}
