import Link from "next/link";
import { getFutureItems, getOpenQuestions, getPunchItems, getTrackerModel, stripMd } from "@/lib/system";
import { MdInline, PageIntro, SourceNote } from "../ui";

// Where candidates wait between phases — the model (from CONTRIBUTING) shown
// against the live counts.

const TRACKER_LINKS: Record<string, { href: string; label: string }> = {
  "punch-list": { href: "/system/punch-list", label: "Punch list" },
  "Open Questions & Assumptions Log": { href: "/system/questions", label: "Open questions" },
  "Future Considerations": { href: "/system/future", label: "Future considerations" },
};

export default function TrackersPage() {
  const { lede, trackers, flow, sharedRule } = getTrackerModel();
  const counts: Record<string, number> = {
    "punch-list": getPunchItems().length,
    "Open Questions & Assumptions Log": getOpenQuestions().reduce((n, t) => n + t.questions.length, 0),
    "Future Considerations": getFutureItems().length,
  };

  return (
    <>
      <PageIntro title="Trackers" blurb={stripMd(lede)} />

      <section className="flex flex-col gap-md">
        {trackers.map((t) => {
          const link = TRACKER_LINKS[t.name];
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
                      <MdInline text={value} />
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
                <MdInline text={f} />
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
            <MdInline text={sharedRule} />
          </p>
        </section>
      )}

      <SourceNote href="/system/docs/CONTRIBUTING.md" path="CONTRIBUTING.md → The Planning Trackers" />
    </>
  );
}
