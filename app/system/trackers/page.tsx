import Link from "next/link";
import { getFutureItems, getGlossary, getOpenQuestions, getPunchItems, getTrackerModel, headingSlug, sectionHrefs } from "@/lib/system";
import { MdInline, PageIntro, SourceNote, termUnits } from "../ui";

// Where candidates wait between phases — the model (from CONTRIBUTING) shown
// against the live counts.

const TRACKER_LINKS: Record<string, { href: string; label: string }> = {
  "punch-list": { href: "/system/punch-list", label: "Punch list" },
  "Open Questions & Assumptions Log": { href: "/system/questions", label: "Open questions" },
  "Future Considerations": { href: "/system/future", label: "Future considerations" },
};

export default function TrackersPage() {
  const { lede, trackers, flow, sharedRule } = getTrackerModel();
  // `§ Name` references link to their section in the doc reader, and glossary
  // terms at their first noun-use per reading unit: the lede, each tracker's
  // card, the flow list, the shared rule.
  const anchors = sectionHrefs(
    "CONTRIBUTING.md",
    [lede, ...trackers.flatMap((t) => [t.holds, t.unit, t.exit]), ...flow, sharedRule].filter(Boolean),
    (id) => `/system/docs/CONTRIBUTING.md#${id}`,
  );
  // The page's own subject never links: a reader here is already reading
  // the full account of it, and the glossary's line is the short one.
  const unit = termUnits(getGlossary(), [headingSlug("Tracker")]);
  const flowUnit = unit();
  const counts: Record<string, number> = {
    "punch-list": getPunchItems().length,
    "Open Questions & Assumptions Log": getOpenQuestions().reduce((n, t) => n + t.questions.length, 0),
    "Future Considerations": getFutureItems().length,
  };

  return (
    <>
      <PageIntro title="Trackers" blurb={<MdInline text={unit()(lede)} anchors={anchors} />} />

      <section className="flex flex-col gap-md">
        {trackers.map((t) => {
          const link = TRACKER_LINKS[t.name];
          const card = unit();
          return (
            <div key={t.name} className="sys-card flex flex-col gap-md">
              <div className="flex items-baseline justify-between gap-md">
                {link ? (
                  <Link href={link.href} className="text-sm font-semibold text-fg-primary no-underline hover:underline">
                    {link.label} →
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-fg-primary">{t.name}</span>
                )}
                <span className="text-lg font-semibold text-fg-primary tabular-nums">{counts[t.name] ?? 0}</span>
              </div>
              <dl className="grid gap-sm sm:grid-cols-3">
                {[
                  ["Holds", t.holds],
                  ["Unit", t.unit],
                  ["Leaves when", t.exit],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-xs">
                    <dt className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{label}</dt>
                    <dd className="text-xs text-fg-secondary leading-relaxed">
                      <MdInline text={card(value)} anchors={anchors} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">How work flows</h2>
        <ul className="flex flex-col gap-sm">
          {flow.map((f, i) => (
            <li key={i} className="text-xs text-fg-secondary leading-relaxed flex gap-sm">
              <span className="sys-step-num">{i + 1}</span>
              <span>
                <MdInline text={flowUnit(f)} anchors={anchors} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {sharedRule && (
        <section className="callout-brand rounded-panel p-md flex flex-col gap-xs">
          <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
            Shared rule — prune on resolve
          </span>
          <p className="text-xs text-fg-secondary leading-relaxed">
            <MdInline text={unit()(sharedRule)} anchors={anchors} />
          </p>
        </section>
      )}

      <SourceNote href="/system/docs/CONTRIBUTING.md" path="CONTRIBUTING.md → The Planning Trackers" />
    </>
  );
}
