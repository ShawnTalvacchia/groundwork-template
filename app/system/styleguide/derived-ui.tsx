import { getStyleguide, type TokenDef, type TokenSection } from "@/lib/styleguide";

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

/** Inline token comments often lead with a (sometimes stale) hex — the
 *  swatch shows the real value, so drop the duplicate and keep the usage. */
export function cleanNote(note: string | null): string | null {
  if (!note) return null;
  const cleaned = note.replace(/^#[0-9a-fA-F]{3,8}\s*—?\s*/, "").trim();
  return cleaned || null;
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
        <code className="text-2xs text-fg-tertiary font-mono w-[7.5ch]">{token.light}</code>
      </span>
      <span
        className="flex items-center gap-xs rounded-xs px-xs py-[3px]"
        style={{ background: backings.dark }}
      >
        {token.dark ? (
          <>
            <Swatch value={token.dark} checker={checker} />
            <code className="text-2xs font-mono w-[7.5ch]" style={{ color: backings.darkText }}>
              {token.dark}
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

/** One semantic-token row: utility · token · alias target · light/dark. */
export function TokenRow({
  token,
  utility,
  backings,
  checker,
}: {
  token: TokenDef;
  utility?: string;
  backings: { dark: string; darkText: string };
  checker?: boolean;
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
}: {
  section: TokenSection;
  backings: { dark: string; darkText: string };
  checker?: boolean;
}) {
  return (
    <div className="flex flex-col gap-xs min-w-0">
      <h3 className="text-sm font-semibold text-fg-primary">{displayTitle(section.title)}</h3>
      <div className="flex flex-col">
        {section.tokens.map((t) => (
          <div key={t.name} className="flex items-center gap-sm py-[3px] min-w-0">
            <code className="text-2xs font-mono text-fg-secondary w-[16ch] truncate shrink-0">{t.name}</code>
            <ValuePair token={t} backings={backings} checker={checker} />
          </div>
        ))}
      </div>
    </div>
  );
}
