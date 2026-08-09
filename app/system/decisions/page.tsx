import { getDecisions } from "@/lib/system";
import { EmptyNote, MdInline, PageIntro, SourceNote } from "../ui";

export default function DecisionsPage() {
  const decisions = getDecisions();

  return (
    <>
      <PageIntro
        title="Decisions"
        count={decisions.length}
        blurb="The institutional memory — dated What/Why/Where entries, newest first. Walkthrough docs capture decisions during a phase; the load-bearing ones get lifted here at close so they survive the archive. This is the catch-up feed: read down until you hit a date you remember."
      />
      {decisions.length === 0 && (
        <EmptyNote>
          No decisions logged yet — phases lift their load-bearing calls here as they close.
        </EmptyNote>
      )}
      <div className="flex flex-col gap-lg">
        {decisions.map((d) => (
          <article key={`${d.date}-${d.title}`} className="sys-card flex flex-col gap-sm">
            <div className="flex items-baseline gap-md">
              <span className="text-xs text-fg-tertiary tabular-nums whitespace-nowrap">{d.date}</span>
              <h2 className="text-sm font-semibold text-fg-primary">{d.title}</h2>
            </div>
            {d.what && (
              <p className="text-xs text-fg-primary leading-snug">
                <span className="font-semibold">What:</span> <MdInline text={d.what} />
              </p>
            )}
            {d.why && (
              <p className="text-xs text-fg-secondary leading-snug">
                <span className="font-semibold">Why:</span> <MdInline text={d.why} />
              </p>
            )}
            {d.where && (
              <p className="text-2xs text-fg-tertiary leading-snug">
                <span className="font-semibold">Where:</span> <MdInline text={d.where} />
              </p>
            )}
          </article>
        ))}
      </div>
      <SourceNote href="/system/docs/decisions.md" path="docs/decisions.md" />
    </>
  );
}
