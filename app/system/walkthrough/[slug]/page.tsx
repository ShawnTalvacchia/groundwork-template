import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getActiveBoards,
  getWalkthrough,
  getWalkthroughSlugs,
  glossaryLede,
  MODE_META,
  type WalkthroughItem,
  type WalkthroughSection,
} from "@/lib/system";
import { InsetNote, EmptyNote, MdInline, resolveDocHref } from "../../ui";

/* The walkthrough, scoped for the person walking it.
 *
 * The generic doc viewer renders it as a file — breadcrumbed "Docs" under
 * Structure, headed by a source-path card, its calls, checks, evidence and
 * Decisions log one flat column of prose. But a walkthrough is read during
 * *Work*, as the phase's main action, by someone going point by point with the
 * agent. A file reader is the wrong shape for that, and the file tree is the
 * wrong place to keep it.
 *
 * The doc route still resolves — `/system/docs/phases/<slug>-walkthrough.md`
 * renders the file as a file, the way every other doc does. This page is the
 * second consumer, not a replacement: the same source, shaped for a different
 * reader.
 *
 * **Derived, like everything here.** The section headings are the doc's own
 * `##` lines in the doc's own order; the items are found by their identifiers
 * (`lib/system.ts` → parseWalkthrough), which is what lets an adopter rename a
 * section without this page rendering a heading over nothing. Nothing on the
 * page names a section of the mold. */

/** The slug that stands in for "this project has no walkthroughs yet."
 *
 *  A project on day one has none — the first one is written when the first
 *  build commits — and `generateStaticParams` returning `[]` prerenders the
 *  route for nothing at all, so it does not exist until a rebuild. One entry
 *  keeps the route real from the start; the page `notFound()`s it like any
 *  unknown slug.
 *
 *  It matters more than it looks wherever this route sits under another
 *  dynamic segment: Next composes a nested `generateStaticParams` across its
 *  parent's params, and a child returning `[]` for **any one** parent
 *  prerenders the route for **none** of them. `dynamicParams = true` does not
 *  rescue that — a statically enumerated parent has no fallback shell, so the
 *  request dies as `NoFallbackError`. A floor entry is what does.
 *
 *  It is a real path, so it must be one no board can claim: a board slug is a
 *  filename stem, and `__` is not a character `phases/*.md` ever starts with. */
const NO_WALKTHROUGHS = "__none";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getWalkthroughSlugs();
  return (slugs.length > 0 ? slugs : [NO_WALKTHROUGHS]).map((slug) => ({ slug }));
}

/** Markdown inside one item — its evidence, its URL, its Expect line.
 *  Block-level, because a check's evidence is often a fenced command output
 *  and the inline renderer would print the backticks. */
function ItemBody({ body }: { body: string }) {
  if (!body) return null;
  return (
    <div className="sys-doc sys-doc--tight">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => {
            const resolved = resolveDocHref(href ?? "", "phases");
            if (resolved.startsWith("/system/")) return <Link href={resolved}>{children}</Link>;
            if (/^https?:\/\//.test(resolved))
              return (
                <a href={resolved} target="_blank" rel="noreferrer">
                  {children}
                </a>
              );
            // An in-app path outside /system is still a real destination — a
            // V item's URL is most often exactly that.
            if (resolved.startsWith("/")) return <a href={resolved}>{children}</a>;
            return <span>{children}</span>;
          },
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}

/** One item, in the register its kind earns.
 *
 *  A **call** is the loudest thing on the page: it is a decision the agent made
 *  alone, and the phase cannot close while one is open. A **check** is a box
 *  with its walked state on it. A **glance** is a check the mold says to skip
 *  most of the time. A **note** is an unidentified bullet — the Decisions log's
 *  lines — and gets no ornament at all, because the log is transit: it is read
 *  at the close and deleted with the board. */
function Item({ item }: { item: WalkthroughItem }) {
  if (item.kind === "note") {
    return (
      <li className="sys-wt-note">
        <span className="text-xs text-fg-primary">
          <MdInline text={item.title} docDir="phases" />
        </span>
        {item.body && (
          <span className="text-xs text-fg-secondary">
            {" "}
            <MdInline text={item.body} docDir="phases" />
          </span>
        )}
      </li>
    );
  }

  const isCall = item.kind === "call";
  return (
    <li className={`sys-wt-item${isCall ? " sys-wt-item--call" : ""}`} data-walked={item.walked || undefined}>
      <div className="flex items-baseline gap-sm flex-wrap">
        {/* The box is the state, stated. `[x]` and `[ ]` are the doc's own
            record of what the PO has passed, and a walkthrough read across days
            is read for exactly that. O items carry no box by rule — an item is
            open, or it is gone. */}
        {item.walked === null ? (
          <span className="sys-wt-open" aria-hidden />
        ) : (
          <span className="sys-wt-box" data-on={item.walked || undefined} aria-hidden />
        )}
        {item.id && <span className="sys-id">{item.id}</span>}
        <span className="text-sm font-semibold text-fg-primary">
          <MdInline text={item.title} docDir="phases" />
        </span>
        {item.walked === false && (
          <span className="text-2xs uppercase tracking-wide text-fg-tertiary">to walk</span>
        )}
        {item.walked === true && (
          <span className="text-2xs uppercase tracking-wide text-brand-strong">passed</span>
        )}
      </div>
      <ItemBody body={item.body} />
    </li>
  );
}

function Section({ section }: { section: WalkthroughSection }) {
  const empty = section.groups.every((g) => g.items.length === 0);
  return (
    <section id={section.id} className="flex flex-col gap-md">
      <h2 className="text-lg font-semibold text-fg-primary">{section.heading}</h2>
      {empty && !section.prose && (
        <EmptyNote>
          Nothing under this heading — items land here as the build raises them.
        </EmptyNote>
      )}
      {section.groups.map((g, i) => (
        <div key={g.heading ?? i} className="flex flex-col gap-sm">
          {g.heading && (
            <h3 className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
              {g.heading}
            </h3>
          )}
          <ul className="sys-wt-list">
            {g.items.map((it, j) => (
              <Item key={it.id ?? `${i}-${j}`} item={it} />
            ))}
          </ul>
        </div>
      ))}
      {/* Whatever the section holds that is neither a bullet nor a subheading —
          the mold's author card is the usual case. Kept, set back: dropping
          content a doc declares is the one thing a derived page may never do. */}
      {section.prose && (
        <div className="sys-doc sys-doc--tight text-fg-tertiary">
          <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
            {section.prose}
          </ReactMarkdown>
        </div>
      )}
    </section>
  );
}

export default async function WalkthroughPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wt = getWalkthrough(slug);
  if (!wt) notFound();
  const board = getActiveBoards().find((b) => b.slug === slug) ?? null;
  const lede = glossaryLede("Walkthrough");
  const c = wt.counts;

  return (
    <>
      <header className="flex flex-col gap-sm">
        <h1 className="text-2xl font-semibold text-fg-primary">{wt.title}</h1>
        {lede && <p className="text-sm text-fg-secondary max-w-[60ch]">{lede}</p>}
        <div className="flex items-center gap-sm flex-wrap">
          {board && <span className="sys-pill">{MODE_META[board.mode].label}</span>}
          {board?.stage && <span className="sys-pill">{board.stage.replace(/-/g, " ")}</span>}
          <span className="text-xs text-fg-secondary tabular-nums">
            {c.calls} {c.calls === 1 ? "call" : "calls"} open · {c.checks}{" "}
            {c.checks === 1 ? "check" : "checks"} to walk
            {c.walked > 0 && ` · ${c.walked} walked`}
            {c.glances > 0 && ` · ${c.glances} to glance`}
          </span>
        </div>
        {/* The way back is the board, not the file tree — the callout there is
            what sent the reader here. The file stays reachable too: it is a doc
            like any other, and the doc route renders it as one. */}
        <p className="text-xs text-fg-tertiary">
          <Link href={`/system/phase#${slug}`} className="underline underline-offset-2">
            ← the board
          </Link>
          {" · "}
          <Link
            href={`/system/docs/phases/${slug}-walkthrough.md`}
            className="underline underline-offset-2"
          >
            the file
          </Link>
        </p>
      </header>

      {/* The mold's own "how this works" card, folded: it is the same text on
          every walkthrough, and a reader walking their fourth one does not need
          it open. `InsetNote` is the surface's explainer visual — one home, and
          this is its second caller on a page rather than inside a doc. */}
      {wt.intro && (
        <details className="sys-details sys-details--solo">
          <summary className="flex items-baseline gap-sm text-2xs text-fg-tertiary">
            <span className="sys-caret" aria-hidden>
              ›
            </span>
            How this works
          </summary>
          <InsetNote>
            <div className="sys-doc sys-doc--tight">
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                {wt.intro}
              </ReactMarkdown>
            </div>
          </InsetNote>
        </details>
      )}

      {wt.sections.length === 0 ? (
        <EmptyNote>
          This walkthrough has no sections yet — the build writes them as it goes, from{" "}
          <code className="sys-code">_walkthrough-template.md</code>.
        </EmptyNote>
      ) : (
        wt.sections.map((s) => <Section key={s.id} section={s} />)
      )}
    </>
  );
}
