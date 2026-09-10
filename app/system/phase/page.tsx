import Link from "next/link";
import { getActiveBoards, getRoadmap, groupBoards, MODE_META, type ActivePhase } from "@/lib/system";
import { MdInline, PageIntro, DocProse, RunHeader } from "../ui";

// The board in full — this IS its home. Work owns it; it isn't a summary
// pointing at a doc page. (The breadcrumb row is the way back out.)

/** The walkthrough, where the PO's O and V items live.
 *
 *  A button because the board is long and the O items are not on it: a
 *  tertiary text link here was missed in use.
 *  Asking nothing, it stops being a button: the counts are the whole reason
 *  for the emphasis, so at zero the loudest control on the row would be
 *  advertising that it wants nothing, beside boards that do. It keeps the href
 *  and the row-end position — an open board's walkthrough still holds the
 *  Decisions log the close reads, and the geometry staying put is what lets a
 *  reader scan several boards at once — and drops to the weight the link had
 *  before it earned the box. */
function WalkthroughLink({ board }: { board: ActivePhase }) {
  const w = board.walkthrough;
  if (!w) return null;
  const asks = w.calls + w.checks > 0;
  return (
    <Link
      href={`/system/docs/phases/${board.slug}-walkthrough.md`}
      className={asks ? "sys-button" : "text-xs text-fg-tertiary underline underline-offset-2"}
    >
      {asks ? (
        <>
          Walkthrough
          <span className="font-normal tabular-nums">
            {" · "}
            {w.calls} {w.calls === 1 ? "call" : "calls"} · {w.checks} {w.checks === 1 ? "check" : "checks"}
          </span>
          {" →"}
        </>
      ) : (
        <>
          {/* `walked` is what makes this sentence worth writing: a walkthrough
              that passed nine checks says so, one that never asked anything
              says only its own name. */}
          walkthrough
          {w.walked > 0 && (
            <span className="tabular-nums">
              {" · walked ("}
              {w.walked} {w.walked === 1 ? "check" : "checks"}
              {")"}
            </span>
          )}
          {" →"}
        </>
      )}
    </Link>
  );
}

/** One board, in full, under its own badge row.
 *
 *  The `id` is what the Active Board tiles on the hub and Work link to:
 *  without it every tile landed at the top of the page, so with two boards
 *  open a card naming one of them scrolled the reader to the other.
 *
 *  No `run ·` clause: a board that declares a run is always rendered inside
 *  its run's group, whose header already names it (`groupBoards`). Restating
 *  it here is the same second-surface duplication this page's run rendering
 *  exists to remove. */
function BoardSection({ board, separated }: { board: ActivePhase; separated: boolean }) {
  return (
    <section
      id={board.slug}
      className={`sys-board-anchor flex flex-col gap-md${separated ? " border-t border-edge-light pt-lg" : ""}`}
    >
      <div className="flex items-center gap-sm flex-wrap">
        <span className="sys-pill">{MODE_META[board.mode].label}</span>
        {/* The board's place in its phase, from the fields it declares: the
            stage it sits at, and whether a session is working it. Brand on the
            active board's stage, the same mark the hub's cards carry. */}
        {board.stage && (
          <span className={`sys-pill${board.status === "active" ? " sys-pill-active" : ""}`}>
            {board.stage.replace(/-/g, " ")}
          </span>
        )}
        <span className="text-2xs uppercase tracking-wide text-fg-tertiary">{board.status}</span>
        <span className="text-xs text-fg-tertiary tabular-nums">
          {board.done}/{board.total} tasks
        </span>
        <span className="ml-auto">
          <WalkthroughLink board={board} />
        </span>
      </div>
      <article className="sys-doc">
        <DocProse body={board.body} docDir="phases" />
      </article>
    </section>
  );
}

export default function ActiveBoardPage() {
  // The groups the parser made, rendered as groups — not flattened into a
  // stack of peers. A run is a shelf headed by its run board on Overview and
  // Work, and this page said otherwise: it printed the run board as a full
  // peer section with a `done/total tasks` count that is not the run's
  // progress.
  const groups = groupBoards(getActiveBoards());
  const roadmap = getRoadmap();
  const open = groups.reduce((n, g) => n + g.boards.length + (g.runBoard ? 1 : 0), 0);

  if (open === 0) {
    return (
      <>
        <PageIntro
          title="Between boards"
          blurb="No board is open. A phase opens one and closes it in the same arc — the queue below is buildable in any order."
        />
        <div className="flex flex-col gap-md">
          {roadmap.phases.map((p, i) => (
            <div key={p.name} className="sys-card flex flex-col gap-sm">
              <div className="flex items-baseline gap-sm">
                <span className="sys-id">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-semibold text-fg-primary">{p.name}</span>
                {p.phaseStatus && (
                  <span className="text-2xs uppercase tracking-wide text-fg-tertiary">{p.phaseStatus}</span>
                )}
              </div>
              <p className="text-xs text-fg-secondary leading-snug">
                <MdInline text={p.goal} />
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-fg-tertiary">
          Where the project stands:{" "}
          <Link href="/system/roadmap" className="underline underline-offset-2">
            Roadmap
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      {groups.map((g, i) => {
        const separated = i > 0;
        if (!g.run) {
          return <BoardSection key={g.boards[0].slug} board={g.boards[0]} separated={separated} />;
        }
        return (
          /* A run, as its spine and what hangs off it: the header the shelf
             uses, the run board's own body beneath it — this page is still
             every board's home — then the members. */
          <div
            key={`${g.mode}:${g.run}`}
            className={`flex flex-col gap-lg${separated ? " border-t border-edge-light pt-xl" : ""}`}
          >
            <section id={g.runBoard?.slug} className="sys-board-anchor flex flex-col gap-md">
              <RunHeader
                group={g}
                trailing={g.runBoard ? <WalkthroughLink board={g.runBoard} /> : null}
              />
              {g.runBoard && (
                <article className="sys-doc">
                  <DocProse body={g.runBoard.body} docDir="phases" />
                </article>
              )}
            </section>
            {g.boards.map((b) => (
              <BoardSection key={b.slug} board={b} separated />
            ))}
          </div>
        );
      })}
    </>
  );
}
