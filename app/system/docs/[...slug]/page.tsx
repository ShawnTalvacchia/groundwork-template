import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { docSourcePath, getAllDocPaths, getDocByPath } from "@/lib/system";
import { StalePill, TierPill, DocProse } from "../../ui";

// Renders any doc under docs/ (archive included) as a read-only page.
// Relative .md links resolve to other /system/docs pages so the knowledge
// base is browsable in place. Every doc is prerendered at build time —
// nothing reads the filesystem at request time, so the surface is exactly
// as fresh as the last commit.

export const dynamicParams = false;

export function generateStaticParams() {
  // The briefing at the project root is in this list too — getAllDocPaths
  // includes it when the project has one, so a briefing-less project
  // prerenders no route for it rather than a 404.
  return getAllDocPaths().map((relPath) => ({ slug: relPath.split("/") }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const relPath = slug.map((s) => decodeURIComponent(s)).join("/");
  const result = getDocByPath(relPath);
  if (!result) notFound();
  const { doc, body, frontmatter } = result;
  const docDir = path.dirname(relPath);

  return (
    <>
      <div className="sys-card flex flex-wrap items-center gap-sm text-xs text-fg-tertiary">
        <code className="sys-code">{docSourcePath(doc.relPath)}</code>
        <TierPill tier={doc.tier} />
        {doc.status && <span className="sys-pill">{doc.status}</span>}
        {doc.featureStatus && <span className="sys-pill">{doc.featureStatus}</span>}
        <span className="ml-auto">
          <StalePill staleDays={doc.staleDays} lastReviewed={doc.lastReviewed} />
        </span>
        {doc.readWhen && <span className="w-full text-2xs">Read when: {doc.readWhen}</span>}
        {/* The pills above are a fixed four: tier, status, freshness, read-when.
            That set answers "how guarded, is it live, how fresh, when do I read
            it" and it does not grow when a doc declares more — so a seed's
            `priority`, a board's `mode`, a feature's `area` reached no reader
            here at all, on the one page that shows the file itself. The block
            below is every key the file declares, in its own order, folded the
            way the Docs page folds the tier physics: chrome stays chrome, and
            the answer is one click away instead of absent. Derived whole — no
            key list is written here, so a doc that invents a field shows it. */}
        {frontmatter.length > 0 && (
          <details className="sys-details sys-details--solo w-full">
            <summary className="flex items-baseline gap-sm text-2xs text-fg-tertiary">
              <span className="sys-caret" aria-hidden>
                ›
              </span>
              Frontmatter · {frontmatter.length} {frontmatter.length === 1 ? "key" : "keys"}
            </summary>
            <dl className="flex flex-col">
              {frontmatter.map((f) => (
                <div
                  key={f.key}
                  className="flex flex-col gap-tiny border-b border-edge-light py-xs last:border-0 sm:flex-row sm:gap-md"
                >
                  <dt className="text-2xs font-mono text-fg-primary sm:w-40 sm:shrink-0">{f.key}</dt>
                  <dd className="text-2xs text-fg-secondary leading-snug max-w-[64ch]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
      <article className="sys-doc">
        <DocProse body={body} docDir={docDir} />
      </article>
    </>
  );
}
