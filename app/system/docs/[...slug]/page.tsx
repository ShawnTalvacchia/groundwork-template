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
  const { doc, body } = result;
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
      </div>
      <article className="sys-doc">
        <DocProse body={body} docDir={docDir} />
      </article>
    </>
  );
}
