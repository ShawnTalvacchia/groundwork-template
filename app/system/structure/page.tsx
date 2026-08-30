import Link from "next/link";
import { BRIEFING_FILE, getAllDocs, getArchivedPhases, getDecisions, TIER_ORDER } from "@/lib/system";
import { GROUPS } from "../nav-model";
import { PageIntro, StalePill, Tile } from "../ui";

const group = GROUPS.find((g) => g.slug === "structure")!;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string | null): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}` : "—";
}

/** A glance at a reference list, with the full page one click away. */
function PreviewCard({
  title,
  blurb,
  href,
  cta,
  rows,
}: {
  title: string;
  blurb: string;
  href: string;
  cta: string;
  rows: { date: string; text: string }[];
}) {
  return (
    <section className="sys-card flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <div className="flex items-baseline justify-between gap-md">
          <h2 className="text-base font-semibold text-fg-primary">{title}</h2>
          <Link href={href} className="text-xs text-fg-tertiary underline underline-offset-2 whitespace-nowrap">
            {cta}
          </Link>
        </div>
        <p className="text-xs text-fg-tertiary leading-snug">{blurb}</p>
      </div>
      <ul className="flex flex-col">
        {rows.map((r, i) => (
          <li key={i} className="flex items-baseline gap-md border-t border-edge-light py-sm first:border-t-0 first:pt-0">
            <span className="text-2xs text-fg-tertiary tabular-nums whitespace-nowrap w-12 shrink-0">{r.date}</span>
            <span className="text-xs text-fg-primary leading-snug">{r.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function StructurePage() {
  const docs = getAllDocs();
  const featureDocs = docs.filter((d) => d.featureStatus);
  const archived = getArchivedPhases();
  const decisions = getDecisions();
  const tierCounts = TIER_ORDER.map((t) => `${docs.filter((d) => d.tier === t).length} ${t}`).join(" · ");
  const briefing = docs.find((d) => d.relPath === BRIEFING_FILE);

  return (
    <>
      <PageIntro title="Structure" blurb={group.blurb} />

      {/* The briefing leads, at full width, above the four parts.
          It is one row among many on the docs index, which is where a doc
          belongs — but this is the doc every session reads and nobody opens,
          and burying it in the list is the exact failure this surfaces to fix.
          The pill is the point: freshness is the only thing here that ever
          asks for a review, and asking is what this tile is for. */}
      {briefing && (
        <Tile
          href={`/system/docs/${BRIEFING_FILE}`}
          label="Briefing"
          value={BRIEFING_FILE}
          detail={`${briefing.title} — ${
            briefing.readWhen ? `read when ${briefing.readWhen}` : "read at every session start"
          }. Every session reads it; only you review it.`}
          pill={<StalePill staleDays={briefing.staleDays} lastReviewed={briefing.lastReviewed} />}
        />
      )}

      {/* The four parts — what it does, what we believe, what we've written,
          how it looks. Peers here; whether one earns a tab is a navigation
          question, not a hierarchy one. */}
      <div className="grid gap-md sm:grid-cols-2">
        <Tile
          href="/system/features"
          label="Features"
          value={featureDocs.length}
          detail="What it does — one current-state spec per capability, grouped by the areas the docs declare."
        />
        <Tile
          href="/system/strategy"
          label="Strategy"
          value={docs.filter((d) => d.dir === "strategy").length}
          detail="What we believe — settled models, drafts, interview kits, research, each with its thesis."
        />
        <Tile
          href="/system/docs"
          label="Docs"
          value={docs.length}
          detail={`What we've written — every live doc by review tier. ${tierCounts}.`}
        />
        <Tile
          href="/system/styleguide"
          label="Styleguide"
          value="Design system"
          detail="How it looks — colors, type, tokens, components. Hand-authored today; its derive-from-globals.css refresh is queued."
        />
      </div>

      {/* The record — read down, not browsed */}
      <div className="grid gap-md lg:grid-cols-2">
        <PreviewCard
          title="Timeline"
          blurb="What shipped, newest first."
          href="/system/timeline"
          cta={`all ${archived.length} →`}
          rows={archived.slice(0, 4).map((p) => ({ date: shortDate(p.lastReviewed), text: p.title }))}
        />
        <PreviewCard
          title="Decisions"
          blurb="Why things are the way they are."
          href="/system/decisions"
          cta={`all ${decisions.length} →`}
          rows={decisions.slice(0, 4).map((d) => ({ date: shortDate(d.date), text: d.title }))}
        />
      </div>

      <p className="text-xs text-fg-tertiary max-w-[60ch]">
        Nothing starts settled — docs sink toward bedrock by surviving contact; reopening a settled one
        takes a{" "}
        <Link href="/system/tiers" className="underline underline-offset-2">
          structured challenge
        </Link>
        .
      </p>
    </>
  );
}
