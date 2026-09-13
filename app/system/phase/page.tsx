import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveBoards, getRoadmap, groupBoards } from "@/lib/system";
import { MdInline, PageIntro, BoardCards } from "../ui";

/* The open boards, as an index — one entry per board, each linking to the
 * board's own page.
 *
 * It used to render every board in full, stacked into one document: a run of
 * several members ran to many screens, and a card naming a member landed its
 * reader on a `#fragment` buried under the run board's whole body. A board is
 * a document, so a board gets a page; this is the way in to them.
 *
 * **It is `BoardCards`, not a second drawing of the same boards.** The order of
 * a group and the shape of one are claims the parser already makes, and a
 * second surface may not restate them differently — which is exactly the
 * divergence this page used to be. So the hub, Work and this page render the
 * same component over the same groups, and what this page adds is the frame:
 * the title, and the queue when nothing is open.
 *
 * **With one board open it is not a page at all — it redirects to that board.**
 * The common case is one open board, and an index of one card is a click that
 * carries no information: the URL means "the active board," and when there is
 * exactly one, that is a specific board. The index appears when there is
 * something to choose between — a run, or two modes open at once. Derived like
 * everything else here: the board count decides, nothing declares it. This is
 * why a board page's breadcrumb goes to Work rather than here (`nav.tsx`) —
 * pointing it back at this route would redirect the reader to the board they
 * just left.
 */

export default function ActiveBoardPage() {
  const boards = getActiveBoards();
  const groups = groupBoards(boards);
  const roadmap = getRoadmap();
  const open = boards.length;

  if (open === 1) redirect(`/system/phase/${boards[0].slug}`);

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
              <p className="text-xs text-fg-secondary leading-relaxed">
                <MdInline text={p.goal} />
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-fg-tertiary">
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
      <PageIntro
        title="Open boards"
        count={open}
        blurb="Every phase currently open, in the order the parser reads them: by mode, the one being worked first. Each board opens on its own page."
      />
      <BoardCards groups={groups} />
    </>
  );
}
