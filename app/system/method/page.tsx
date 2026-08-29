import { BookOpen, Check, Eye, Lock } from "@phosphor-icons/react/dist/ssr";
import { getPhasePipeline, getWorkModel } from "@/lib/system";
import { MdInline, SourceNote, StarterRows } from "../ui";

// Method = how we work. The flow ARE this page, rendered from CONTRIBUTING —
// not a link to a wall of text. Teaching order: the arc and its roles first
// (that is the flow a session actually lives), then the modes, then the
// reference layers folded away — starters, shared rules, and the kit
// (parts + adjustments) at the foot. Reference content collapses; only the
// flow stays expanded.

/** "The planner" → "planner": a pill wants the role's bare name. */
function stripLeadingThe(name: string): string {
  return name.replace(/^The\s+/i, "").toLowerCase();
}

const MODE_ACCENT: Record<string, string> = {
  product: "sys-mode--product",
  system: "sys-mode--system",
  side: "sys-mode--side",
};

// The three touch bands — they gate pens, not eyes (reading is never gated).
// "Gated" renders a lock, not a prohibit sign: another mode holds the key.
const BAND_META = {
  home: { label: "Home ground", Icon: Check },
  careful: { label: "Careful", Icon: Eye },
  gated: { label: "Gated", Icon: Lock },
  // Not a band: the orient set — what the mode reads before it edits
  // anything. It renders in the left column with the purpose, never beside
  // the three bands, because bands gate pens and this one is about eyes.
  reads: { label: "Reads first", Icon: BookOpen },
} as const;

function Scope({ kind, text }: { kind: keyof typeof BAND_META; text: string }) {
  const { label, Icon } = BAND_META[kind];
  return (
    <div className="sys-scope">
      <span className="sys-scope-head">
        <Icon size={14} weight="bold" />
        {label}
      </span>
      <span className="text-xs text-fg-secondary leading-snug">
        <MdInline text={text} />
      </span>
    </div>
  );
}

function Steps({
  label,
  pill,
  steps,
  anchors,
}: {
  label: string;
  pill?: string;
  steps: string[];
  anchors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
        {label}
        {pill && <span className="sys-pill normal-case tracking-normal">{pill}</span>}
      </span>
      <ol className="flex flex-col gap-sm">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-md text-sm text-fg-secondary leading-snug">
            <span className="sys-step-num">{i + 1}</span>
            <span>
              <MdInline text={step} anchors={anchors} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** A collapsed reference shelf: uppercase label + note in the summary, any
 *  content as the body. The same fold the hub's starters strip uses, reused
 *  for every layer of this page that is consulted rather than read. */
function Shelf({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <details className="sys-starters">
      <summary className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
        <span className="sys-caret" aria-hidden>
          ›
        </span>
        {label}
        <span className="font-normal normal-case tracking-normal">{note}</span>
      </summary>
      <div className="sys-starters-body sys-starters-body--padded flex flex-col gap-md">{children}</div>
    </details>
  );
}

export default function MethodPage() {
  const pipeline = getPhasePipeline();
  // § references become in-page links only for sections this page renders;
  // the rest stay plain text rather than linking to nowhere.
  const anchors = pipeline ? { "The phase pipeline": "#phase-pipeline" } : undefined;
  const { lede, arc, sharedRules, modes, startersLede, starters, partsLede, parts, adjustmentsLede, adjustments } =
    getWorkModel();

  // Role cards carry a step tag only for the canonical shape — four arc
  // steps, three roles, the middle role running build + review. Any other
  // counts render untagged: the join is layout, and the doc encodes no
  // general step↔role mapping for the page to derive.
  const canonicalSpan = arc.length === 4 && pipeline?.roles.length === 3;
  // The rituals' role pills use the same canonical join: opening = the first
  // role, during = the second, the close = the third. Names come from the
  // pipeline's own bullets, shortened for a pill.
  const roleNames =
    pipeline && pipeline.roles.length === 3
      ? pipeline.roles.map((r) => stripLeadingThe(r.name))
      : null;

  return (
    <>
      <header className="flex flex-col gap-sm">
        <h1 className="text-2xl font-semibold text-fg-primary">How we work</h1>
        <p className="text-sm text-fg-secondary max-w-[64ch]">
          <MdInline text={lede} anchors={anchors} />
        </p>
      </header>

      {/* The roles that carry the arc, each tagged with the steps it runs —
          the arc's step names come from the lede's own sentence, so the tags
          derive rather than restate. */}
      {pipeline && pipeline.roles.length > 0 && (
        <section className="sys-arc-roles" aria-label="The roles that carry the arc">
          {pipeline.roles.map((r, i) => (
            <div key={r.name} className="sys-arc-role">
              {canonicalSpan && (
                <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                  {i === 0 ? arc[0] : i === 1 ? `${arc[1]} · ${arc[2]}` : arc[3]}
                </span>
              )}
              <span className="flex flex-wrap items-baseline gap-sm">
                <span className="text-sm font-semibold text-fg-primary">
                  <MdInline text={r.name} />
                </span>
                <span className="sys-pill">{r.level}</span>
              </span>
              <span className="text-xs text-fg-secondary leading-snug">
                <MdInline text={r.text} anchors={anchors} />
              </span>
            </div>
          ))}
        </section>
      )}

      {/* The pipeline's prose: the level-per-chat rule and its standing
          rules, folded. The roles live in the strip above, not repeated. */}
      {pipeline && (
        <section id="phase-pipeline" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">The phase pipeline</h2>
          <p className="text-sm text-fg-secondary max-w-[64ch]">
            <MdInline text={pipeline.lede} />
          </p>
          {pipeline.rules.length > 0 && (
            <div className="flex flex-col gap-sm">
              {pipeline.rules.map((r) => (
                <details key={r.title} className="sys-details">
                  <summary className="flex items-baseline gap-sm">
                    <span className="sys-caret" aria-hidden>
                      ›
                    </span>
                    <span className="text-sm font-semibold text-fg-primary leading-snug">
                      <MdInline text={r.title} />
                    </span>
                  </summary>
                  <div className="pb-md pl-lg max-w-[72ch]">
                    <p className="text-xs text-fg-secondary leading-snug">
                      <MdInline text={r.text} />
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      )}

      {/* The three modes — the flavors the arc runs in. */}
      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">The three modes</h2>
        <div className="flex flex-col gap-lg">
          {modes.map((m) => (
            <article key={m.key} className={`sys-mode ${MODE_ACCENT[m.key] ?? ""}`}>
              <div className="flex items-baseline gap-sm flex-wrap">
                <h3 className="text-lg font-semibold text-fg-primary">{m.label}</h3>
                <span className="text-sm text-fg-tertiary">{m.tagline}</span>
              </div>

              {/* What it is (left) · what it may touch (right) */}
              <div className="grid gap-lg lg:grid-cols-[1.4fr_1fr]">
                <div className="flex flex-col gap-md">
                  <p className="text-sm text-fg-secondary leading-normal">
                    <MdInline text={m.purpose} anchors={anchors} />
                  </p>
                  <Scope kind="reads" text={m.reads} />
                </div>
                <div className="flex flex-col gap-sm">
                  <Scope kind="home" text={m.homeGround} />
                  <Scope kind="careful" text={m.careful} />
                  <Scope kind="gated" text={m.gated} />
                </div>
              </div>

              {/* The ritual — folded away. The summary states its nature (the
                  session runs it; the canon's pipeline lede is the source of
                  that claim) so the step list reads as adjustable
                  configuration, not instructions to recite. */}
              <details className="sys-ritual">
                <summary>
                  <span className="sys-caret" aria-hidden>
                    ›
                  </span>
                  <span className="text-sm font-semibold text-fg-primary">The built-in ritual</span>
                  <span className="text-xs text-fg-tertiary">
                    runs on its own at this mode&apos;s open and close · {m.open.length} steps + {m.close.length}
                  </span>
                </summary>
                <div className="flex flex-col gap-lg pt-lg">
                  <Steps label="Opening ritual" pill={roleNames?.[0]} steps={m.open} anchors={anchors} />
                  <div className="flex flex-col gap-sm">
                    <span className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                      During
                      {roleNames && <span className="sys-pill normal-case tracking-normal">{roleNames[1]}</span>}
                    </span>
                    <p className="text-sm text-fg-secondary leading-snug">
                      <MdInline text={m.during} anchors={anchors} />
                    </p>
                  </div>
                  <Steps label="Closing ritual" pill={roleNames?.[2]} steps={m.close} anchors={anchors} />
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>

      {/* Session starters — the front door, as the hub's collapsed rows. */}
      {starters.length > 0 && (
        <section id="session-starters" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">Session starters</h2>
          {startersLede && (
            <p className="text-sm text-fg-secondary max-w-[64ch]">
              <MdInline text={startersLede} anchors={anchors} />
            </p>
          )}
          <div className="sys-starters">
            <div className="sys-starters-body flex flex-col">
              <StarterRows starters={starters} />
            </div>
          </div>
        </section>
      )}

      {/* Shared rules — reference, consulted not read: each rule folds to its
          own bold lead. A rule without one renders as a plain row. */}
      {sharedRules.length > 0 && (
        <section className="flex flex-col gap-md">
          <h2 className="text-lg font-semibold text-fg-primary">Rules shared by all modes</h2>
          <div className="flex flex-col">
            {sharedRules.map((r, i) => {
              const lead = r.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
              if (!lead || !lead[2].trim()) {
                return (
                  <p key={i} className="sys-rule-plain text-sm text-fg-secondary leading-snug">
                    <MdInline text={r} anchors={anchors} />
                  </p>
                );
              }
              return (
                <details key={i} className="sys-details">
                  <summary className="flex items-baseline gap-sm">
                    <span className="sys-caret" aria-hidden>
                      ›
                    </span>
                    <span className="text-sm font-semibold text-fg-primary leading-snug">
                      <MdInline text={lead[1]} />
                    </span>
                  </summary>
                  <div className="pb-md pl-lg max-w-[72ch]">
                    <p className="text-xs text-fg-secondary leading-snug">
                      <MdInline text={lead[2]} anchors={anchors} />
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* The kit — the concept layer and the reshaping map, demoted to
          collapsed shelves: meta about the model, not the flow itself. */}
      {parts.length > 0 && (
        <Shelf label="The parts" note={partsLede ? "the model is a kit — every part is yours to reshape" : ""}>
          {partsLede && (
            <p className="text-sm text-fg-secondary max-w-[64ch]">
              <MdInline text={partsLede} />
            </p>
          )}
          <div className="grid gap-md md:grid-cols-2">
            {parts.map((p) => (
              <article key={p.name} className="sys-part">
                <h3 className="text-base font-semibold text-fg-primary">{p.name}</h3>
                <p className="text-sm text-fg-secondary leading-snug">
                  <MdInline text={p.is} />
                </p>
                <div className="sys-scope">
                  <span className="sys-scope-head">Properties</span>
                  <span className="text-xs text-fg-secondary leading-snug">
                    <MdInline text={p.properties} anchors={anchors} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Shelf>
      )}

      {adjustments.length > 0 && (
        <Shelf label="Adjustments" note="allowed, never required">
          {adjustmentsLede && (
            <p className="text-sm text-fg-secondary max-w-[64ch]">
              <MdInline text={adjustmentsLede} />
            </p>
          )}
          <ul className="flex flex-col gap-sm">
            {adjustments.map((a) => (
              <li key={a.when} className="sys-scope">
                <span className="text-sm font-semibold text-fg-primary leading-snug">
                  <MdInline text={a.when} />
                </span>
                <span className="text-xs text-fg-secondary leading-snug">
                  <MdInline text={a.what} anchors={anchors} />
                </span>
              </li>
            ))}
          </ul>
        </Shelf>
      )}

      <SourceNote
        href="/system/docs/CONTRIBUTING.md"
        path="CONTRIBUTING.md → The Work Model"
        note="the canonical rules; this page renders them"
      />
    </>
  );
}
