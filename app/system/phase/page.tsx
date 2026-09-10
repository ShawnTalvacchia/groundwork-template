import Link from "next/link";
import { getActiveBoards, getRoadmap, groupBoards, MODE_META } from "@/lib/system";
import { MdInline, PageIntro, DocProse } from "../ui";

// The board in full — this IS its home. Work owns it; it isn't a summary
// pointing at a doc page. (The breadcrumb row is the way back out.)

export default function ActiveBoardPage() {
  // The same order the hub's cards show: by mode, a run's boards together
  // with the run board leading, the active board first among a run's
  // members — so a reader arriving from a card meets the boards in the
  // order they were listed.
  const boards = groupBoards(getActiveBoards()).flatMap((g) =>
    g.runBoard ? [g.runBoard, ...g.boards] : g.boards,
  );
  const roadmap = getRoadmap();

  if (boards.length === 0) {
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
      {boards.map((board, i) => {
        return (
          /* Every open board renders here, stacked. The `id` is what the
             Active Board tiles on the hub and Work link to: without it every
             tile landed at the top of the page, so with two boards open a card
             naming one of them scrolled the reader to the other. */
          <section
            key={board.slug}
            id={board.slug}
            className={`sys-board-anchor flex flex-col gap-md${i > 0 ? " border-t border-edge-light pt-xl" : ""}`}
          >
            <div className="flex items-center gap-sm flex-wrap">
              <span className="sys-pill">{MODE_META[board.mode].label}</span>
              {/* The board's place in its phase, from the fields it declares:
                  the stage it sits at, whether a session is working it, and
                  the run it belongs to. Brand on the active board's stage,
                  the same mark the hub's cards carry. */}
              {board.stage && (
                <span className={`sys-pill${board.status === "active" ? " sys-pill-active" : ""}`}>
                  {board.stage.replace(/-/g, " ")}
                </span>
              )}
              <span className="text-2xs uppercase tracking-wide text-fg-tertiary">{board.status}</span>
              {board.run && <span className="text-xs text-fg-tertiary">run · {board.run}</span>}
              <span className="text-xs text-fg-tertiary tabular-nums">
                {board.done}/{board.total} tasks
              </span>
              {/* The walkthrough is where the PO's O and V items live, and
                  the board is long — a tertiary text link here was missed in
                  use (2026-09-10). A button, pushed to the row's end,
                  carrying what it still asks.
                  Asking nothing, it stops being a button (2026-09-10): the
                  counts are the whole reason for the emphasis, so at zero the
                  loudest control on the row would be advertising that it
                  wants nothing, beside boards that do. It keeps the href and
                  the row-end position — an open board's walkthrough still
                  holds the Decisions log the close reads, and the geometry
                  staying put is what lets a reader scan several boards at
                  once — and drops to the weight the link had before it
                  earned the box. */}
              {board.walkthrough && (
                <Link
                  href={`/system/docs/phases/${board.slug}-walkthrough.md`}
                  className={
                    board.walkthrough.calls + board.walkthrough.checks > 0
                      ? "sys-button ml-auto"
                      : "ml-auto text-xs text-fg-tertiary underline underline-offset-2"
                  }
                >
                  {board.walkthrough.calls + board.walkthrough.checks > 0 ? (
                    <>
                      Walkthrough
                      <span className="font-normal text-fg-tertiary tabular-nums">
                        {" · "}
                        {board.walkthrough.calls} {board.walkthrough.calls === 1 ? "call" : "calls"} ·{" "}
                        {board.walkthrough.checks} {board.walkthrough.checks === 1 ? "check" : "checks"}
                      </span>
                      {" →"}
                    </>
                  ) : (
                    <>
                      {/* `walked` is what makes this sentence worth writing:
                          a walkthrough that passed nine checks says so, one
                          that never asked anything says only its own name. */}
                      walkthrough
                      {board.walkthrough.walked > 0 && (
                        <span className="tabular-nums">
                          {" · walked ("}
                          {board.walkthrough.walked}{" "}
                          {board.walkthrough.walked === 1 ? "check" : "checks"}
                          {")"}
                        </span>
                      )}
                      {" →"}
                    </>
                  )}
                </Link>
              )}
            </div>
            <article className="sys-doc">
              <DocProse body={board.body} docDir="phases" />
            </article>
          </section>
        );
      })}
    </>
  );
}
