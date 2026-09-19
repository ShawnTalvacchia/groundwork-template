import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveBoards,
  groupBoards,
  MODE_META,
  type ActivePhase,
  type BoardGroup,
} from "@/lib/system";
import { CrossingPills, DocProse, RunHeader, StagePill, WalkthroughCallout } from "../../ui";
import { slugParams } from "../../slug-params";

/* One board, on its own page — this is its home.
 *
 * Every open board used to stack into `/system/phase`. On a run of several
 * members that page ran to many screens, led by the run board in full, and
 * the only way to a member was a `#fragment` under all of it. A board is a
 * document someone reads; a page that concatenates every open document is an
 * index pretending to be one.
 *
 * So the index at `/phase` lists the boards and each board has a page. What
 * moved here is the board's whole chrome — the badge row, the walkthrough
 * callout, the section index and the body — and what a member gains is the one
 * thing the stack gave it for free: its run's header above it, as context.
 *
 * Heading ids are **unprefixed** here. The prefix existed because the page
 * stacked documents and `## Items` collided; one document per page cannot
 * collide, and unprefixed means a board's `#items` is the same address here as
 * in the docs viewer.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // The sentinel covers a project between boards — see `slug-params.ts` for
  // why an empty result prerenders the route for nothing at all.
  return slugParams(getActiveBoards().map((b) => b.slug));
}

/** The run a board belongs to, when it belongs to one — the group the parser
 *  already made, found by the board rather than rebuilt around it. */
function runOf(groups: BoardGroup[], board: ActivePhase): BoardGroup | null {
  if (!board.run) return null;
  return (
    groups.find(
      (g) => g.run === board.run && (g.runBoard?.slug === board.slug || g.boards.some((b) => b.slug === board.slug))
    ) ?? null
  );
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boards = getActiveBoards();
  const board = boards.find((b) => b.slug === slug);
  if (!board) notFound();

  const group = runOf(groupBoards(boards), board);
  const isRunBoard = group?.runBoard?.slug === board.slug;

  return (
    <>
      {/* A member's context: which run it belongs to and where that run
          stands. The name is plain text on the run board's own page — text
          that changes on hover without going anywhere reads as a dead link. */}
      {group && (
        <RunHeader
          group={group}
          href={!isRunBoard && group.runBoard ? `/system/phase/${group.runBoard.slug}` : undefined}
        />
      )}

      <section className="flex flex-col gap-md">
        <div className="flex items-center gap-sm flex-wrap">
          <span className="sys-pill">{MODE_META[board.mode].label}</span>
          {/* What the board carries across the project's boundary — derived
              from its Upgrade and Exports lines, beside the mode because it
              tunes the mode's rituals. */}
          <CrossingPills board={board} />
          {/* The board's place in its phase, from the fields it declares: the
              stage it sits at, and whether a session is working it. Shared
              with the tiles (`StagePill`) rather than restated here — the
              skin is a claim about the board, and a second surface may not
              spell it differently. */}
          <StagePill board={board} />
          <span className="text-2xs uppercase tracking-wide text-fg-tertiary">{board.status}</span>
          <span className="text-xs text-fg-tertiary tabular-nums">
            {board.done}/{board.total} tasks
          </span>
        </div>
        {/* The page's main action, below the row rather than at the end of it. */}
        <WalkthroughCallout board={board} />
        <article className="sys-doc">
          <DocProse body={board.body} docDir="phases" />
        </article>
      </section>

      {/* The file stays reachable as a file: a board is a doc like any other,
          and the doc route renders it as one. */}
      <p className="text-xs leading-relaxed text-fg-tertiary">
        <Link href={`/system/docs/phases/${board.slug}.md`} className="underline underline-offset-2">
          the file
        </Link>
      </p>
    </>
  );
}
