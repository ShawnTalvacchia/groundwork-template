import Link from "next/link";
import {
  getActiveBoards,
  getFutureItems,
  getOpenQuestions,
  getPunchItems,
  getQueuedSeeds,
  getRoadmap,
  groupBoards,
} from "@/lib/system";
import { GROUPS } from "../nav-model";
import { BoardCards, QueueShelf, Tile } from "../ui";

const group = GROUPS.find((g) => g.slug === "work")!;

export default function WorkPage() {
  const groups = groupBoards(getActiveBoards());
  const roadmap = getRoadmap();
  const questions = getOpenQuestions();
  const openItems = questions.reduce((n, t) => n + t.questions.length, 0);
  const punch = getPunchItems();
  const future = getFutureItems();
  const seeds = getQueuedSeeds();
  const queue = roadmap.phases.map((p) => {
    const seed = seeds.find((s) => s.phase === p.name);
    return { name: p.name, mode: seed?.mode ?? null, seedPath: seed?.relPath ?? null, run: seed?.run ?? null };
  });
  const blurb = (slug: string) => group.pages.find((p) => p.slug === slug)?.blurb ?? "";

  return (
    <>
      <header className="flex flex-col gap-sm">
        <h1 className="text-2xl font-semibold text-fg-primary">Work</h1>
        <p className="text-sm leading-relaxed text-fg-secondary max-w-[64ch]">
          What&apos;s being done and what&apos;s waiting. Every phase opens a board and runs one{" "}
          <Link href="/system/method" className="font-semibold underline underline-offset-2">
            mode
          </Link>{" "}
          with its rituals; the trackers below hold candidates not on a board yet.
        </p>
      </header>

      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">Open boards</h2>
        {/* Same shape as the hub: every open board — the active one per mode
            standing, a run grouped under its run board — then the queue
            itself rather than a tile counting it. */}
        <BoardCards groups={groups} />
        <QueueShelf items={queue} />
      </section>

      <section className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">The trackers</h2>
          <p className="text-xs leading-relaxed text-fg-tertiary">
            Where candidates wait between phases. How they work:{" "}
            <Link href="/system/trackers" className="underline underline-offset-2">
              Method → Trackers
            </Link>
          </p>
        </div>
        {/* Three peers — fill the row rather than auto-fill and leave a gap. */}
        <div className="grid gap-md sm:grid-cols-3">
          <Tile href="/system/questions" label="Questions" value={openItems} detail={blurb("questions")} />
          <Tile href="/system/punch-list" label="Punch list" value={punch.length} detail={blurb("punch-list")} />
          <Tile href="/system/future" label="Future" value={future.length} detail={blurb("future")} />
        </div>
      </section>
    </>
  );
}
