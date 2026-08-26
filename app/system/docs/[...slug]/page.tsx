import Link from "next/link";
import { notFound } from "next/navigation";
import path from "node:path";
import { getAllDocPaths, getDocByPath } from "@/lib/system";
import { StalePill, TierPill, DocProse } from "../../ui";

// Renders any doc under docs/ (archive included) as a read-only page.
// Relative .md links resolve to other /system/docs pages so the knowledge
// base is browsable in place. Every doc is prerendered at build time —
// nothing reads the filesystem at request time, so the surface is exactly
// as fresh as the last commit.

export const dynamicParams = false;

export function generateStaticParams() {
  // CLAUDE.md is the one renderable doc outside docs/ (repo root).
  return [...getAllDocPaths(), "CLAUDE.md"].map((relPath) => ({ slug: relPath.split("/") }));
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
        <code className="sys-code">{doc.relPath === "CLAUDE.md" ? "CLAUDE.md" : `docs/${doc.relPath}`}</code>
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
