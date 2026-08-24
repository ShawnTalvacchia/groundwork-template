import Link from "next/link";
import { getQueuedSeeds, getRoadmap, MODE_META, type RoadmapSection } from "@/lib/system";
import { EmptyNote, MdInline, PageIntro } from "../ui";

export default function RoadmapPage() {
  const roadmap = getRoadmap();
  const seeds = getQueuedSeeds();
  const seedFor = (name: string) => seeds.find((s) => s.phase === name);

  // Section ORDER comes from the doc, never from this file. Reorder ROADMAP.md
  // and this page follows: the order a compass puts its sections in is a claim
  // it makes, and a surface that hardcodes the order overrides that claim
  // without saying so.
  const blocks: Record<RoadmapSection, React.ReactNode> = {
    whereWeAre: (
      <section key="whereWeAre" className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">Where we are</h2>
        {roadmap.whereWeAre.map((p, i) => (
          <p key={i} className="text-sm text-fg-secondary leading-normal max-w-[70ch]">
            <MdInline text={p} />
          </p>
        ))}
      </section>
    ),
    queue: (
      <div key="queue" className="flex flex-col gap-xl">
        <section className="flex flex-col gap-md">
          <h2 className="text-lg font-semibold text-fg-primary">The queue</h2>
          {/* Condensed cards — the ROADMAP row is compass-weight (1-2 sentences);
              the whole card IS the link to the phase's SEED (planning/queued/),
              via the doc reader. Hub-tile hover + the metadata line's trailing
              arrow carry the affordance (the arrow alone on touch screens). */}
          {roadmap.phases.length === 0 && (
            <EmptyNote>Nothing queued yet — planned work lands here before a board opens.</EmptyNote>
          )}
          <div className="grid gap-md sm:grid-cols-2">
            {roadmap.phases.map((p, i) => {
              const seed = seedFor(p.name);
              const inner = (
                <>
                  <div className="flex items-baseline gap-sm">
                    <span className="sys-id">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-semibold text-fg-primary flex-1">{p.name}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-md gap-y-xs">
                    {seed && <span className="sys-pill">{MODE_META[seed.mode].label}</span>}
                    {p.phaseStatus && (
                      <span className="text-2xs uppercase tracking-wide text-fg-tertiary">{p.phaseStatus}</span>
                    )}
                    {seed?.priority && <span className="sys-pill">{seed.priority}</span>}
                    {seed && (
                      <span className="text-2xs text-fg-tertiary tabular-nums">
                        {seed.queued && `queued ${seed.queued}`}
                        {seed.noteCount > 0 && ` · ${seed.noteCount} note${seed.noteCount === 1 ? "" : "s"}`}
                        {" →"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-secondary leading-snug flex-1">
                    <MdInline text={p.goal} />
                  </p>
                </>
              );
              // A seedless queued row renders inert — the bidirectional seed
              // invariant (lib/derivation.ts) is what flags that state.
              return seed ? (
                <Link key={p.name} href={`/system/docs/${seed.relPath}`} className="sys-tile gap-sm">
                  {inner}
                </Link>
              ) : (
                <div key={p.name} className="sys-card flex flex-col gap-sm">
                  {inner}
                </div>
              );
            })}
          </div>
          {roadmap.runningAlongside.length > 0 && (
            <p className="text-xs text-fg-tertiary">
              Running alongside:{" "}
              {roadmap.runningAlongside.map((r, i) => {
                const lead = r.match(/^\*\*(.+?)\*\*/)?.[1] ?? r.split(" — ")[0];
                return (
                  <span key={i}>
                    {i > 0 && " · "}
                    <MdInline text={lead} />
                  </span>
                );
              })}
            </p>
          )}
        </section>
        {/* Parsed out of § What's Next, so it travels with the queue. */}
        {roadmap.validationHorizon && (
          <section className="flex flex-col gap-sm">
            <h2 className="text-lg font-semibold text-fg-primary">The validation horizon</h2>
            <p className="text-sm text-fg-secondary leading-normal max-w-[70ch]">
              <MdInline text={roadmap.validationHorizon} />
            </p>
          </section>
        )}
      </div>
    ),
    // The lenses. Each is a `- **Title:** text` bullet in the doc; the section
    // renders nothing until the ROADMAP has some, which is day one's state.
    keyConsiderations: roadmap.keyConsiderations.length > 0 && (
      <section key="keyConsiderations" className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">Key considerations</h2>
        <p className="text-xs text-fg-tertiary">Things to keep in mind across phases. Not tasks — lenses.</p>
        <div className="grid gap-md sm:grid-cols-2">
          {roadmap.keyConsiderations.map((k) => (
            <div key={k.title} className="sys-card flex flex-col gap-xs">
              <span className="text-sm font-semibold text-fg-primary">{k.title}</span>
              <p className="text-xs text-fg-secondary leading-snug">
                <MdInline text={k.text} />
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
    horizon: roadmap.horizon.length > 0 && (
      <section key="horizon" className="flex flex-col gap-sm">
        <h2 className="text-lg font-semibold text-fg-primary">On the horizon</h2>
        <ul className="flex flex-col gap-xs">
          {roadmap.horizon.map((b, i) => (
            <li key={i} className="text-xs text-fg-secondary list-disc ml-lg leading-snug">
              {b}
            </li>
          ))}
        </ul>
      </section>
    ),
  };

  return (
    <>
      <PageIntro
        title="Roadmap"
        blurb="Where we are and the queue — upcoming planned work of any mode; the compass, never a changelog. Closed phases live on the timeline; boards are created only when a phase opens."
      />
      {roadmap.sectionOrder.map((key) => blocks[key])}
      <p className="text-xs text-fg-tertiary">
        Full doc:{" "}
        <Link href="/system/docs/ROADMAP.md" className="underline underline-offset-2">
          ROADMAP.md
        </Link>
      </p>
    </>
  );
}
