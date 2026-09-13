import Link from "next/link";
import {
  flattenRoutes,
  getActiveBoards,
  getSiteMap,
  getSurveyRows,
  routeCovered,
  type RouteNode,
  type SurveyRow,
} from "@/lib/system";
import { EmptyNote, InsetNote, PageIntro } from "../ui";

// The site map — the route tree as the code declares it.
//
// Derived, never authored, like every page here, and the one whose source is
// the routes directory rather than a doc (`ROUTES_DIR`, `lib/system.ts`). It exists for
// a moment the canon names: a run's close reconciles the picture doc's
// ASPIRATIONAL site map against this one — what is in both is done, what only
// the aspiration holds is queued, parked or dropped (CONTRIBUTING § The phase
// pipeline). The run board's survey table is the other half of that match,
// so where a table exists the tree says which routes it never named; the
// drift banner says the same, and this page is where the reader lands.

function Route({ node, survey, rowPaths }: { node: RouteNode; survey: SurveyRow[]; rowPaths: string[] }) {
  const covered = node.page ? routeCovered(node.path, rowPaths) : true;
  // A row's detail sits on the route it names; a descendant it covers by
  // prefix is covered silently — one row on the page, not one per route.
  const rows = node.page ? survey.filter((r) => r.paths.includes(node.path)) : [];
  // A static page links to itself. A dynamic one has no single address to
  // offer.
  const selfLink = node.page && !node.path.split("/").some((s) => s.startsWith("[")) ? node.path : null;
  return (
    <li className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-baseline gap-sm">
        {selfLink ? (
          <Link href={selfLink} className="sys-code underline underline-offset-2">
            {node.path}
          </Link>
        ) : (
          <code className={`sys-code${node.page || node.handler ? "" : " opacity-60"}`}>{node.path}</code>
        )}
        {node.dynamic && <span className="sys-pill">dynamic</span>}
        {node.handler && <span className="sys-pill">handler</span>}
        {node.page && survey.length > 0 && !covered && <span className="sys-pill sys-pill-stale">no survey row</span>}
        {rows.map((r) => (
          <span key={r.board + r.surface} className="text-2xs text-fg-tertiary">
            {r.surface}
            {r.cells
              .filter((c) => c.value)
              .map((c) => ` · ${c.header.toLowerCase()}: ${c.value}`)
              .join("")}
          </span>
        ))}
        {(node.page || node.handler) && (
          <span className="text-2xs text-fg-tertiary font-mono">{node.page ?? node.handler}</span>
        )}
      </div>
      {node.children.length > 0 && (
        <ul className="flex flex-col gap-sm border-l border-edge-light pl-md ml-xs">
          {node.children.map((c) => (
            <Route key={c.path} node={c} survey={survey} rowPaths={rowPaths} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function SitePage() {
  const site = getSiteMap();
  const survey = getSurveyRows();
  const rowPaths = survey.flatMap((r) => r.paths);
  const pages = site ? flattenRoutes(site).filter((n) => n.page) : [];
  const uncovered = survey.length > 0 ? pages.filter((n) => !routeCovered(n.path, rowPaths)).length : 0;
  // The aspirational map this tree is reconciled against: the open run
  // board's picture doc where a run is open, else the mold it is cut from.
  // The page names the term, so it links the thing — derived, both ways.
  const pictures = getActiveBoards().filter((b) => b.picture);
  const pictureHref = (rel: string) => `/system/docs/${rel}`;

  return (
    <>
      <PageIntro
        title="Site"
        count={site ? pages.length : undefined}
        blurb="The route tree as the code declares it — one entry per page file, dynamic segments shown as such. Never drawn by hand: a run's picture holds the map it is building toward, and this is the map that exists."
      />
      <p className="text-xs leading-relaxed text-fg-tertiary max-w-[60ch]">
        {pictures.length > 0 ? (
          <>
            The aspirational map is in{" "}
            {pictures.map((b, i) => (
              <span key={b.slug}>
                {i > 0 && ", "}
                <Link href={pictureHref(b.picture!)} className="underline underline-offset-2">
                  {b.picture}
                </Link>
              </span>
            ))}
            , the picture the run board links — the run&apos;s close reconciles it against this tree.
          </>
        ) : (
          <>
            A run&apos;s picture is <code className="sys-code">planning/&lt;run&gt;-picture.md</code>, linked from the
            run board&apos;s <code className="sys-code">Picture:</code> line and cut from{" "}
            <Link href={pictureHref("planning/_run-picture-template.md")} className="underline underline-offset-2">
              the picture mold
            </Link>
            . No run is open here, so there is none to reconcile.
          </>
        )}
      </p>

      {!site ? (
        <EmptyNote>
          No routes directory found — the map reads <code className="sys-code">app/</code> beside{" "}
          <code className="sys-code">docs/</code> (<code className="sys-code">ROUTES_DIR</code> in{" "}
          <code className="sys-code">lib/system.ts</code>).
        </EmptyNote>
      ) : pages.length === 0 ? (
        <EmptyNote>
          The routes directory holds no page files yet. The first <code className="sys-code">page.tsx</code> under
          it is the first entry here.
        </EmptyNote>
      ) : (
        <>
          {survey.length > 0 && (
            <InsetNote label="Against the survey">
              <p className="text-xs text-fg-secondary leading-relaxed">
                {uncovered === 0
                  ? `Every page route is named by a row of the run board's shown / launch / later table (${survey.length} rows).`
                  : `${uncovered} of ${pages.length} page routes have no row in the run board's shown / launch / later table (${survey.length} rows) — marked below. A row covers a route by naming its path in the Surface cell.`}
              </p>
            </InsetNote>
          )}
          <ul className="flex flex-col gap-sm">
            <Route node={site} survey={survey} rowPaths={rowPaths} />
          </ul>
        </>
      )}

      <p className="text-xs leading-relaxed text-fg-tertiary">
        Source: the routes directory{site ? "" : " (none found)"} — a folder is a segment, a{" "}
        <code className="sys-code">page</code> file is a page, a <code className="sys-code">route</code> file is a
        handler, <code className="sys-code">(groups)</code> add no segment. Read at build; the tree changes when the
        code does.
      </p>
    </>
  );
}
