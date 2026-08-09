import Link from "next/link";
import { getAllDocs, getFeatureAreas, type SystemDoc } from "@/lib/system";
import { EmptyNote, PageIntro } from "../ui";

// The feature registry, grouped by the areas the docs themselves declare
// (`getFeatureAreas`). This page holds NO vocabulary of its own: not the set,
// not the labels, not an order, not a thesis about how the areas relate.
//
// Three buckets, each conditional on its own content: the declared areas,
// anything carrying no area at all, and the demo layer if the project has one.

function FeatureCard({ f, compact }: { f: SystemDoc; compact?: boolean }) {
  return (
    <Link href={`/system/docs/${f.relPath}`} className="sys-tile">
      <span className="text-sm font-semibold text-fg-primary">{f.title}</span>
      {f.featureStatus && (
        <span className="flex">
          <span className="sys-pill">{f.featureStatus}</span>
        </span>
      )}
      {f.routes.length > 0 && (
        <span className="flex flex-wrap gap-xs">
          {f.routes.map((r) => (
            <code key={r} className="sys-code">
              {r}
            </code>
          ))}
        </span>
      )}
      {!compact && f.readWhen && (
        <span className="text-2xs text-fg-tertiary leading-snug">Read when: {f.readWhen}</span>
      )}
    </Link>
  );
}

export default function FeaturesPage() {
  const features = getAllDocs().filter((d) => d.dir === "features");
  const product = features.filter((f) => f.featureKind !== "demo");
  const areas = getFeatureAreas();
  const unmapped = product.filter((f) => !f.area);
  const demo = features.filter((f) => f.featureKind === "demo");

  return (
    <>
      <PageIntro
        title="Features"
        count={features.length}
        blurb="The feature registry — one current-state spec per capability, updated in the same PR as work that changes it. Grouped by the areas the feature docs declare. Status: imagined · staged · built."
      />
      {areas.length > 0 && (
        <section className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h2 className="text-lg font-semibold text-fg-primary">By area</h2>
            <p className="text-xs text-fg-tertiary">
              Areas come from each feature doc&apos;s <code className="sys-code">area:</code>{" "}
              frontmatter. Add, rename, or drop one there and this page follows.
            </p>
          </div>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area) => (
              <div key={area.key} className="flex flex-col gap-sm">
                <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                  {area.label}
                </span>
                {product
                  .filter((f) => f.area === area.key)
                  .map((f) => (
                    <FeatureCard key={f.relPath} f={f} compact />
                  ))}
              </div>
            ))}
          </div>
        </section>
      )}
      {unmapped.length > 0 && (
        <section className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h2 className="text-lg font-semibold text-fg-primary">
              {areas.length > 0 ? "No area yet" : "All features"}
            </h2>
            <p className="text-xs text-fg-tertiary">
              {areas.length > 0
                ? "Carrying no area: in the registry, outside the grouping. Add an area: to place one."
                : "No feature doc declares an area: yet. Add one to any doc and this page groups by it."}
            </p>
          </div>
          {unmapped.map((f) => (
            <FeatureCard key={f.relPath} f={f} />
          ))}
        </section>
      )}
      {product.length === 0 && (
        <EmptyNote>No product features yet — the first product phase writes the first spec.</EmptyNote>
      )}
      {demo.length > 0 && (
        <section className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <h2 className="text-lg font-semibold text-fg-primary">Demo layer</h2>
            <p className="text-xs text-fg-tertiary">
              Docs marked <code className="sys-code">feature-kind: demo</code> — the prototype&apos;s
              own affordances, not shipping product features.
            </p>
          </div>
          {demo.map((f) => (
            <FeatureCard key={f.relPath} f={f} />
          ))}
        </section>
      )}
    </>
  );
}
