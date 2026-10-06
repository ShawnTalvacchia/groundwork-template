import { getCensus, getStyleguide, getTokenHealth, utilityByRootToken, type Reach } from "@/lib/styleguide";
import { AA_NON_TEXT, AA_SMALL_TEXT, measure } from "@/lib/contrast";
import { Ramp, SgSection, TokenRow, displayTitle, getBackings, tokenTable } from "./derived-ui";

// Colors — the styleguide's index. Everything on this page is parsed from
// globals.css at build time (lib/styleguide.ts): the semantic families first
// (what product code should reach for), the primitive ramps under them, and
// the health checks on the token set itself. Every row says who reaches for
// it, from the census (lib/styleguide.ts → getCensus).

/* The ladder's contract, stated once: the rungs that carry information and
 * the floor each must clear on EVERY ground a callsite can put it on. The
 * components page measures what each demo paints; this measures what the
 * tokens promise, which is the claim a callsite relies on when it reaches for
 * a rung without measuring. `--text-light` is not here because it promises
 * nothing: it is disabled and decorative only (globals.css). */
const LADDER = [
  { token: "--text-primary", floor: AA_SMALL_TEXT },
  { token: "--text-secondary", floor: AA_SMALL_TEXT },
  { token: "--text-tertiary", floor: AA_SMALL_TEXT },
  { token: "--text-gray", floor: AA_SMALL_TEXT },
  { token: "--border-stronger", floor: AA_NON_TEXT },
] as const;
const GROUNDS = ["--surface-top", "--surface-popout", "--surface-base", "--surface-inset"] as const;

/** Every rung on every ground, both themes. The lowest figure in each theme
 *  is set heavier: it names that theme's hard surface, which is the one a
 *  re-skin has to measure first. */
function LadderTable() {
  const tokens = tokenTable();
  const themes = ["light", "dark"] as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-2xs">
        <thead>
          <tr className="text-left text-fg-tertiary">
            <th scope="col" className="py-xs pr-md font-semibold">
              Rung
            </th>
            {themes.map((theme) =>
              GROUNDS.map((g) => (
                <th key={`${theme}${g}`} scope="col" className="py-xs pr-md font-normal">
                  <span className="block font-semibold">{theme}</span>
                  <code className="font-mono">{g.replace("--surface-", "")}</code>
                </th>
              )),
            )}
            <th scope="col" className="py-xs font-semibold">
              Floor
            </th>
          </tr>
        </thead>
        <tbody>
          {LADDER.map(({ token, floor }) => {
            const cells = themes.map((theme) =>
              GROUNDS.map((g) => {
                const fg = tokens.get(token)?.[theme];
                const bg = tokens.get(g)?.[theme];
                return fg && bg ? measure(fg, bg, floor) : null;
              }),
            );
            return (
              <tr key={token} className="border-t border-edge-light">
                <th scope="row" className="py-xs pr-md text-left font-normal">
                  {/* A text rung names itself in its own colour, so the row
                      is also the specimen: the reader judges the steps here,
                      in whichever theme they are in. A border is not text,
                      and painting its name at 3:1 would be the defect. */}
                  <code
                    className="font-mono text-fg-primary"
                    style={token.startsWith("--text-") ? { color: `var(${token})` } : undefined}
                  >
                    {token}
                  </code>
                </th>
                {cells.map((row, i) => {
                  const low = Math.min(...row.map((m) => m?.ratio ?? Infinity));
                  return row.map((m, j) => (
                    <td key={`${i}${j}`} className="py-xs pr-md font-mono tabular-nums text-fg-secondary">
                      {m ? (
                        <span className={m.ratio === low ? "font-semibold text-fg-primary" : undefined}>
                          {m.ratio.toFixed(2)}
                          {!m.passes && <span className="ml-xs font-sans font-semibold text-fg-primary">under</span>}
                        </span>
                      ) : (
                        <span className="italic text-fg-gray">unreadable</span>
                      )}
                    </td>
                  ));
                })}
                <td className="py-xs font-mono tabular-nums text-fg-gray">{floor}:1</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The census buckets, in the order the health card reads them. */
const BUCKETS: { reach: Reach; label: string; note: string }[] = [
  { reach: "none", label: "Unused", note: "nothing reaches for these; the ramps among them are palette" },
  { reach: "dashboard", label: "Dashboard only", note: "the dashboard's own" },
  { reach: "product", label: "Product only", note: "the product's own" },
];

export default function ColorsPage() {
  const data = getStyleguide();
  const health = getTokenHealth();
  const { product, tokens: census } = getCensus();
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

  // Every :root token by who reaches for it, grouped by section so a list
  // reads as "the ramps" and "the rest" rather than one run of names.
  const byReach = (reach: Reach) =>
    data.root
      .map((s) => ({ title: displayTitle(s.title), names: s.tokens.filter((t) => census.get(t.name) === reach).map((t) => t.name) }))
      .filter((g) => g.names.length);
  const count = (reach: Reach) => byReach(reach).reduce((n, g) => n + g.names.length, 0);

  return (
    <main className="flex flex-col gap-3xl">
      {/* Health — who reaches for the set, and the references it can't satisfy. */}
      <section className="sys-card flex flex-col gap-sm">
        <div className="flex flex-wrap items-baseline gap-x-lg gap-y-xs">
          <h2 className="text-sm font-semibold text-fg-primary">Token health</h2>
          <span className="text-xs text-fg-tertiary">
            {health.defined} defined, {data.root.reduce((n, s) => n + s.tokens.length, 0)} in{" "}
            <code className="font-mono">:root</code>:{" "}
            {product && `${count("both")} both · ${count("product")} product · `}
            {count("dashboard")} dashboard · {count("none")} unused ·{" "}
            {health.undefinedRefs.length} referenced-but-undefined ({silent.length} silent)
          </span>
        </div>
        {BUCKETS.filter((b) => count(b.reach) > 0).map((b) => (
          <details key={b.reach}>
            <summary className="text-xs text-fg-secondary cursor-pointer">
              {b.label} ({count(b.reach)}): {b.note}
            </summary>
            <div className="mt-sm flex flex-col gap-xs">
              {byReach(b.reach).map((g) => (
                <p key={g.title} className="text-2xs font-mono text-fg-tertiary leading-relaxed max-w-[90ch]">
                  <span className="font-sans font-semibold text-fg-secondary">{g.title}</span>{" "}
                  {g.names.join(" · ")}
                </p>
              ))}
            </div>
          </details>
        ))}
        <details>
          <summary className="text-xs text-fg-secondary cursor-pointer">
            Referenced but undefined ({health.undefinedRefs.length}) — silent ones render as{" "}
            <code className="font-mono">unset</code>; the usual fix is repointing to a token that
            exists
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
                  {s.tokens.map((t) => (
                    <TokenRow
                      key={t.name}
                      token={t}
                      utility={utilities.get(t.name)}
                      backings={backings}
                      reach={census.get(t.name)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </SgSection>

      <SgSection
        title="The ladder on every surface"
        note="Each rung that carries information, measured on each surface it can land on, in both themes. A rung clears its floor everywhere or it is not a rung. The heavier figure per theme is that theme's hard surface. Computed at build from the values above."
      >
        <LadderTable />
      </SgSection>

      {interaction.length > 0 && (
        <SgSection title="Interaction" note={interaction[0].note}>
          <div className="flex flex-col">
            {interaction.flatMap((s) =>
              s.tokens.map((t) => (
                <TokenRow
                  key={t.name}
                  token={t}
                  utility={utilities.get(t.name)}
                  backings={backings}
                  reach={census.get(t.name)}
                  checker
                />
              )),
            )}
          </div>
        </SgSection>
      )}

      <SgSection
        title="Primitive ramps"
        note="The raw palette: the _-prefixed sections of globals.css. Not for components — reach through a semantic token. Dark values are a safety net for any callsite that reaches a primitive directly; components never should."
      >
        <div className="grid gap-xl lg:grid-cols-2">
          {ramps.map((s) => (
            <Ramp key={s.title} section={s} backings={backings} census={census} />
          ))}
        </div>
      </SgSection>

      {/* One column: these names differ only at the end, so a column narrow
          enough to truncate them makes every row read the same. */}
      <SgSection title="Transparent overlays" note="Alpha layers for scrims, hovers, and photo overlays.">
        <div className="grid gap-xl">
          {overlays.map((s) => (
            <Ramp key={s.title} section={s} backings={backings} census={census} checker />
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
