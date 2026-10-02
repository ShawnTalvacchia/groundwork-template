import { BookOpen, Check, Eye, Lock } from "@phosphor-icons/react/dist/ssr";
import {
  getGlossary,
  getPhasePipeline,
  getWorkModel,
  sectionHrefs,
  stripMd,
  MODE_META,
  MODE_SEQUENCES,
  STATUS_LABEL,
  type BoardMode,
  type BoardStatus,
  type RitualStep,
  type WorkTrigger,
} from "@/lib/system";
import { InsetNote, MdInline, SourceNote, StarterRows, termUnits } from "../ui";

// Method = how we work. The flow ARE this page, rendered from CONTRIBUTING —
// not a link to a wall of text.
//
// Teaching order follows how people actually arrive, which is also the canon's
// own order for the sections it owns: starters (the front door) → the modes
// and their rituals → the triggers those rituals hang off → the kind layer,
// which only a split phase uses. The one deliberate departure from doc order
// is the shared rules, which the canon states first and this page demotes to
// the foot: they are consulted, not read, and leading with them buries the
// door. Everything after the modes is reference and folds.
//
// The kind layer sits last and inside its own section rather than opening the
// page, and it pins no kind chips to the mode rituals: a collapsed phase runs
// its whole arc in one chat, and a side phase never splits at all. That is the
// third axis the rituals carry (a step's condition), and the page honours it
// by placement — conditional content lives in the conditional section, under
// the canon's own `Read when:` gate.
//
// One rule comes the other way. **Concurrency** is lifted out of the folded
// shared rules to sit with the modes, because it is the one shared rule a
// reader needs *while* reading them — the slot it rations is per mode, and it
// binds a collapsed phase that never opens the kind layer at all.

const MODE_ACCENT: Record<string, string> = {
  product: "sys-mode--product",
  system: "sys-mode--system",
  side: "sys-mode--side",
  "queue-shaping": "sys-mode--queue-shaping",
};

// The two moments a mode's own rituals hang off, by the canon's names for
// them. Matching a trigger by name is the same bargain the mode headings make
// (`getWorkModel` matches product|system|side|queue-shaping literally): a canon
// that renames
// its moments renders the rituals untagged rather than wrong, and § Adjustments
// states that cost outright.
const OPEN_TRIGGER = "phase open";
const CLOSE_TRIGGER = "phase close";

// The glossary's term for the human a ritual step reaches for. The step's own
// wording is what `RitualStep.withPO` derives from; this is the page's label
// for that fact, held here for the same reason BAND_META holds the band names
// — one constant, next to the vocabulary it mirrors.
const PO_TERM = "PO";

// The shared rule that rations the modes' slot, by the canon's own lead word.
// Matching it literally is the bargain the mode headings and the triggers
// already make: a canon that renames the rule leaves it folded at the foot
// with the others, which is where it was, rather than rendering it wrong.
const CONCURRENCY_LEAD = /^concurrency\b/i;

/** A bold-led rule: `**Lead.** the rest`. Null when it has no lead, or a lead
 *  with nothing after it — the shared rules render those as plain rows. */
function splitLead(rule: string): { lead: string; text: string } | null {
  const m = rule.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
  return m && m[2].trim() ? { lead: m[1], text: m[2] } : null;
}

/** A kind's name as `MODE_SEQUENCES` spells it: the frontmatter slug. The
 *  canon writes the bullet in its own case, with a space where the field
 *  needs a hyphen (`**Basic layer**` ↔ `basic-layer`). */
function kindSlug(name: string): string {
  return stripMd(name).trim().toLowerCase().replace(/\s+/g, "-");
}

/** A sequence's name on the page: the mode, plus the shape's own word where
 *  the mode runs more than one. Used for a strip's label and for a kind
 *  card's tags, so the two cannot spell the same sequence differently. */
function sequenceLabel(mode: BoardMode, names: string[]): string {
  const named = names.filter((n) => n.length > 0);
  return named.length > 0 ? `${MODE_META[mode].label} (${named.join(" · ")})` : MODE_META[mode].label;
}

const MODES_IN_ORDER = Object.keys(MODE_SEQUENCES) as BoardMode[];

/** Every declared sequence, flattened, in mode order. */
const SEQUENCES = MODES_IN_ORDER.flatMap((mode) =>
  MODE_SEQUENCES[mode].map((s) => ({ mode, label: sequenceLabel(mode, [s.name]), kinds: s.kinds })),
);

/** The sequences that run a kind, one tag each, a mode's shapes collapsed
 *  into one tag. A name no sequence lists renders untagged — the same
 *  literal-name bargain the triggers make, and the reason the canon's parser
 *  marker names this join. */
function sequencesOf(kindName: string): string[] {
  const slug = kindSlug(kindName);
  return MODES_IN_ORDER.flatMap((mode) => {
    const names = MODE_SEQUENCES[mode].filter((s) => s.kinds.includes(slug)).map((s) => s.name);
    return names.length > 0 ? [sequenceLabel(mode, names)] : [];
  });
}

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

function Scope({
  kind,
  text,
  link,
  anchors,
}: {
  kind: keyof typeof BAND_META;
  text: string;
  link: (text: string) => string;
  anchors: Record<string, string>;
}) {
  const { label, Icon } = BAND_META[kind];
  return (
    <div className="sys-scope">
      <span className="sys-scope-head">
        <Icon size={14} weight="bold" />
        {label}
      </span>
      <span className="text-xs text-fg-secondary leading-relaxed">
        <MdInline text={link(text)} anchors={anchors} />
      </span>
    </div>
  );
}

/** A ritual's numbered steps. Two things ride on each step beyond its text:
 *  the moment the whole list fires (the trigger pill, once, on the label) and
 *  whether the individual step stops for a human (the marker, per step). Both
 *  are the canon's own — the trigger from § The parts, the actor from the
 *  step's own register (`RitualStep.withPO`). A step that names nobody is the
 *  session acting alone, which is most of them, and stays unmarked: marking
 *  the default would be noise on every row. */
function Steps({
  label,
  trigger,
  steps,
  link,
  anchors,
}: {
  label: string;
  trigger?: WorkTrigger;
  steps: RitualStep[];
  link: (text: string) => string;
  anchors: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
        {label}
        {trigger && (
          <span className="sys-pill normal-case tracking-normal">fires at {trigger.name}</span>
        )}
      </span>
      <ol className="flex flex-col gap-sm">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-md text-sm text-fg-secondary leading-relaxed">
            <span className="sys-step-num">{i + 1}</span>
            <span>
              {step.withPO && <span className="sys-actor">with the {PO_TERM}</span>}
              <MdInline text={link(step.text)} anchors={anchors} />
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
  id,
  label,
  note,
  children,
}: {
  id: string;
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <details id={id} className="sys-starters scroll-mt-2xl">
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

// The canon's sections this page renders, each under the canon's own name
// for it: the heading the page prints and the key a `§ Name` reference is
// matched by are one constant, so the two cannot disagree. A canon that
// renames one still links — to the doc reader, where every section renders.
// The modes and the run are keyed by the names their own headings carry,
// which the parsers already read.
const STARTERS = "Session starters";
const PIPELINE = "The phase pipeline";
const SHARED_RULES = "Rules shared by all modes";
const PARTS = "The parts";
const ADJUSTMENTS = "Adjustments";

export default function MethodPage() {
  const pipeline = getPhasePipeline();
  const {
    lede, sharedRules, modes, startersLede, starters,
    partsLede, parts, adjustmentsLede, adjustments, triggers,
  } = getWorkModel();

  // A `§ Name` links to the section it names: here, where this page renders
  // it, and in the doc reader where it does not. A name that resolves
  // nowhere stays text rather than linking to nowhere.
  const texts = [
    lede, startersLede, ...sharedRules, partsLede, adjustmentsLede,
    ...starters.map((s) => s.openBy),
    ...modes.flatMap((m) => [m.purpose, m.reads, m.homeGround, m.careful, m.gated, m.during, ...[...m.open, ...m.close].map((s) => s.text)]),
    ...parts.flatMap((p) => [p.is, p.properties]),
    ...adjustments.flatMap((a) => [a.when, a.what]),
    ...triggers.map((t) => t.fires),
    ...(pipeline
      ? [pipeline.readWhen, pipeline.lede, ...pipeline.kinds.map((k) => k.text), ...pipeline.rules.map((r) => r.text),
         ...(pipeline.run ? [pipeline.run.lede, ...pipeline.run.rules.map((r) => r.text)] : [])]
      : []),
  ].filter((t): t is string => Boolean(t));
  const inPage: Record<string, string> = {
    [STARTERS]: "#session-starters",
    [SHARED_RULES]: "#shared-rules",
    [PARTS]: "#the-parts",
    [ADJUSTMENTS]: "#adjustments",
    ...Object.fromEntries(modes.map((m) => [m.label, `#mode-${m.key}`])),
    ...(pipeline ? { [PIPELINE]: "#phase-pipeline" } : {}),
    ...(pipeline?.run ? { [pipeline.run.title]: "#the-run" } : {}),
  };
  const anchors = sectionHrefs("CONTRIBUTING.md", texts, (id) => `/system/docs/CONTRIBUTING.md#${id}`, inPage);
  // Glossary terms link at their first noun-use in each reading unit: the
  // open text under a heading, a card naming its subject (a mode, a kind, a
  // part), a fold's body. Summaries stay plain — a link there takes the
  // click that opens the fold.
  const unit = termUnits(getGlossary());

  // The rule that rations the modes' slot renders with them; the rest stay
  // folded at the foot. A canon with no such rule lifts nothing.
  const concurrency = sharedRules
    .map((r) => ({ rule: r, split: splitLead(r) }))
    .find(({ split }) => split && CONCURRENCY_LEAD.test(stripMd(split.lead)));
  const footRules = sharedRules.filter((r) => r !== concurrency?.rule);
  // The statuses that rule names, in the surface's own rank order. A rule
  // that names none gets no chip row rather than a legend for states its
  // canon never defined.
  const ruledStatuses = concurrency?.split
    ? (Object.keys(STATUS_LABEL) as BoardStatus[]).filter((st) =>
        new RegExp(`\\b${st}\\b`, "i").test(stripMd(concurrency.split!.text)),
      )
    : [];

  // The strips: one per declared sequence, drawn only where this canon's own
  // kind bullets are what the sequence names. A canon whose pipeline lists
  // other kinds entirely gets no strip rather than a row of names pointing at
  // no card — the same bargain as the tags, read the other way round.
  const cardSlugs = new Set((pipeline?.kinds ?? []).map((k) => kindSlug(k.name)));
  const strips = SEQUENCES.filter((s) => s.kinds.some((k) => cardSlugs.has(k)));
  // A strip says the kind in the canon's own words where a card carries them,
  // and reads the slug back out where none does ("basic-layer" → "basic
  // layer", as `StagePill` does).
  const kindLabel = (k: string) =>
    pipeline?.kinds.find((c) => kindSlug(c.name) === k)?.name ?? k.replace(/-/g, " ");

  const byName = (n: string) => triggers.find((t) => t.name.toLowerCase() === n);
  const openTrigger = byName(OPEN_TRIGGER);
  const closeTrigger = byName(CLOSE_TRIGGER);
  // The Trigger part's sentence opens by saying what a trigger is, then lists
  // them. The first sentence is this section's lede; the list is its content.
  const triggerPart = parts.find((p) => p.name.toLowerCase() === "trigger");
  const triggersLede = triggerPart ? `${triggerPart.is.split(".")[0]}.` : "";

  return (
    <>
      <header className="flex flex-col gap-sm">
        <h1 className="text-2xl font-semibold text-fg-primary">How we work</h1>
        <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
          <MdInline text={unit()(lede)} anchors={anchors} />
        </p>
      </header>

      {/* The front door, first — every session starts by someone arriving with
          something, so the page starts where they do. */}
      {starters.length > 0 && (
        <section id="session-starters" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">{STARTERS}</h2>
          {startersLede && (
            <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
              <MdInline text={unit()(startersLede)} anchors={anchors} />
            </p>
          )}
          <div className="sys-starters">
            <div className="sys-starters-body flex flex-col">
              <StarterRows starters={starters} unit={unit} anchors={anchors} />
            </div>
          </div>
        </section>
      )}

      {/* The modes — the flavors the arc runs in, and where a session that has
          picked its shape reads what it may touch and what it runs. No count in
          the heading: each mount's docs declare their own modes, and the page
          renders however many it finds. */}
      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">The modes</h2>
        {/* The slot, before the cards that share it. The chips are the
            statuses THIS rule names, in the order the surface ranks them,
            labelled from the same constant Work labels its tiles with
            (`STATUS_LABEL`) and wearing the same skin: only `active` is
            marked, because that is the one the rule rations. */}
        {concurrency?.split && (
          <InsetNote label={stripMd(concurrency.split.lead)}>
            {ruledStatuses.length > 0 && (
              <span className="flex flex-wrap gap-sm py-tiny">
                {ruledStatuses.map((st) => (
                  <span key={st} className={`sys-pill${st === "active" ? " sys-pill-active" : ""}`}>
                    {STATUS_LABEL[st]}
                  </span>
                ))}
              </span>
            )}
            <span className="text-xs text-fg-secondary leading-relaxed">
              <MdInline text={unit()(concurrency.split.text)} anchors={anchors} />
            </span>
          </InsetNote>
        )}
        <div className="flex flex-col gap-lg">
          {modes.map((m) => {
            const stops = [...m.open, ...m.close].filter((s) => s.withPO).length;
            // Two units: the card's open face, and its folded ritual.
            const face = unit();
            const ritual = unit();
            return (
              <article key={m.key} id={`mode-${m.key}`} className={`sys-mode scroll-mt-2xl ${MODE_ACCENT[m.key] ?? ""}`}>
                <div className="flex items-baseline gap-sm flex-wrap">
                  <h3 className="text-lg font-semibold text-fg-primary">{m.label}</h3>
                  <span className="text-sm text-fg-tertiary">{m.tagline}</span>
                </div>

                {/* What it is (left) · what it may touch (right) */}
                {/* Near-even split: the right column holds three band cards and
                  runs taller than the left at 1.4fr_1fr, stretching the card. */}
              <div className="grid gap-lg lg:grid-cols-[1fr_1.1fr]">
                  <div className="flex flex-col gap-md">
                    <p className="text-sm text-fg-secondary leading-relaxed">
                      <MdInline text={face(m.purpose)} anchors={anchors} />
                    </p>
                    <Scope kind="reads" text={m.reads} link={face} anchors={anchors} />
                  </div>
                  <div className="flex flex-col gap-sm">
                    <Scope kind="home" text={m.homeGround} link={face} anchors={anchors} />
                    <Scope kind="careful" text={m.careful} link={face} anchors={anchors} />
                    <Scope kind="gated" text={m.gated} link={face} anchors={anchors} />
                  </div>
                </div>

                {/* The ritual — folded away. The summary counts what is inside
                    and says how much of it stops for a human. Both counts name
                    which list they are, and all three numbers derive. */}
                <details className="sys-ritual">
                  <summary>
                    <span className="sys-caret" aria-hidden>
                      ›
                    </span>
                    <span className="text-sm font-semibold text-fg-primary">The built-in ritual</span>
                    <span className="text-xs text-fg-tertiary">
                      {m.open.length} opening + {m.close.length} closing
                      {stops > 0 && ` · ${stops} stop for the ${PO_TERM}`}
                    </span>
                  </summary>
                  <div className="flex flex-col gap-lg pt-lg">
                    <Steps label="Opening ritual" trigger={openTrigger} steps={m.open} link={ritual} anchors={anchors} />
                    <div className="flex flex-col gap-sm">
                      <span className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                        During
                      </span>
                      <p className="text-sm text-fg-secondary leading-relaxed">
                        <MdInline text={ritual(m.during)} anchors={anchors} />
                      </p>
                    </div>
                    <Steps label="Closing ritual" trigger={closeTrigger} steps={m.close} link={ritual} anchors={anchors} />
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </section>

      {/* The moments rituals hang off. Two of these are the open and close
          above, tagged in place; the other four fire outside a phase
          altogether, and had no home on this page until now. */}
      {triggers.length > 0 && (() => {
        // One unit: the lede and the grid read as one list of short phrases.
        const t = unit();
        return (
          <section className="flex flex-col gap-md">
            <h2 className="text-lg font-semibold text-fg-primary">{triggerPart?.name ?? "Triggers"}</h2>
            {triggersLede && (
              <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
                <MdInline text={t(triggersLede)} anchors={anchors} />
              </p>
            )}
            <div className="sys-trigger-grid">
              {triggers.map((tr) => (
                <div key={tr.name} className="sys-scope">
                  <span className="sys-scope-head">{tr.name}</span>
                  {tr.fires && (
                    <span className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={t(tr.fires)} anchors={anchors} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* The role layer — the heavy path, and the last thing the page teaches
          rather than the first. Its own `Read when:` line leads it, because
          that line is the condition under which any of it applies: a collapsed
          board has no planner, and a side phase never splits at all. */}
      {pipeline && (() => {
        const open = unit();
        return (
        <section id="phase-pipeline" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">{PIPELINE}</h2>
          {pipeline.readWhen && (
            <InsetNote label="Read when">
              <span className="text-xs text-fg-secondary leading-relaxed">
                <MdInline text={open(pipeline.readWhen)} anchors={anchors} />
              </span>
            </InsetNote>
          )}
          <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
            <MdInline text={open(pipeline.lede)} anchors={anchors} />
          </p>

          {/* The sequences, above the cards they order. They are the one
              thing on this page the canon does not state as a shape: it says
              them in a prose sentence per mode, and the declared list in
              `lib/system.ts` is what a board's `stage:` is actually checked
              against — so the strips are drawn from that list, and the
              canon's own words fill them in. */}
          {strips.length > 0 && (
            <div className="sys-seqs">
              {strips.map((s) => (
                <div key={s.label} className="sys-seq">
                  <span className="sys-seq-label">{s.label}</span>
                  {/* An ordered list, so the order is the markup's and the
                      arrows are decoration (`.sys-seq-kinds li + li::before`)
                      rather than a glyph a screen reader has to interpret. */}
                  <ol className="sys-seq-kinds">
                    {s.kinds.map((k) => (
                      <li key={k}>{kindLabel(k)}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {/* One card per kind, tagged with the sequences that run it — which
              is how the three a run adds tell themselves from the three every
              phase runs. */}
          {pipeline.kinds.length > 0 && (
            <div className="sys-arc-kinds">
              {pipeline.kinds.map((k) => {
                const tags = sequencesOf(k.name);
                return (
                  <div key={k.name} className="sys-arc-kind">
                    {tags.length > 0 && (
                      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                        {tags.join(" · ")}
                      </span>
                    )}
                    {/* Pill on its own line, always: two of the level texts
                        wrap below the name anyway, and one card inline while
                        its siblings wrap reads as two layouts. */}
                    <span className="text-sm font-semibold text-fg-primary">
                      <MdInline text={k.name} />
                    </span>
                    <span className="sys-pill self-start">{k.level}</span>
                    <span className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={unit()(k.text)} anchors={anchors} />
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* The run, beside the kinds it adds — its lede open, its clauses
              folded like the pipeline's own rules below. The canon has to
              carry it last (everything under a `###` reads as part of it);
              the page puts it where it is read. */}
          {pipeline.run && (
            <div id="the-run" className="sys-run-note flex flex-col gap-sm scroll-mt-2xl">
              <div className="flex items-baseline gap-sm flex-wrap">
                <h3 className="text-base font-semibold text-fg-primary">{pipeline.run.title}</h3>
                {pipeline.run.tagline && (
                  <span className="text-sm text-fg-tertiary">{pipeline.run.tagline}</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-fg-secondary max-w-[72ch]">
                <MdInline text={unit()(pipeline.run.lede)} anchors={anchors} />
              </p>
              {pipeline.run.rules.length > 0 && (
                <div className="flex flex-col">
                  {pipeline.run.rules.map((r) => (
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
                        <p className="text-xs text-fg-secondary leading-relaxed">
                          <MdInline text={unit()(r.text)} anchors={anchors} />
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    <p className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={unit()(r.text)} anchors={anchors} />
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
        );
      })()}

      {/* Shared rules — reference, consulted not read: each rule folds to its
          own bold lead. A rule without one renders as a plain row. One rule
          is missing from this list on purpose: Concurrency renders with the
          modes, and a rule stated twice on one page is the two-descriptions
          drift the record warns about. */}
      {footRules.length > 0 && (() => {
        // Rules with no bold lead render open, one unit between them; each
        // folded rule is a unit of its own.
        const plain = unit();
        return (
        <section id="shared-rules" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">{SHARED_RULES}</h2>
          <div className="flex flex-col">
            {footRules.map((r, i) => {
              const lead = splitLead(r);
              if (!lead) {
                return (
                  <p key={i} className="sys-rule-plain text-sm text-fg-secondary leading-relaxed">
                    <MdInline text={plain(r)} anchors={anchors} />
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
                      <MdInline text={lead.lead} />
                    </span>
                  </summary>
                  <div className="pb-md pl-lg max-w-[72ch]">
                    <p className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={unit()(lead.text)} anchors={anchors} />
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
        );
      })()}

      {/* The kit — the concept layer and the reshaping map, demoted to
          collapsed shelves: meta about the model, not the flow itself. */}
      {parts.length > 0 && (
        <Shelf id="the-parts" label={PARTS} note={partsLede ? "the model is a kit — every part is yours to reshape" : ""}>
          {partsLede && (
            <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
              <MdInline text={unit()(partsLede)} anchors={anchors} />
            </p>
          )}
          <div className="grid gap-md md:grid-cols-2">
            {parts.map((p) => {
              const card = unit();
              return (
                <article key={p.name} className="sys-part">
                  <h3 className="text-base font-semibold text-fg-primary">{p.name}</h3>
                  <p className="text-sm text-fg-secondary leading-relaxed">
                    <MdInline text={card(p.is)} anchors={anchors} />
                  </p>
                  <div className="sys-scope">
                    <span className="sys-scope-head">Properties</span>
                    <span className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={card(p.properties)} anchors={anchors} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </Shelf>
      )}

      {adjustments.length > 0 && (() => {
        // The fold is the unit: its items are moments in one list, not
        // cards each naming a subject of its own.
        const shelf = unit();
        return (
        <Shelf id="adjustments" label={ADJUSTMENTS} note="allowed, never required">
          {adjustmentsLede && (
            <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
              <MdInline text={shelf(adjustmentsLede)} anchors={anchors} />
            </p>
          )}
          <ul className="flex flex-col gap-sm">
            {adjustments.map((a) => (
              <li key={a.when} className="sys-scope">
                <span className="text-sm font-semibold text-fg-primary leading-snug">
                  <MdInline text={shelf(a.when)} anchors={anchors} />
                </span>
                <span className="text-xs text-fg-secondary leading-relaxed">
                  <MdInline text={shelf(a.what)} anchors={anchors} />
                </span>
              </li>
            ))}
          </ul>
        </Shelf>
        );
      })()}

      <SourceNote
        href="/system/docs/CONTRIBUTING.md"
        path="CONTRIBUTING.md → The Work Model"
        note="the canonical rules; this page renders them"
      />
    </>
  );
}
