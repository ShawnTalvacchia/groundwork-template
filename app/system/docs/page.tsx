import Link from "next/link";
import { BRIEFING_FILE, getAllDocs, getTierPhysics, getTiers, TIER_META, type Tier, type TierPhysics } from "@/lib/system";
import { InsetNote, MdInline, PageIntro, StalePill } from "../ui";

// Tiers + doc map, merged (IA v2): every live doc grouped by tier — most
// guarded first — with its folder and freshness per row. One page answers
// both "what's settled?" and "what exists?".

const DISPLAY_ORDER: Tier[] = ["bedrock", "commitments", "working"];

/** The cross-cutting physics, folded to one row.
 *
 *  Per-tier explanation lives with its tier below, where you meet it — this
 *  carries only what is true of the system rather than of one tier, and stays
 *  collapsed so the list it heads is still the first thing on the page. */
function TierPhysicsRow({ physics }: { physics: TierPhysics }) {
  const notes = [
    { title: "Sinking — how a doc earns a tier", text: physics.sinking },
    { title: "Structured challenge — reopening one", text: physics.challenge },
    { title: "No clock on the deepest tier", text: physics.noBedrockClock },
    { title: "Read is not review", text: physics.readIsNotReview },
  ].filter((n) => n.text);
  if (!notes.length) return null;

  return (
    <details className="sys-details">
      {/* `.sys-details` hides the native marker and expects a .sys-caret child
          to carry the affordance — same shape as StarterRows. */}
      <summary className="flex flex-wrap items-baseline gap-sm text-xs text-fg-secondary">
        <span className="sys-caret" aria-hidden>
          ›
        </span>
        How a doc earns a tier, and what it takes to reopen one
        <Link
          href="/system/tiers"
          className="ml-auto text-fg-tertiary underline underline-offset-2 whitespace-nowrap"
        >
          full physics →
        </Link>
      </summary>
      <div className="flex flex-col gap-sm pb-sm">
        {notes.map((n) => (
          <p key={n.title} className="text-xs text-fg-secondary leading-snug max-w-[76ch]">
            <span className="font-semibold text-fg-primary">{n.title}.</span> <MdInline text={n.text} />
          </p>
        ))}
      </div>
    </details>
  );
}

export default function DocsPage() {
  const docs = getAllDocs();
  const tiers = getTiers();
  const physics = getTierPhysics();
  const stale = docs.filter((d) => d.staleDays !== null);

  return (
    <>
      <PageIntro
        title="Docs"
        count={docs.length}
        blurb="Every live doc, grouped by how guarded it is against change — the briefing at the project root included, since every session reads it first. Nothing starts settled: docs sink by surviving, and reopening a settled one takes a structured challenge. Amber marks docs past their tier's check-up backstop. The archive is deliberately absent — reach it through the timeline."
      />
      <TierPhysicsRow physics={physics} />
      {stale.length > 0 && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">Possibly stale</h2>
          <p className="text-xs text-fg-tertiary max-w-[48ch]">
            Past their tier&apos;s review heuristic — a signal to review, not an obligation.
          </p>
          <ul className="flex flex-col">
            {stale.map((d) => (
              <li key={d.relPath}>
                <Link
                  href={`/system/docs/${d.relPath}`}
                  className="sys-row-link flex items-center justify-between gap-md py-sm"
                >
                  <span className="text-sm text-fg-primary">{d.title}</span>
                  <StalePill staleDays={d.staleDays} lastReviewed={d.lastReviewed} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {DISPLAY_ORDER.map((tier) => {
        const tierDocs = docs.filter((d) => d.tier === tier);
        const row = tiers.find((t) => t.key === tier);
        return (
          <section key={tier} className="flex flex-col gap-sm">
            <h2 className="text-lg font-semibold text-fg-primary">{TIER_META[tier].label}</h2>
            {row && (
              <InsetNote>
                <span className="text-xs text-fg-secondary leading-snug">
                  <MdInline text={row.lives} />
                </span>
                <span className="text-xs text-fg-tertiary leading-snug">
                  <span className="text-fg-secondary">To change:</span> <MdInline text={row.toChange} />
                </span>
                <span className="text-2xs text-fg-tertiary leading-snug">
                  Re-checked <MdInline text={row.recheck.toLowerCase()} /> ·{" "}
                  {row.staleAfterDays === null ? "no staleness clock" : `flagged after ${row.staleAfterDays} days`}
                </span>
              </InsetNote>
            )}
            <ul className="flex flex-col">
              {tierDocs.map((d) => (
                <li key={d.relPath}>
                  <Link
                    href={`/system/docs/${d.relPath}`}
                    className="sys-row-link flex items-center justify-between gap-md py-sm"
                  >
                    <span className="flex items-baseline gap-sm min-w-0">
                      <span className="text-sm text-fg-primary truncate">{d.title}</span>
                      <span className="text-2xs text-fg-tertiary whitespace-nowrap">
                        {d.relPath === BRIEFING_FILE
                          ? `${BRIEFING_FILE} · project root`
                          : d.relPath.split("/").slice(0, -1).join("/") || "docs"}
                        {d.status && d.status !== "active" ? ` · ${d.status}` : ""}
                      </span>
                    </span>
                    <StalePill staleDays={d.staleDays} lastReviewed={d.lastReviewed} />
                  </Link>
                </li>
              ))}
              {tierDocs.length === 0 && <li className="text-xs text-fg-tertiary py-sm">Nothing at this tier.</li>}
            </ul>
          </section>
        );
      })}
      {docs.some((d) => !d.tier) && (
        <section className="flex flex-col gap-sm">
          <h2 className="text-lg font-semibold text-fg-primary">Untiered</h2>
          <ul className="flex flex-col">
            {docs
              .filter((d) => !d.tier)
              .map((d) => (
                <li key={d.relPath} className="text-sm text-fg-secondary py-sm">
                  {d.relPath}
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
