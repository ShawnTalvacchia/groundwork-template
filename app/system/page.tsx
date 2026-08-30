import Link from "next/link";
import { BookOpenText, Hammer, TreeStructure } from "@phosphor-icons/react/dist/ssr";
import {
  boardName,
  getActiveBoards,
  getAllDocs,
  getArchivedPhases,
  getDecisions,
  getFutureItems,
  getGlossary,
  getOpenQuestions,
  getPunchItems,
  getQueuedSeeds,
  getRoadmap,
  getTrackerModel,
  getWorkModel,
  TIER_ORDER,
} from "@/lib/system";
import { Mark } from "@/components/ui/Mark";
import { QueueShelf, StartersStrip, Tile } from "./ui";

function Cluster({
  title,
  href,
  icon,
  purpose,
  children,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
  purpose: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <Link href={href} className="flex items-center gap-sm no-underline">
          <span className="text-fg-tertiary">{icon}</span>
          <h2 className="text-xl font-semibold text-fg-primary">{title}</h2>
        </Link>
        <p className="text-sm text-fg-tertiary">{purpose}</p>
      </div>
      {children}
    </section>
  );
}

export default function SystemOverview() {
  const docs = getAllDocs();
  const questions = getOpenQuestions();
  const punch = getPunchItems();
  const future = getFutureItems();
  const decisions = getDecisions();
  const roadmap = getRoadmap();
  const boards = getActiveBoards();
  const archived = getArchivedPhases();
  const glossary = getGlossary();
  const { modes, starters } = getWorkModel();
  const { trackers } = getTrackerModel();

  const openItems = questions.reduce((n, t) => n + t.questions.length, 0);
  // The queue, joined to its seeds — the card links to the seed, same as the
  // roadmap page's. A row whose seed is missing links nowhere on purpose.
  const seeds = getQueuedSeeds();
  const queue = roadmap.phases.map((p) => {
    const seed = seeds.find((s) => s.phase === p.name);
    return { name: p.name, mode: seed?.mode ?? null, seedPath: seed?.relPath ?? null };
  });
  const features = docs.filter((d) => d.featureStatus);
  const strategyDocs = docs.filter((d) => d.dir === "strategy");
  const tierCounts = TIER_ORDER.map((t) => `${docs.filter((d) => d.tier === t).length} ${t}`).join(" · ");

  // The welcome band is DERIVED: it renders from the kickoff board's
  // existence and vanishes forever when that board is distilled + deleted.
  // No checklist item removes it; the system's own law does.
  const kickoffOpen = boards.some((b) => b.slug === "kickoff");

  return (
    <>
      {kickoffOpen && (
        <div className="flex flex-col gap-xs rounded-panel border border-brand-light bg-brand-subtle px-lg py-md">
          {/* The mark, not a bare ◆ character. This banner is the first thing a
              fresh copy shows on its own dashboard, one screen from the kickoff
              step that tells you to make the mark yours — so it has to be the
              mark that step edits. Swap Mark.tsx and this follows. */}
          <p className="flex items-center gap-xs text-sm font-semibold text-fg-primary">
            <Mark size={14} />
            Fresh template: not yet kicked off.
          </p>
          <p className="text-xs text-fg-secondary max-w-[72ch]">
            The Kickoff board below is the one-time bootstrap. Your guide is{" "}
            <code className="sys-code">KICKOFF.md</code> at the repo root. This banner derives from
            that board&apos;s existence and disappears when the kickoff closes.
          </p>
        </div>
      )}

      <p className="text-sm text-fg-secondary max-w-[64ch]">
        The work, the strategy, and the rules — rendered from <code className="sys-code">docs/</code>{" "}
        on every commit.
      </p>

      <Cluster
        title="Work"
        href="/system/work"
        icon={<Hammer size={20} weight="light" />}
        purpose="What's moving — the active board and the queues that feed it."
      >
        {/* The front door, folded shut: a new session's first question is
            "what is this session?", so it sits above the board it would open.
            Collapsed by default — one line until someone is actually asking. */}
        <StartersStrip starters={starters} />
        {/* The board comes first and takes the full width — it is the answer to
            "what is happening right now", and it used to share a row with a tile
            whose whole content was a count. The queue shelf below replaced that
            tile with the rows it was counting. */}
        <div className={`grid gap-md ${boards.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {boards.length === 0 ? (
            <Tile
              href="/system/phase"
              label="Active board"
              value="Between boards"
              detail="no phase open — the queue below is what's next"
            />
          ) : (
            boards.map((b) => (
              <Tile
                key={b.slug}
                href={`/system/phase#${b.slug}`}
                label={`Active board · ${modes.find((m) => m.key === b.mode)?.label ?? b.mode}`}
                value={boardName(b.title)}
                detail={`${b.done}/${b.total} tasks`}
              />
            ))
          )}
        </div>
        <QueueShelf items={queue} />
        {/* The trackers — three peers, fill the row rather than auto-fill and
            leave a gap. */}
        <div className="grid gap-md sm:grid-cols-3">
          <Tile
            href="/system/questions"
            label="Open questions"
            value={openItems}
            detail={`across ${questions.length} topics (§)`}
          />
          <Tile href="/system/punch-list" label="Punch list" value={punch.length} detail="small fixes waiting" />
          <Tile href="/system/future" label="Future" value={future.length} detail="parked until a trigger fires" />
        </div>
      </Cluster>

      <Cluster
        title="Structure"
        href="/system/structure"
        icon={<TreeStructure size={20} weight="light" />}
        purpose="What the project is made of — features, strategy, the docs, the shipped record."
      >
        {/* What it's made of — current state. */}
        <div className="grid gap-md sm:grid-cols-3">
          <Tile
            href="/system/features"
            label="Features"
            value={features.length}
            detail={`${features.filter((d) => d.featureKind !== "demo").length} product · ${features.filter((d) => d.featureKind === "demo").length} demo layer`}
          />
          <Tile
            href="/system/strategy"
            label="Strategy"
            value={strategyDocs.length}
            detail="models · drafts · kits · research"
          />
          <Tile href="/system/docs" label="Docs" value={docs.length} detail={tierCounts} />
        </div>
        {/* The shipped record — history. */}
        <div className="grid gap-md sm:grid-cols-2">
          <Tile href="/system/timeline" label="Timeline" value={archived.length} detail="closed phases on record" />
          <Tile
            href="/system/decisions"
            label="Decisions"
            value={decisions.length}
            detail={`logged · latest ${decisions[0]?.date ?? "—"}`}
          />
        </div>
      </Cluster>

      <Cluster
        title="Method"
        href="/system/method"
        icon={<BookOpenText size={20} weight="light" />}
        purpose="How we work — the modes and rituals every phase runs by."
      >
        <div className="sys-tile-grid">
          <Tile href="/system/method" label="How we work" value={modes.length} detail="modes · each with its rituals" />
          <Tile href="/system/trackers" label="Trackers" value={trackers.length} detail="lists that feed the boards" />
          <Tile href="/system/tiers" label="Tiers" value={4} detail="review cadences · sinking · challenge" />
          <Tile href="/system/glossary" label="Glossary" value={glossary.length} detail="terms, defined once" />
        </div>
      </Cluster>

    </>
  );
}
