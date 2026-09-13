import Link from "next/link";
import { getAllDocs, getTierPhysics, getTiers } from "@/lib/system";
import { MdInline, PageIntro, SourceNote } from "../ui";

// The tier MODEL (what a tier means, what guards it). Which doc sits at
// which tier is Structure → Docs.
//
// Tier is ONE axis: how guarded a doc is against change. Read / verify /
// change are three different verbs — see "What a tier does not mean", below.
// Rows come out of CONTRIBUTING's table in its order (most guarded first),
// so this page can't drift from the rulebook.

export default function TiersPage() {
  const physics = getTierPhysics();
  const tiers = getTiers();
  const docs = getAllDocs();
  const count = (t: string) => docs.filter((d) => d.tier === t).length;
  const docLabel = (n: number) => `${n} ${n === 1 ? "doc" : "docs"}`;

  return (
    <>
      <PageIntro
        title="Tiers"
        blurb="A doc's tier says how guarded it is — what it takes to change it, and nothing else. Tier follows from what the doc is about, not from a rank to climb; most docs sit where their subject puts them."
      />

      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">The four tiers</h2>
          <p className="text-xs leading-relaxed text-fg-tertiary">Most guarded first.</p>
        </div>
        <div className="flex flex-col gap-sm">
          {tiers.map((tier) => (
            <div key={tier.key} className={`sys-tier-rung sys-tier-rung--${tier.key}`}>
              <div className="flex items-baseline gap-sm">
                <span className="text-sm font-semibold text-fg-primary">{tier.label}</span>
                <span className="text-2xs text-fg-tertiary tabular-nums">{docLabel(count(tier.key))}</span>
              </div>
              <span className="text-xs text-fg-secondary leading-relaxed">
                <MdInline text={tier.lives} />
              </span>
              <span className="sys-tier-guard">
                <span className="text-2xs text-fg-tertiary">
                  <span className="font-semibold">To change it:</span> <MdInline text={tier.toChange} />
                </span>
                <span className="text-2xs text-fg-tertiary">
                  <span className="font-semibold">When to re-check:</span> <MdInline text={tier.recheck} />
                  {tier.staleAfterDays !== null && ` · flagged stale after ${tier.staleAfterDays}d`}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-fg-tertiary">
          Which doc sits where:{" "}
          <Link href="/system/docs" className="underline underline-offset-2">
            Structure → Docs
          </Link>
        </p>
      </section>

      {/* Read / verify / change are three verbs — a tier governs only the third. */}
      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">What a tier does not mean</h2>
          <p className="text-xs leading-relaxed text-fg-tertiary">Guarded is about changing, not reading.</p>
        </div>
        <div className="grid gap-md sm:grid-cols-3">
          {[
            { title: "Read is not review", text: physics.readIsNotReview },
            { title: "Stamping last-reviewed", text: physics.stamping },
            { title: "No clock on bedrock", text: physics.noBedrockClock },
          ].map((m) => (
            <div key={m.title} className="sys-card flex flex-col gap-sm">
              <h3 className="text-sm font-semibold text-fg-primary">{m.title}</h3>
              <p className="text-xs text-fg-secondary leading-relaxed">
                <MdInline text={m.text} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Movement — the exception, not the organizing principle */}
      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">When a doc moves</h2>
          <p className="text-xs leading-relaxed text-fg-tertiary">Rare — and never silently.</p>
        </div>
        <div className="grid gap-md sm:grid-cols-2">
          {[
            { title: "Sinking — earning a deeper tier", text: physics.sinking },
            { title: "Structured challenge — reopening", text: physics.challenge },
          ].map((m) => (
            <div key={m.title} className="sys-card flex flex-col gap-sm">
              <h3 className="text-sm font-semibold text-fg-primary">{m.title}</h3>
              <p className="text-xs text-fg-secondary leading-relaxed">
                <MdInline text={m.text} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {physics.antiStuck && (
        <p className="text-xs leading-relaxed text-fg-tertiary max-w-[70ch]">
          <MdInline text={physics.antiStuck} />
        </p>
      )}

      <SourceNote href="/system/docs/CONTRIBUTING.md" path="CONTRIBUTING.md → Doc Tiers & Review Physics" />
    </>
  );
}
