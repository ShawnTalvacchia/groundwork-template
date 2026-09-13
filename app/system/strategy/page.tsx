import Link from "next/link";
import { getAllDocs, type SystemDoc } from "@/lib/system";
import { PageIntro, StalePill, TierPill } from "../ui";

// Grouping is fully derived: strategy-root docs split by tier (settled models
// vs working drafts); interviews/ and research/ are their own shelves.

function DocCard({ d }: { d: SystemDoc }) {
  return (
    <Link href={`/system/docs/${d.relPath}`} className="sys-tile">
      <span className="flex items-baseline justify-between gap-md">
        <span className="text-sm font-semibold text-fg-primary">{d.title}</span>
        <StalePill staleDays={d.staleDays} lastReviewed={d.lastReviewed} />
      </span>
      <span className="flex">
        <TierPill tier={d.tier} />
      </span>
      {d.summary && <span className="text-xs text-fg-secondary leading-relaxed">{d.summary}</span>}
    </Link>
  );
}

function Shelf({ title, blurb, docs }: { title: string; blurb: string; docs: SystemDoc[] }) {
  if (docs.length === 0) return null;
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
        <p className="text-xs leading-relaxed text-fg-tertiary">{blurb}</p>
      </div>
      {docs.map((d) => (
        <DocCard key={d.relPath} d={d} />
      ))}
    </section>
  );
}

export default function StrategyPage() {
  const strategy = getAllDocs().filter((d) => d.dir === "strategy");
  const root = strategy.filter((d) => d.relPath.split("/").length === 2);
  const models = root
    .filter((d) => d.tier === "bedrock" || d.tier === "commitments")
    .sort((a, b) => (a.tier === "bedrock" ? -1 : b.tier === "bedrock" ? 1 : a.title.localeCompare(b.title)));
  const drafts = root.filter((d) => d.tier === "working");
  const interviews = strategy.filter((d) => d.relPath.startsWith("strategy/interviews/"));
  const research = strategy.filter((d) => d.relPath.startsWith("strategy/research/"));

  return (
    <>
      <PageIntro
        title="Strategy"
        count={strategy.length}
        blurb="What we believe and why — from the settled models down to the research they rest on. Each doc carries its one-line thesis; the doc itself is always one click away."
      />
      <Shelf
        title="The models"
        blurb="Settled by surviving contact — reopening one takes a structured challenge."
        docs={models}
      />
      <Shelf
        title="In revision"
        blurb="Strategy still being shaped — read as direction, not commitment."
        docs={drafts}
      />
      <Shelf
        title="Interview kits"
        blurb="The validation instrument: per-audience question kits the guided demo deliberately doesn't ask."
        docs={interviews}
      />
      <Shelf
        title="Research"
        blurb="The evidence layer: competitive teardowns and parked explorations."
        docs={research}
      />
    </>
  );
}
