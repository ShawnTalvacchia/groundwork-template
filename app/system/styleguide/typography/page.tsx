import { getStyleguide, utilityFor, type TokenDef } from "@/lib/styleguide";
import { SgSection, cleanNote } from "../derived-ui";

// Typography — derived from globals.css. The canonical `--text-*` scale
// (the @theme single source of truth) leads; the raw `--font-size-*`
// primitives it sits over are shown beneath it, clearly secondary.

const px = (v: string) => parseInt(v, 10) || 0;

function ScaleRows({ tokens, heading }: { tokens: TokenDef[]; heading: boolean }) {
  return (
    <div className="flex flex-col">
      {tokens.map((t) => (
        <div
          key={t.name}
          className="flex flex-wrap items-baseline gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0"
        >
          <span className="flex w-56 shrink-0 flex-col gap-[2px]">
            <span className="flex items-baseline gap-sm">
              <code className="text-xs font-mono text-fg-primary">{t.name}</code>
              <code className="text-2xs font-mono text-brand-strong">{utilityFor(t.name)}</code>
            </span>
            <span className="text-2xs text-fg-tertiary tabular-nums">
              {t.light}
              {t.mobile ? ` · ${t.mobile} mobile` : ""}
            </span>
          </span>
          <span className="flex min-w-0 flex-1 basis-64 flex-col gap-[2px]">
            <span
              className="truncate text-fg-primary"
              style={{
                fontSize: t.light,
                lineHeight: 1.25,
                fontFamily: heading ? "var(--font-heading)" : "var(--font-body)",
                fontWeight: heading ? 600 : 400,
              }}
            >
              The quick brown fox jumps
            </span>
            {cleanNote(t.note) && (
              <span className="text-2xs text-fg-tertiary leading-snug">{cleanNote(t.note)}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TypographyPage() {
  const data = getStyleguide();
  const themeOf = (title: string) => data.theme.find((s) => s.title === title)?.tokens ?? [];
  const rootOf = (frag: string) => data.root.find((s) => s.title.includes(frag))?.tokens ?? [];

  const scale = [...themeOf("Font Size")].sort((a, b) => px(b.light) - px(a.light));
  const headings = scale.filter((t) => px(t.light) >= 18);
  const body = scale.filter((t) => px(t.light) < 18);
  const families = rootOf("Font families").filter((t) => t.name.startsWith("--font-"));
  const weights = rootOf("Font families").filter((t) => t.name.startsWith("--weight-"));
  const leadTrack = rootOf("Line heights");
  const rawSizes = [...rootOf("Heading sizes"), ...rootOf("Body sizes")];
  const fontSizeNote = data.theme.find((s) => s.title === "Font Size")?.note ?? null;

  return (
    <main className="flex flex-col gap-3xl">
      <SgSection title="Font families">
        <div className="grid gap-md sm:grid-cols-2">
          {families.map((t) => (
            <div key={t.name} className="sys-card flex flex-col gap-sm">
              <div className="flex items-baseline gap-sm">
                <code className="text-xs font-mono text-fg-primary">{t.name}</code>
                <code className="text-2xs font-mono text-fg-tertiary">{t.light}</code>
              </div>
              <span style={{ fontFamily: t.light, fontSize: 28, lineHeight: 1.2, fontWeight: t.name.includes("heading") ? 600 : 400 }}>
                {t.light.split(",")[0].replace(/"/g, "")}
              </span>
              <span className="text-xs text-fg-tertiary" style={{ fontFamily: t.light }}>
                ABCDEFGHIJKLM abcdefghijklm 0123456789
              </span>
            </div>
          ))}
        </div>
      </SgSection>

      <SgSection title="The type scale" note={fontSizeNote}>
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-xs">
            <h3 className="text-sm font-semibold text-fg-primary">Headings — Poppins SemiBold</h3>
            <ScaleRows tokens={headings} heading />
          </div>
          <div className="flex flex-col gap-xs">
            <h3 className="text-sm font-semibold text-fg-primary">Body — Open Sans</h3>
            <ScaleRows tokens={body} heading={false} />
          </div>
        </div>
      </SgSection>

      <div className="grid gap-3xl sm:grid-cols-2">
        <SgSection title="Weights">
          <div className="flex flex-col">
            {weights.map((t) => (
              <div key={t.name} className="flex flex-wrap items-baseline gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0">
                <code className="text-xs font-mono text-fg-primary w-[22ch] shrink-0">{t.name}</code>
                <span className="min-w-0 flex-1 basis-40 text-sm" style={{ fontWeight: Number(t.light) }}>
                  {t.light} — The quick brown fox
                </span>
              </div>
            ))}
          </div>
        </SgSection>

        <SgSection title="Line height & tracking">
          <div className="flex flex-col">
            {leadTrack.map((t) => (
              <div key={t.name} className="flex flex-wrap items-baseline gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0">
                <code className="text-xs font-mono text-fg-primary w-[22ch] shrink-0">{t.name}</code>
                <span className="flex min-w-0 flex-1 basis-40 flex-col gap-[2px]">
                  <span className="text-sm tabular-nums">{t.light}</span>
                  {cleanNote(t.note) && (
                    <span className="text-2xs text-fg-tertiary leading-snug">{cleanNote(t.note)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </SgSection>
      </div>

      <SgSection
        title="Raw size primitives"
        note="The --font-size-* layer the canonical scale resolves through. Responsive: mobile values apply under 768px. New callsites use --text-*, never these."
      >
        <div className="flex flex-col">
          {rawSizes.map((t) => (
            <div key={t.name} className="flex flex-wrap items-baseline gap-x-lg gap-y-xs border-b border-edge-light py-sm last:border-b-0">
              <code className="text-xs font-mono text-fg-primary w-[26ch] shrink-0">{t.name}</code>
              <span className="text-xs text-fg-secondary tabular-nums w-[18ch] shrink-0">
                {t.light}
                {t.mobile ? ` · ${t.mobile} mobile` : ""}
              </span>
              {cleanNote(t.note) && (
                <span className="text-2xs text-fg-tertiary min-w-0 flex-1 basis-48 truncate">{cleanNote(t.note)}</span>
              )}
            </div>
          ))}
        </div>
      </SgSection>

      <p className="text-xs leading-relaxed text-fg-tertiary">
        Source: <code className="sys-code">app/globals.css</code> (@theme Font Size + the TYPOGRAPHY
        sections), parsed at build time.
      </p>
    </main>
  );
}
