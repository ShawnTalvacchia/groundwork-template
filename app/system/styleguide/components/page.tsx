import type { ReactNode } from "react";
import {
  getComponentInventory,
  getComponentDetails,
  getStyleguide,
  type ComponentDetail,
} from "@/lib/styleguide";
import { measure, AA_SMALL_TEXT } from "@/lib/contrast";
import { ThemePanesStyle } from "../derived-ui";
import { DEMOS, type DemoEntry, type PaintedPair } from "./demos";

/* The components page.
 *
 * Everything on it derives from two sources and joins them by name: the
 * component's own file (`getComponentDetails` — the docblock and its `@when` /
 * `@whenNot` tags, the variant maps, the root tags, the usage census) and the
 * demo registry (`demos.tsx` — the mount, its container, what it paints).
 * The page itself authors no fact about any component.
 *
 * It used to list names. `getComponentDetails` has existed since 2026-08-07
 * and fed the element inspector only, so everything the build already knew
 * about a component reached a URL-flagged overlay and never the page whose
 * job is to answer "when do I reach for this?".
 *
 * ABSENCE RENDERS AS ABSENCE. A missing docblock, a missing `@when`, a
 * component with no demo and no declared reason: each says so in its own slot
 * rather than collapsing, because a section that disappears when empty is
 * indistinguishable from one that was never meant to be there — which is how
 * TabBar went without a docblock while a field comment stood in for it.
 */

const ANATOMY = ["what", "when", "demo", "composition", "variants", "usage"] as const;

/** A named absence. The page's whole nudge mechanism is this one component. */
function Missing({ children }: { children: ReactNode }) {
  return <span className="text-2xs italic text-fg-gray">{children}</span>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-xs border-t border-edge-light pt-sm sm:flex-row sm:gap-lg">
      <span className="shrink-0 text-2xs font-semibold uppercase tracking-wide text-fg-tertiary sm:w-[11ch] sm:pt-[2px]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ── The two theme panes ─────────────────────────────────────────────── */

const SURFACE: Record<NonNullable<DemoEntry["container"]>, string> = {
  top: "bg-surface-top",
  inset: "bg-surface-inset",
  base: "bg-surface-base",
};

/** One demo, rendered in one theme. The pane class pins every token to that
 *  theme's parsed value (`ThemePanesStyle`), so both readings are honest
 *  whichever theme the reader is actually in. */
function ThemePane({ theme, entry }: { theme: "light" | "dark"; entry: DemoEntry }) {
  return (
    <div
      className={`sg-pane-${theme} flex min-w-0 flex-1 basis-[280px] flex-col gap-sm rounded-sm border border-edge-strong p-md ${
        SURFACE[entry.container ?? "top"]
      }`}
    >
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{theme}</span>
      <div className="flex flex-col gap-md">
        {entry.states?.map((s) => (
          <div key={s.label} className="flex min-w-0 flex-col gap-xs">
            <span className="text-2xs text-fg-gray">{s.label}</span>
            <div className="flex min-w-0 flex-wrap items-center gap-sm">{s.mount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── The measurements ────────────────────────────────────────────────── */

type Resolved = { light: string; dark: string };

function tokenTable(): Map<string, Resolved> {
  const data = getStyleguide();
  const out = new Map<string, Resolved>();
  for (const t of [...data.root, ...data.theme].flatMap((s) => s.tokens)) {
    if (!out.has(t.name)) out.set(t.name, { light: t.light, dark: t.dark ?? t.light });
  }
  return out;
}

function Ratio({ pair, tokens }: { pair: PaintedPair; tokens: Map<string, Resolved> }) {
  const floor = pair.floor ?? AA_SMALL_TEXT;
  const cells = (["light", "dark"] as const).map((theme) => {
    const val = (name: string) => tokens.get(name)?.[theme];
    const fg = val(pair.fg);
    const bg = val(pair.bg);
    const under = pair.under ? val(pair.under) : undefined;
    const m = fg && bg ? measure(fg, bg, floor, under) : null;
    return { theme, m };
  });

  return (
    <div className="flex flex-wrap items-baseline gap-x-md gap-y-tiny border-b border-edge-light py-xs last:border-b-0">
      <span className="min-w-0 flex-1 basis-[18ch] text-2xs text-fg-secondary">{pair.what}</span>
      <code className="min-w-0 flex-1 basis-[34ch] truncate font-mono text-2xs text-fg-gray">
        {pair.fg} on {pair.bg}
        {pair.under ? ` over ${pair.under}` : ""}
      </code>
      {cells.map(({ theme, m }) => (
        <span key={theme} className="flex shrink-0 items-baseline gap-xs">
          <span className="text-2xs text-fg-gray">{theme}</span>
          {m ? (
            <>
              <code
                className={`font-mono text-2xs tabular-nums ${m.passes ? "text-fg-secondary" : "text-error-strong font-semibold"}`}
              >
                {m.ratio.toFixed(2)}:1
              </code>
              {/* The verdict is a WORD, not a colour, for the two reasons
                  this page exists to catch. Colour alone fails WCAG 1.4.1,
                  and `--status-error-strong` on `--surface-base` measures
                  4.34:1 in light — the marker saying "under the floor" was
                  itself under it. Fixing the ramp is a design-system call and
                  a punch row; making the mark not depend on the colour is
                  this page's own to get right. The word carries the meaning
                  and the red is now emphasis on top of it. */}
              {!m.passes && (
                <span className="text-2xs font-semibold text-fg-primary">under</span>
              )}
            </>
          ) : (
            <Missing>unreadable</Missing>
          )}
        </span>
      ))}
      <code className="shrink-0 font-mono text-2xs text-fg-gray tabular-nums">floor {floor}:1</code>
    </div>
  );
}

/* ── One component ───────────────────────────────────────────────────── */

function ComponentCard({
  detail,
  entry,
  tokens,
}: {
  detail: ComponentDetail;
  entry: DemoEntry | undefined;
  tokens: Map<string, Resolved>;
}) {
  const demoed = Boolean(entry?.states?.length);
  const variantMaps = [...new Set(detail.variants.map((v) => v.map))];

  return (
    <section className="flex flex-col gap-sm scroll-mt-3xl" id={detail.name}>
      <div className="flex flex-wrap items-baseline gap-sm">
        <h3 className="text-base font-semibold text-fg-primary">{detail.name}</h3>
        <code className="sys-code text-2xs">{detail.file}</code>
        {!demoed && !entry?.noDemoReason && (
          <span className="rounded-pill bg-error-light px-sm py-tiny text-2xs font-semibold text-error-strong">
            no demo, no reason given
          </span>
        )}
      </div>

      <Row label="What">
        {detail.docblock ? (
          <p className="max-w-[80ch] text-xs leading-relaxed text-fg-secondary">{detail.docblock}</p>
        ) : (
          <Missing>
            No docblock. The component file is its one home for &ldquo;what it is&rdquo; — write one
            at the top of {detail.file}.
          </Missing>
        )}
      </Row>

      <Row label="When">
        <div className="flex flex-col gap-xs">
          <p className="max-w-[80ch] text-xs leading-relaxed text-fg-secondary">
            {detail.whenToUse ?? <Missing>No @when tag in the docblock.</Missing>}
          </p>
          <p className="max-w-[80ch] text-xs leading-relaxed text-fg-tertiary">
            <span className="font-semibold">Not for: </span>
            {detail.whenNot ?? <Missing>No @whenNot tag in the docblock.</Missing>}
          </p>
        </div>
      </Row>

      <Row label="Demo">
        {demoed ? (
          <div className="flex flex-wrap gap-sm">
            <ThemePane theme="light" entry={entry!} />
            <ThemePane theme="dark" entry={entry!} />
          </div>
        ) : entry?.noDemoReason ? (
          <p className="max-w-[80ch] text-xs leading-relaxed text-fg-tertiary">
            <span className="font-semibold text-fg-secondary">No demo. </span>
            {entry.noDemoReason}
          </p>
        ) : (
          <Missing>
            Nothing registered in <code className="sys-code">demos.tsx</code>, and no reason given.
            A component with neither is a gap, not a decision.
          </Missing>
        )}
      </Row>

      <Row label="Composition">
        <div className="flex flex-col gap-xs">
          <div className="flex flex-wrap items-baseline gap-x-md gap-y-tiny text-2xs">
            <span className="text-fg-tertiary">renders</span>
            {detail.rootTags.length ? (
              detail.rootTags.map((t) => (
                <code key={t} className="sys-code">
                  &lt;{t}&gt;
                </code>
              ))
            ) : (
              <Missing>no root element parsed</Missing>
            )}
          </div>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-md gap-y-tiny text-2xs">
            <span className="shrink-0 text-fg-tertiary">signature</span>
            {detail.signature ? (
              <code className="min-w-0 break-words font-mono text-2xs text-fg-gray">
                {detail.signature.join(" ")}
              </code>
            ) : (
              <Missing>no static class run to identify it by</Missing>
            )}
          </div>
        </div>
      </Row>

      <Row label="Variants">
        {detail.variants.length ? (
          <div className="flex flex-col gap-sm">
            {variantMaps.map((map) => (
              <div key={map} className="flex min-w-0 flex-col gap-tiny">
                <code className="text-2xs font-semibold text-brand-strong">{map}</code>
                {detail.variants
                  .filter((v) => v.map === map)
                  .map((v) => (
                    <div key={v.name} className="flex min-w-0 items-baseline gap-sm">
                      <code className="w-[12ch] shrink-0 truncate font-mono text-2xs text-fg-secondary">
                        {v.name}
                      </code>
                      <code className="min-w-0 truncate font-mono text-2xs text-fg-gray">{v.classes}</code>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <Missing>No variant map — the component takes no styled variants.</Missing>
        )}
      </Row>

      {entry?.paints?.length ? (
        <Row label="Contrast">
          <div className="flex flex-col">
            {entry.paints.map((p) => (
              <Ratio key={`${p.what}-${p.fg}-${p.bg}`} pair={p} tokens={tokens} />
            ))}
          </div>
        </Row>
      ) : null}

      <Row label="Used by">
        {detail.usage.count ? (
          <div className="flex flex-col gap-tiny">
            <span className="text-2xs text-fg-secondary">
              {detail.usage.count} callsite{detail.usage.count === 1 ? "" : "s"} across{" "}
              {detail.usage.files.length} file{detail.usage.files.length === 1 ? "" : "s"}
            </span>
            <div className="flex flex-wrap gap-x-md gap-y-tiny">
              {detail.usage.files.map((f) => (
                <code key={f} className="font-mono text-2xs text-fg-gray">
                  {f}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <Missing>
            No callsites outside its own file. Either it is new, or nothing reaches for it.
          </Missing>
        )}
      </Row>
    </section>
  );
}

/* ── The page ────────────────────────────────────────────────────────── */

export default function ComponentsPage() {
  const inventory = getComponentInventory();
  const details = new Map(getComponentDetails().map((d) => [d.name, d]));
  const tokens = tokenTable();
  const total = inventory.reduce((n, g) => n + g.components.length, 0);

  return (
    <>
      <ThemePanesStyle />
      <div className="flex flex-col gap-3xl">
        <section className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">
            Shared components{" "}
            <span className="text-sm font-normal text-fg-tertiary tabular-nums">{total}</span>
          </h2>
          <p className="max-w-[72ch] text-xs leading-relaxed text-fg-tertiary">
            Every shared component, in one shape: what it is and when to reach for it, from the
            component&apos;s own docblock; a live demo in both themes, from the demo registry; then
            its composition, variants, measured contrast and callsites, derived at build. The
            reuse-first checklist starts here. Feature components live beside their features and
            aren&apos;t listed.
          </p>
        </section>

        {inventory.map((group) => {
          const demoed = group.components.filter((c) => DEMOS[c.name]?.states?.length);
          const declined = group.components.filter(
            (c) => !DEMOS[c.name]?.states?.length && DEMOS[c.name]?.noDemoReason
          );
          const gaps = group.components.filter((c) => !DEMOS[c.name]);

          return (
            <section key={group.dir} className="flex flex-col gap-lg">
              <div className="flex flex-col gap-xs">
                <h3 className="text-sm font-semibold text-fg-primary">
                  components/{group.dir}{" "}
                  <span className="text-2xs font-normal text-fg-tertiary tabular-nums">
                    {group.components.length}
                  </span>
                </h3>
                <p className="flex flex-wrap gap-x-md gap-y-tiny text-2xs text-fg-tertiary">
                  <span className="tabular-nums">
                    {demoed.length}/{group.components.length} demoed
                  </span>
                  {declined.length > 0 && (
                    <span>No demo: {declined.map((c) => c.name).join(", ")}</span>
                  )}
                  {gaps.length > 0 && (
                    <span className="font-semibold text-error-strong">
                      Unaccounted for: {gaps.map((c) => c.name).join(", ")}
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2xl">
                {group.components.map((c) => {
                  const detail = details.get(c.name);
                  return detail ? (
                    <ComponentCard
                      key={c.name}
                      detail={detail}
                      entry={DEMOS[c.name]}
                      tokens={tokens}
                    />
                  ) : null;
                })}
              </div>
            </section>
          );
        })}

        <p className="text-xs leading-relaxed text-fg-tertiary">
          Sources: <code className="sys-code">components/ui · overlays · layout</code>, parsed by{" "}
          <code className="sys-code">lib/styleguide.ts</code>; the demo mounts and the pairs each one
          paints, from <code className="sys-code">demos.tsx</code>; the ratios computed at build by{" "}
          <code className="sys-code">lib/contrast.ts</code> from{" "}
          <code className="sys-code">globals.css</code>. The anatomy is fixed:{" "}
          {ANATOMY.join(" → ")}.
        </p>
      </div>
    </>
  );
}
