import Link from "next/link";
import { getQueuedSeeds, getRoadmap, MODE_META } from "@/lib/system";
import { EmptyNote, MdInline, PageIntro } from "../ui";

export default function RoadmapPage() {
  const roadmap = getRoadmap();
  const seeds = getQueuedSeeds();
  const seedFor = (name: string) => seeds.find((s) => s.phase === name);

  return (
    <>
      <PageIntro
        title="Roadmap"
        blurb="Where we are and the queue — upcoming planned work of any mode; the compass, never a changelog. Closed phases live on the timeline; boards are created only when a phase opens."
      />
      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">Where we are</h2>
        {roadmap.whereWeAre.map((p, i) => (
          <p key={i} className="text-sm text-fg-secondary leading-normal max-w-[70ch]">
            <MdInline text={p} />
          </p>
        ))}
      </section>
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
      {roadmap.validationHorizon && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">The validation horizon</h2>
          <p className="text-sm text-fg-secondary leading-normal max-w-[70ch]">
            <MdInline text={roadmap.validationHorizon} />
          </p>
        </section>
      )}
      {roadmap.horizon.length > 0 && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">On the horizon</h2>
          <ul className="flex flex-col gap-xs">
            {roadmap.horizon.map((b, i) => (
              <li key={i} className="text-xs text-fg-secondary list-disc ml-lg leading-snug">
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-fg-tertiary">
        Full doc:{" "}
        <Link href="/system/docs/ROADMAP.md" className="underline underline-offset-2">
          ROADMAP.md
        </Link>
      </p>
    </>
  );
}
