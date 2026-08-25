import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getActiveBoards, getRoadmap, MODE_META } from "@/lib/system";
import { MdInline, PageIntro } from "../ui";

// The board in full — this IS its home. Work owns it; it isn't a summary
// pointing at a doc page. (The breadcrumb row is the way back out.)

export default function ActiveBoardPage() {
  const boards = getActiveBoards();
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
          The compass:{" "}
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
          <section
            key={board.slug}
            className={`flex flex-col gap-md${i > 0 ? " border-t border-edge-light pt-xl" : ""}`}
          >
            <div className="flex items-center gap-sm flex-wrap">
              <span className="sys-pill">{MODE_META[board.mode].label}</span>
              <span className="text-xs text-fg-tertiary tabular-nums">
                {board.done}/{board.total} tasks
              </span>
              {board.hasWalkthrough && (
                <Link
                  href={`/system/docs/phases/${board.slug}-walkthrough.md`}
                  className="text-xs text-fg-tertiary underline underline-offset-2"
                >
                  walkthrough →
                </Link>
              )}
            </div>
            <article className="sys-doc">
              <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{board.body}</ReactMarkdown>
            </article>
          </section>
        );
      })}
    </>
  );
}
