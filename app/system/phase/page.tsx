import Link from "next/link";
import { getActiveBoards, getRoadmap, glossaryLede, groupBoards, MODE_META, type ActivePhase } from "@/lib/system";
import { MdInline, PageIntro, DocProse, RunHeader, WalkthroughCallout } from "../ui";

// The board in full — this IS its home. Work owns it; it isn't a summary
// pointing at a doc page. (The breadcrumb row is the way back out.)

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
function BoardSection({ board, separated, lede }: { board: ActivePhase; separated: boolean; lede: string | null }) {
  return (
    <section
      id={board.slug}
      className={`flex flex-col gap-md${separated ? " border-t border-edge-light pt-lg" : ""}`}
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
      </div>
      {/* The page's main action, below the row rather than at the end of it —
          the row is four labels wide and sits above a board of several screens,
          and a run stacks those. */}
      <WalkthroughCallout board={board} lede={lede} />
      <article className="sys-doc">
        {/* `idPrefix` is the board's own slug: this page stacks every open
            board into one document, so unprefixed heading ids collided —
            two boards with `## Items` emitted two `id="items"` and the
            section index of the second linked into the first. */}
        <DocProse body={board.body} docDir="phases" idPrefix={board.slug} />
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
  // The callout's lede is the canon's own Glossary entry, read once for the
  // page: every board's card says the same thing because it is the same
  // definition, not because a literal was copied.
  const lede = glossaryLede("Walkthrough");
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
          return <BoardSection key={g.boards[0].slug} board={g.boards[0]} separated={separated} lede={lede} />;
        }
        return (
          /* A run, as its spine and what hangs off it: the header the shelf
             uses, the run board's own body beneath it — this page is still
             every board's home — then the members. */
          <div
            key={`${g.mode}:${g.run}`}
            className={`flex flex-col gap-lg${separated ? " border-t border-edge-light pt-xl" : ""}`}
          >
            <section id={g.runBoard?.slug} className="flex flex-col gap-md">
              <RunHeader group={g} />
              {/* The run board's own callout, scoped to the spine the way each
                  member's is scoped to its board — so a run reads as a stack of
                  boards each stating its own ask, not one row of controls. */}
              {g.runBoard && <WalkthroughCallout board={g.runBoard} lede={lede} />}
              {g.runBoard && (
                <article className="sys-doc">
                  <DocProse body={g.runBoard.body} docDir="phases" idPrefix={g.runBoard.slug} />
                </article>
              )}
            </section>
            {g.boards.map((b) => (
              <BoardSection key={b.slug} board={b} separated lede={lede} />
            ))}
          </div>
        );
      })}
    </>
  );
}
