import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import path from "node:path";
import { getAllDocPaths, getDocByPath } from "@/lib/system";
import { StalePill, TierPill } from "../../ui";

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

/** GitHub-flavored heading id, so `#fragment` links into a doc resolve.
 *  Must stay in sync with the slugs used by section links in the docs. */
function headingId(children: ReactNode): string {
  const textOf = (n: ReactNode): string => {
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(textOf).join("");
    if (n && typeof n === "object" && "props" in n)
      return textOf((n as { props: { children?: ReactNode } }).props.children);
    return "";
  };
  return textOf(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const relPath = slug.map((s) => decodeURIComponent(s)).join("/");
  const result = getDocByPath(relPath);
  if (!result) notFound();
  const { doc, body } = result;
  const docDir = path.dirname(relPath);

  const resolveHref = (href: string): string => {
    if (/^(https?:)?\/\//.test(href) || href.startsWith("#") || href.startsWith("/")) return href;
    const [clean, hash] = href.split("#");
    if (!clean.endsWith(".md")) return href;
    const resolved = path.normalize(path.join(docDir === "." ? "" : docDir, clean));
    // A #fragment survives resolution — section links (e.g. CONTRIBUTING.md#closing-a-phase)
    // land on the heading id the renderer below stamps.
    return `/system/docs/${resolved}${hash ? `#${hash}` : ""}`;
  };

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // Raw HTML nodes hide instead of rendering as literal text — the
          // parser markers (<!-- PARSED by … -->) must stay invisible here.
          // Code spans/fences are unaffected (they aren't html nodes).
          skipHtml
          components={{
            h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
            h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
            h4: ({ children }) => <h4 id={headingId(children)}>{children}</h4>,
            a: ({ href, children }) => {
              const resolved = resolveHref(href ?? "");
              if (resolved.startsWith("/system/")) return <Link href={resolved}>{children}</Link>;
              if (/^https?:\/\//.test(resolved)) {
                return (
                  <a href={resolved} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                );
              }
              // An in-app path the mount does not own is still a real
              // destination. Emit a plain anchor rather than swallowing the
              // link into text — a de-linked path gives the reader no sign a
              // link was ever meant. Only an unresolvable ref stays inert.
              if (resolved.startsWith("/")) return <a href={resolved}>{children}</a>;
              return <span>{children}</span>;
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </article>
    </>
  );
}
