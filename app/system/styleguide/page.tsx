import { getStyleguide, getTokenHealth, utilityByRootToken } from "@/lib/styleguide";
import { Ramp, SgSection, TokenRow, displayTitle, getBackings } from "./derived-ui";

// Colors — the styleguide's index. Everything on this page is parsed from
// globals.css at build time (lib/styleguide.ts): the semantic families first
// (what product code should reach for), the primitive ramps under them, and
// the health checks that make CLAUDE.md rule 5 machine-true.

export default function ColorsPage() {
  const data = getStyleguide();
  const health = getTokenHealth();
  const utilities = utilityByRootToken();
  const backings = getBackings();

  const semantic = data.root.filter(
    (s) => s.title.startsWith("SEMANTIC TOKENS") || s.title.startsWith("CONVENIENCE"),
  );
  const ramps = data.root.filter((s) => s.title.startsWith("_") && !s.title.startsWith("_Transparent"));
  const overlays = data.root.filter((s) => s.title.startsWith("_Transparent"));
  const interaction = data.root.filter((s) => s.title.startsWith("SEMANTIC TOKENS — Interaction"));
  const silent = health.undefinedRefs.filter((u) => !u.guarded);
  const guarded = health.undefinedRefs.filter((u) => u.guarded);

  return (
    <main className="flex flex-col gap-3xl">
      {/* Health — rule 5 ("every token appears in the styleguide") is now
          machine-true by construction; these are the two drifts that remain
          possible, checked per build. */}
      <section className="sys-card flex flex-col gap-sm">
        <div className="flex flex-wrap items-baseline gap-x-lg gap-y-xs">
          <h2 className="text-sm font-semibold text-fg-primary">Token health</h2>
          <span className="text-xs text-fg-tertiary">
            {health.defined} defined · {health.orphans.length} unreferenced ·{" "}
            {health.undefinedRefs.length} referenced-but-undefined ({silent.length} silent)
          </span>
        </div>
        <details>
          <summary className="text-xs text-fg-secondary cursor-pointer">
            Unreferenced ({health.orphans.length}) — defined in globals.css, used by nothing; the
            punch-list B5 prune feed
          </summary>
          <p className="mt-sm text-2xs font-mono text-fg-tertiary leading-relaxed max-w-[90ch]">
            {health.orphans.join(" · ")}
          </p>
        </details>
        <details>
          <summary className="text-xs text-fg-secondary cursor-pointer">
            Referenced but undefined ({health.undefinedRefs.length}) — silent ones render as{" "}
            <code className="font-mono">unset</code>; the fix is repointing to an existing token,
            never minting one (CLAUDE.md rule 6)
          </summary>
          <div className="mt-sm flex flex-col gap-xs">
            {[...silent, ...guarded].map((u) => (
              <p key={u.name} className="text-2xs font-mono text-fg-tertiary">
                {u.guarded ? "fallback-guarded" : "SILENT"} · {u.name} — {u.files.join(", ")}
              </p>
            ))}
          </div>
        </details>
      </section>

      <SgSection
        title="Semantic tokens"
        note="What product code reaches for — never the primitives, never raw hex. Dark mode re-points ONLY this layer (plus a primitive safety net), so a surface built on semantics flips for free. Rows show the Tailwind utility, the token, its primitive target, and both theme values."
      >
        <div className="flex flex-col gap-xl">
          {semantic
            .filter((s) => !s.title.includes("Interaction"))
            .map((s) => (
              <div key={s.title} className="flex flex-col gap-xs">
                <h3 className="text-sm font-semibold text-fg-primary">{displayTitle(s.title)}</h3>
                <div className="flex flex-col">
                  {s.tokens
                    .filter((t) => !t.name.startsWith("--border-width"))
                    .map((t) => (
                      <TokenRow key={t.name} token={t} utility={utilities.get(t.name)} backings={backings} />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </SgSection>

      <SgSection
        title="Interaction"
        note="Hover overlays. lighten = on dark/brand fills · darken = on light surfaces · subtle = ghost buttons and nav. In dark mode every hover lightens — even the darken token."
      >
        <div className="flex flex-col">
          {interaction.flatMap((s) =>
            s.tokens.map((t) => (
              <TokenRow key={t.name} token={t} utility={utilities.get(t.name)} backings={backings} checker />
            )),
          )}
        </div>
      </SgSection>

      <SgSection
        title="Primitive ramps"
        note="The raw palette (Figma's _-prefixed collections). Not for components — reach through a semantic token. Dark values exist as a safety net for legacy callsites that still touch primitives directly; new code never should."
      >
        <div className="grid gap-xl sm:grid-cols-2">
          {ramps.map((s) => (
            <Ramp key={s.title} section={s} backings={backings} />
          ))}
        </div>
      </SgSection>

      <SgSection title="Transparent overlays" note="Alpha layers for scrims, hovers, and photo overlays.">
        <div className="grid gap-xl sm:grid-cols-2 lg:grid-cols-3">
          {overlays.map((s) => (
            <Ramp key={s.title} section={s} backings={backings} checker />
          ))}
        </div>
      </SgSection>

      <p className="text-xs leading-relaxed text-fg-tertiary">
        Source: <code className="sys-code">app/globals.css</code> — parsed by{" "}
        <code className="sys-code">lib/styleguide.ts</code> at build time. To change a value, change
        the CSS; this page follows in the same commit.
      </p>
    </main>
  );
}
