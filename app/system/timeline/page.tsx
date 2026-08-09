import Link from "next/link";
import { getArchivedPhases } from "@/lib/system";
import { EmptyNote, PageIntro } from "../ui";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthLabel(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})/);
  if (!m) return "Undated";
  return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export default function TimelinePage() {
  const phases = getArchivedPhases();
  const months: { label: string; items: typeof phases }[] = [];
  for (const p of phases) {
    const label = monthLabel(p.lastReviewed);
    const bucket = months.find((mo) => mo.label === label);
    if (bucket) bucket.items.push(p);
    else months.push({ label, items: [p] });
  }

  return (
    <>
      <PageIntro
        title="Timeline"
        count={phases.length}
        blurb="The shipped record at a glance — every closed phase by month, newest first. Each links to its archived board (with its walkthrough alongside), which remains the deep record."
      />
      {phases.length === 0 && (
        <EmptyNote>Nothing shipped yet — closed phases land here as they are archived.</EmptyNote>
      )}
      <div className="flex flex-col gap-lg">
        {months.map((mo) => (
          <section key={mo.label} className="flex flex-col gap-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-tertiary">{mo.label}</h2>
            <ul className="flex flex-col">
              {mo.items.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/system/docs/archive/phases/${p.slug}.md`}
                    className="sys-row-link flex items-baseline gap-md py-xs"
                  >
                    <span className="text-xs text-fg-tertiary tabular-nums whitespace-nowrap">
                      {p.lastReviewed ?? "—"}
                    </span>
                    <span className="text-sm text-fg-primary">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
