import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { ActivePhase, BoardGroup, BoardMode, Tier } from "@/lib/system";
import { boardName, MODE_KINDS, MODE_META, TIER_META, headingSlug, stripMd } from "@/lib/system";
import type { DriftAlarm } from "@/lib/derivation";

/* Shared server-side UI for /system. Presentation only — no content. */

/** The surface self-reporting parser drift (lib/derivation.ts). Rendered by
 *  the layout on every /system page; absent when every invariant holds, so
 *  its mere presence is the alarm. */
export function DriftBanner({ alarms }: { alarms: DriftAlarm[] }) {
  if (alarms.length === 0) return null;
  return (
    <div className="flex flex-col gap-sm rounded-panel border border-warning bg-warning-light px-lg py-md">
      <p className="text-sm font-semibold text-fg-primary">
        Derivation drift — {alarms.length} parser invariant{alarms.length === 1 ? "" : "s"} failing
      </p>
      <p className="text-xs text-fg-secondary max-w-[72ch]">
        A parsed doc&apos;s format no longer matches what its parser expects, so a page below is rendering
        empty or partial. Fix the doc to spec — formats never bend to the parsers. See{" "}
        <Link href="/system/docs/implementation/system-surface.md" className="underline underline-offset-2">
          system-surface.md → Drift alarms
        </Link>
        .
      </p>
      <ul className="flex flex-col gap-xs">
        {alarms.map((a, i) => (
          <li key={i} className="text-2xs font-mono text-fg-secondary">
            {a.parser} · {a.source} — {a.problem}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageIntro({ title, count, blurb }: { title: string; count?: number; blurb: string }) {
  return (
    <header className="flex flex-col gap-sm">
      <h1 className="text-2xl font-semibold text-fg-primary">
        {title}
        {count !== undefined && <span className="ml-sm text-lg font-normal text-fg-tertiary">{count}</span>}
      </h1>
      <p className="text-sm text-fg-secondary max-w-[60ch]">{blurb}</p>
    </header>
  );
}

/** What a heading renders instead of nothing when its source doc is empty.
 *
 *  Every tracker and log on this dashboard ships empty, so a new project meets
 *  five of these before it meets a single row — and a heading with a void under
 *  it reads as a broken page, not as an empty one. The message always says two
 *  things: what is absent, and what puts something here. Emptiness is a state
 *  the record is allowed to be in; the page has to say so out loud. */
export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-xs text-fg-tertiary">{children}</p>;
}

export function Tile({
  href,
  label,
  value,
  detail,
  pill,
  muted,
}: {
  href: string;
  label: string;
  value: ReactNode;
  detail?: string;
  /** Opt-in slot on the label row — a freshness pill, a badge. Added for the
   *  briefing tile, whose whole job is to prompt a review, and the amber
   *  StalePill is the only thing on the surface that ever asks for one. */
  pill?: ReactNode;
  /** Sets the tile back a step (`.sys-tile-waiting`) — a waiting board
   *  beside the active one. Muted, never disabled: still a link. */
  muted?: boolean;
}) {
  // Numbers get the big stat treatment; text values sit a step smaller.
  const valueSize = typeof value === "number" ? "text-2xl" : "text-lg";
  return (
    <Link href={href} className={`sys-tile${muted ? " sys-tile-waiting" : ""}`}>
      <span className="flex items-baseline justify-between gap-md">
        <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{label}</span>
        {pill}
      </span>
      <span
        className={`${valueSize} font-semibold text-fg-primary leading-tight truncate`}
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
      {detail && <span className="text-xs text-fg-tertiary leading-snug">{detail}</span>}
    </Link>
  );
}

/** The hub's front door, folded away: a collapsed shelf naming the session
 *  starters, each row a collapsed card that expands to what you'd actually
 *  say or do. The method page holds the full table; the header link is the
 *  only route there — rows expand in place rather than navigate. */
export function StartersStrip({
  starters,
}: {
  starters: { arriving: string; shape: string; mode: string; prompt: string; openBy: string }[];
}) {
  if (starters.length === 0) return null;
  return (
    <details className="sys-starters">
      <summary className="flex items-baseline justify-between gap-md">
        <span className="flex items-baseline gap-sm text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
          <span className="sys-caret" aria-hidden>
            ›
          </span>
          Starting a session
          <span className="font-normal normal-case tracking-normal">match what you&apos;re holding to a shape</span>
        </span>
        <Link href="/system/method" className="text-xs text-fg-secondary underline underline-offset-2">
          How we work →
        </Link>
      </summary>
      <div className="sys-starters-body flex flex-col">
        <StarterRows starters={starters} />
      </div>
    </details>
  );
}

/** The starter rows themselves — one collapsed card per arrival, expanding to
 *  the prompt you'd type. Shared by the hub's shelf (inside `.sys-starters`)
 *  and the method page (inside a plain `.sys-starters > .sys-starters-body`
 *  card without the shelf summary), so the two surfaces stay one markup. */
export function StarterRows({
  starters,
}: {
  starters: { arriving: string; shape: string; mode: string; prompt: string; openBy: string }[];
}) {
  return (
    <>
      {starters.map((s) => (
        <details key={s.arriving} className="sys-details">
          {/* md: a fixed arrival column so every arrow sits on the same
              line; small screens fall back to wrapping flex. */}
          <summary className="flex flex-wrap items-baseline gap-sm md:grid md:grid-cols-[minmax(0,22rem)_auto_1fr]">
            <span className="flex items-baseline gap-sm text-xs text-fg-secondary leading-snug">
              <span className="sys-caret" aria-hidden>
                ›
              </span>
              {s.arriving}
            </span>
            <span aria-hidden className="text-fg-light">
              →
            </span>
            {/* Shape as a pill, mode beside it — the pairing both surfaces
                use, so a session is named identically everywhere. */}
            <span className="flex items-baseline gap-sm">
              <span className="sys-pill">{s.shape}</span>
              <span className="text-2xs uppercase tracking-wide text-fg-tertiary">
                <MdInline text={s.mode} />
              </span>
            </span>
          </summary>
          <div className="flex flex-col gap-xs pb-md pl-lg max-w-[72ch]">
            <p className="text-xs italic text-fg-primary leading-snug">
              <MdInline text={s.prompt} />
            </p>
            <p className="text-xs text-fg-secondary leading-snug">
              <MdInline text={s.openBy} />
            </p>
          </div>
        </details>
      ))}
    </>
  );
}

/** The stage a board sits at, as its label — the kind's name with the
 *  hyphen the frontmatter needs read back out ("basic-layer" → "basic layer").
 *  The active board's pill carries the brand. */
function StagePill({ board }: { board: ActivePhase }) {
  if (!board.stage) return null;
  return (
    <span className={`sys-pill${board.status === "active" ? " sys-pill-active" : ""}`}>
      {board.stage.replace(/-/g, " ")}
    </span>
  );
}

/** A tile's second line: the tasks, and what the walkthrough still wants.
 *  A walkthrough asking nothing drops the clause rather than printing a pair
 *  of zeros — the card is a summary, and a summary that reports absence
 *  costs the same glance as one that reports work. Its link is still on the
 *  board's own page, at tertiary weight, which is where reachable belongs. */
function boardDetail(board: ActivePhase): string {
  const tasks = `${board.done}/${board.total} tasks`;
  const w = board.walkthrough;
  if (!w) return tasks;
  if (w.calls + w.checks > 0)
    return `${tasks} · walkthrough: ${w.calls} to call, ${w.checks} to check`;
  return w.walked > 0 ? `${tasks} · walkthrough: walked` : tasks;
}

function BoardTile({ board }: { board: ActivePhase }) {
  const active = board.status === "active";
  return (
    <Tile
      href={`/system/phase#${board.slug}`}
      label={`${active ? "Active" : "Waiting"} · ${MODE_META[board.mode].label}`}
      value={boardName(board.title)}
      detail={boardDetail(board)}
      pill={<StagePill board={board} />}
      muted={!active}
    />
  );
}

/** The open boards, as the hub and Work show them: every board, the active
 *  one per mode standing and the waiting ones set back, a run's members
 *  grouped in a shelf headed by the run board with their stage as the label
 *  (`groupBoards`).
 *  One tile when nothing is open — "between boards" is a state the record
 *  is allowed to be in, and the tile says what fills it. */
export function BoardCards({ groups }: { groups: BoardGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="grid gap-md">
        <Tile
          href="/system/phase"
          label="Active board"
          value="Between boards"
          detail="no phase open — the queue below is what's next"
        />
      </div>
    );
  }
  // Groups render in `groupBoards`' order and nothing re-partitions them.
  // Splitting standalone boards from runs and drawing all the tiles first
  // discarded the mode order the parser had just established: on a project
  // with a product run and an active system board, Work led with the system
  // board while /system/phase led with the run, so a reader arriving from a
  // card met the boards in a different order than the card listed them.
  // Consecutive standalone groups still share one grid so two small tiles sit
  // side by side; a run breaks the run of tiles, and the next tile starts a
  // new grid.
  const rows: ({ kind: "tiles"; groups: BoardGroup[] } | { kind: "run"; group: BoardGroup })[] = [];
  for (const g of groups) {
    if (g.run) {
      rows.push({ kind: "run", group: g });
      continue;
    }
    const last = rows[rows.length - 1];
    if (last?.kind === "tiles") last.groups.push(g);
    else rows.push({ kind: "tiles", groups: [g] });
  }
  return (
    <div className="flex flex-col gap-md">
      {rows.map((row) =>
        row.kind === "tiles" ? (
          <div
            key={`tiles:${row.groups[0].boards[0].slug}`}
            className={`grid gap-md ${row.groups.length > 1 ? "sm:grid-cols-2" : ""}`}
          >
            {row.groups.map((g) => (
              <BoardTile key={g.boards[0].slug} board={g.boards[0]} />
            ))}
          </div>
        ) : (
          <RunShelf key={`${row.group.mode}:${row.group.run}`} group={row.group} />
        )
      )}
    </div>
  );
}

/** A run's header row — the run board as the spine of its members.
 *
 *  Shared by the shelf on Overview and Work and by the run's section on
 *  /system/phase, because the shape of a board is the same class of claim as
 *  the order of one, and a second surface may not restate it differently.
 *  /system/phase rendered the run board as a full peer section until this was
 *  extracted, so the same run read as a shelf on two surfaces and as a stack
 *  on the third.
 *
 *  It holds the thesis, the survey's table and the roster, and is read at the
 *  survey and the close and never between — so it gets the name, its stage and
 *  the count line, and **no task count**: its checkboxes are not the run's
 *  progress. The member spread is.
 *
 *  `href` links the name (the shelf, pointing at the board page); omitted, the
 *  name is plain text — on the board page the reader is already there.
 *  `trailing` is where a surface adds its own control: the board page hangs
 *  the walkthrough button there, and the shelf passes nothing. */
export function RunHeader({
  group: g,
  href,
}: {
  group: BoardGroup;
  href?: string;
}) {
  const active = g.boards.filter((b) => b.status === "active").length + (g.runBoard?.status === "active" ? 1 : 0);
  // The members by stage, in the mode's kind order — where the run
  // stands, which is what the run board's own task count never said.
  const kinds = MODE_KINDS[g.mode];
  const spread = kinds
    .map((k) => ({ k, n: g.boards.filter((b) => b.stage === k).length }))
    .filter(({ n }) => n > 0)
    .map(({ k, n }) => `${n} at ${k.replace(/-/g, " ")}`)
    .join(" · ");
  const runActive = g.runBoard?.status === "active";
  return (
    <div className="flex items-center justify-between gap-md flex-wrap">
      <span className="flex items-baseline gap-sm flex-wrap">
        <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">Run</span>
        {g.runBoard && href ? (
          <Link href={href} className="sys-run-head">
            {g.run}
          </Link>
        ) : (
          /* Not .sys-run-head: that class carries a hover colour, and text
             that changes on hover without going anywhere reads as a dead
             link. Same size and weight, no hover. */
          <span className="text-sm font-semibold text-fg-primary">{g.run}</span>
        )}
        {g.runBoard && <StagePill board={g.runBoard} />}
        {runActive && (
          <span className="text-2xs font-semibold uppercase tracking-wide text-brand-strong">active</span>
        )}
      </span>
      <span className="flex items-center gap-md flex-wrap">
        {/* "none active" is said, not implied. A run whose members are all
            waiting is a real state — the run board can release the mode's
            active slot before any member takes it — and it used to render as
            the absence of a clause beside a shelf of uniformly faded tiles,
            which reads as a styling accident rather than a fact about the
            run. Muting is relative, and relative to nothing it says nothing;
            the count line is where the run already reports itself. */}
        <span className="text-2xs text-fg-tertiary tabular-nums">
          {g.boards.length} {g.boards.length === 1 ? "board" : "boards"}
          {` · ${active > 0 ? `${active} active` : "none active"}`}
          {spread && ` · ${spread}`}
        </span>
      </span>
    </div>
  );
}

/** The walkthrough, as the board's own callout — the page's main action.
 *
 *  It is a full-width card under the badge row, not a control *on* it. The
 *  badge row carried it as a 24px button at the end of a strip of four labels,
 *  sitting above a section index, above a board that runs several screens —
 *  and this page stacks every open board, so a run puts five of those in a
 *  column. The page's main action cannot be the last item of its densest row.
 *
 *  **The lede is the canon's own, not ours.** It is the Glossary's Walkthrough
 *  entry, first sentence, parsed by `glossaryLede` — so the card says why to
 *  click in your project's own words and changes when your canon does. An
 *  authored line here would be the surface restating a rule it does not own,
 *  which is the failure the derived-never-authored law names.
 *
 *  **Asking nothing, it is not a card.** A walkthrough with no open calls and
 *  no unwalked checks is not a button: the counts are the whole reason for the
 *  emphasis, so at zero the loudest thing on the page would be advertising
 *  that it wants nothing. It keeps the href and the slot, because an open
 *  board's walkthrough still holds the Decisions log the close reads, and drops
 *  to the weight the link had before it earned the box.
 *
 *  A board with no walkthrough sibling renders nothing at all. Most boards have
 *  none until the build commits — absence is a state, not a gap. */
export function WalkthroughCallout({
  board,
  lede,
}: {
  board: ActivePhase;
  lede: string | null;
}) {
  const w = board.walkthrough;
  if (!w) return null;
  const href = `/system/walkthrough/${board.slug}`;
  const asks = w.calls + w.checks > 0;

  if (!asks) {
    return (
      <p className="text-xs text-fg-tertiary">
        <Link href={href} className="underline underline-offset-2">
          {/* `walked` is what makes this sentence worth writing: a walkthrough
              that passed nine checks says so, one that never asked anything
              says only its own name. */}
          walkthrough
          {w.walked > 0 && (
            <span className="tabular-nums">
              {` · walked (${w.walked} ${w.walked === 1 ? "check" : "checks"})`}
            </span>
          )}
          {" →"}
        </Link>
      </p>
    );
  }

  return (
    <div className="sys-callout">
      <div className="flex flex-col gap-tiny">
        <p className="text-sm font-semibold text-fg-primary">Walkthrough</p>
        {lede && <p className="max-w-[60ch] text-xs text-fg-secondary leading-snug">{lede}</p>}
        <p className="text-xs text-fg-secondary tabular-nums">
          {w.calls} {w.calls === 1 ? "call" : "calls"} open · {w.checks}{" "}
          {w.checks === 1 ? "check" : "checks"} to walk
          {w.walked > 0 && ` · ${w.walked} walked`}
        </p>
      </div>
      <Link href={href} className="sys-button">
        Walk it →
      </Link>
    </div>
  );
}

/** A run, as a shelf: the header, then the members in a grid, which are the
 *  run's progress. */
function RunShelf({ group: g }: { group: BoardGroup }) {
  return (
    <div className="sys-run">
      <RunHeader group={g} href={g.runBoard ? `/system/phase#${g.runBoard.slug}` : undefined} />
      {g.boards.length > 0 && (
        <div className="grid gap-sm grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {g.boards.map((b) => (
            <BoardTile key={b.slug} board={b} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The queue, condensed for a hub.
 *
 *  Replaces a tile whose entire content was a count: the rows themselves say
 *  more in the same space. Each card links to its seed exactly as the roadmap
 *  page's cards do, and a seedless row renders inert — that state is what the
 *  bidirectional seed invariant flags (lib/derivation.ts), not something the
 *  UI should paper over.
 *
 *  Presence-not-count, like the invariants: a fresh project has queued nothing,
 *  and the shelf still renders so the roadmap stays one click away on day one. */
/** A queued row joined to its seed — what the hub and Work hand the shelf. */
export interface QueueItem {
  name: string;
  mode: BoardMode | null;
  seedPath: string | null;
  run: string | null;
}

/** The queue with a run's rows pulled together: the ROADMAP's order stands
 *  for the first row of each run, and the run's other rows follow it. The
 *  roadmap page and the shelf both read this, so a run reads the same on
 *  both. */
export function groupQueue<T extends { run: string | null }>(items: T[]): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    if (it.run && seen.has(it.run)) continue;
    out.push(it);
    if (it.run) {
      seen.add(it.run);
      out.push(...items.filter((o) => o !== it && o.run === it.run));
    }
  }
  return out;
}

export function QueueShelf({
  items,
  limit = 4,
}: {
  items: QueueItem[];
  limit?: number;
}) {
  const shown = groupQueue(items).slice(0, limit);
  return (
    <div className="sys-shelf">
      <div className="flex items-baseline justify-between gap-md">
        {/* "Roadmap", not "Queue": the shelf is a window onto that page, and
            the count is what keeps a capped list from reading as the whole
            list — no separate "+N more" line needed once it is stated. */}
        <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
          Roadmap
          <span className="ml-sm font-normal">
            {items.length} {items.length === 1 ? "phase" : "phases"} queued
          </span>
        </span>
        <Link href="/system/roadmap" className="text-xs text-fg-secondary underline underline-offset-2">
          View roadmap →
        </Link>
      </div>
      {shown.length === 0 ? (
        <EmptyNote>Nothing queued yet — planned work lands on the roadmap before a board opens.</EmptyNote>
      ) : (
        // auto-fit, not a fixed three: the queue's length varies, and two cards
        // holding a third of the row with a gap beside them reads as broken
        // rather than as room to spare.
        <div className="grid gap-sm grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {shown.map((q) => {
            const inner = (
              <>
                <span className="text-sm font-semibold text-fg-primary leading-snug">{q.name}</span>
                <span className="flex flex-wrap items-baseline gap-x-sm gap-y-xs">
                  {q.mode && <span className="sys-pill self-start">{MODE_META[q.mode].label}</span>}
                  {q.run && <span className="text-2xs text-fg-tertiary">run · {q.run}</span>}
                </span>
              </>
            );
            return q.seedPath ? (
              <Link key={q.name} href={`/system/docs/${q.seedPath}`} className="sys-tile gap-sm">
                {inner}
              </Link>
            ) : (
              <div key={q.name} className="sys-card flex flex-col gap-sm">
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TierPill({ tier }: { tier: Tier | null }) {
  if (!tier) return <span className="sys-pill">untiered</span>;
  return <span className={`sys-pill sys-pill-tier-${tier}`}>{TIER_META[tier].label}</span>;
}

export function StalePill({ staleDays, lastReviewed }: { staleDays: number | null; lastReviewed: string | null }) {
  if (staleDays !== null) {
    return <span className="sys-pill sys-pill-stale">reviewed {lastReviewed ?? "?"}</span>;
  }
  return <span className="text-xs text-fg-tertiary tabular-nums">{lastReviewed ?? "—"}</span>;
}

export function IdTag({ id }: { id: string }) {
  return <span className="sys-id">{id}</span>;
}

/** The inset explainer, on a React page.
 *
 *  Same visual as a mold's blockquote inside a rendered doc — one CSS home
 *  (`.sys-inset`, system.css), two callers. `label` opts into the info glyph;
 *  without one the block is a quiet aside rather than a signpost. */
export function InsetNote({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="sys-inset flex flex-col gap-tiny">
      {label && <span className="sys-inset-label text-xs font-semibold text-fg-primary">{label}</span>}
      {children}
    </div>
  );
}

/** Standard "where this page comes from" footer — every list page carries one,
 *  reinforcing the derived-never-authored law. */
export function SourceNote({ href, path, note }: { href: string; path: string; note?: string }) {
  return (
    <p className="text-xs text-fg-tertiary">
      Source:{" "}
      <Link href={href} className="underline underline-offset-2">
        {path}
      </Link>
      {note && <> — {note}</>}
    </p>
  );
}

/* Minimal inline-markdown renderer for list surfaces: bold, italics, code,
   strikethrough; links render as their text. Bold/italic content is parsed
   recursively so nested forms like **`code`** render cleanly. Block rendering
   (doc detail) uses react-markdown instead. */
/** A doc-relative `.md` href, resolved to a doc page.
 *
 *  `docDir` is the LINKING doc's own directory relative to the docs root, so
 *  `../CONTRIBUTING.md` inside `phases/` resolves the way it reads in the
 *  file. Absolute paths, fragments and external URLs pass through untouched.
 *  One home for the two callers that need it — the inline renderer and the
 *  block one — because they had drifted once already. */
export function resolveDocHref(href: string, docDir: string): string {
  if (/^(https?:)?\/\//.test(href) || href.startsWith("#") || href.startsWith("/")) return href;
  const [clean, hash] = href.split("#");
  if (!clean.endsWith(".md")) return href;
  const segs = (docDir === "." || docDir === "" ? [] : docDir.split("/")).concat(clean.split("/"));
  const out: string[] = [];
  for (const seg of segs) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  // A #fragment survives resolution — section links (e.g.
  // CONTRIBUTING.md#closing-a-phase) land on the heading ids DocProse stamps.
  return `/system/docs/${out.join("/")}${hash ? `#${hash}` : ""}`;
}

/** `docDir` is the directory the text was READ from, relative to the docs
 *  root — needed only when the source doc is not at the root. The parsed
 *  sources this renderer was built for (CONTRIBUTING, ROADMAP, decisions.md)
 *  all sit there, so it defaults to the root and every existing call site is
 *  unchanged; the molds page is the first caller reading from `phases/`. */
export function MdInline({
  text,
  anchors,
  docDir = ".",
}: {
  text: string;
  anchors?: Record<string, string>;
  docDir?: string;
}) {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|~~[^~]+~~|\[\[[^\]]+\]\]|\[[^\]]+\]\([^)]*\))/g;
  let last = 0;
  let m;
  let key = 0;
  // Plain text, with any `§ <name>` the caller mapped rendered as an anchor
  // link. The map is per-page and opt-in: a page passes only the sections it
  // renders, so an unmapped § reference stays plain text rather than a link
  // to nowhere. Threaded through the bold/italic recursion — several §
  // references live inside bold.
  const pushText = (t: string) => {
    if (!anchors) {
      if (t) nodes.push(t);
      return;
    }
    let rest = t;
    for (;;) {
      let best: { i: number; name: string } | null = null;
      for (const name of Object.keys(anchors)) {
        const i = rest.indexOf(`§ ${name}`);
        if (i !== -1 && (!best || i < best.i)) best = { i, name };
      }
      if (!best) {
        if (rest) nodes.push(rest);
        return;
      }
      if (best.i > 0) nodes.push(rest.slice(0, best.i));
      nodes.push(
        <a key={key++} href={anchors[best.name]} className="underline underline-offset-2">
          {`§ ${best.name}`}
        </a>
      );
      rest = rest.slice(best.i + `§ ${best.name}`.length);
    }
  };
  while ((m = re.exec(text))) {
    if (m.index > last) pushText(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**"))
      nodes.push(
        <strong key={key++}>
          <MdInline text={tok.slice(2, -2)} anchors={anchors} docDir={docDir} />
        </strong>
      );
    else if (tok.startsWith("~~"))
      nodes.push(
        <s key={key++}>
          <MdInline text={tok.slice(2, -2)} anchors={anchors} docDir={docDir} />
        </s>
      );
    else if (tok.startsWith("`")) nodes.push(<code key={key++} className="sys-code">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[[")) nodes.push(tok.slice(2, -2).split("|").pop());
    else if (tok.startsWith("[")) {
      // Markdown links render as real links: doc-relative `.md` targets (an
      // optional #fragment kept) resolve through the doc reader; absolute
      // paths pass through; anything else stays plain text. Relative targets
      // resolve against `docDir` — the docs root unless the caller says
      // otherwise (see MdInline).
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("](") + 2, -1);
      const [file] = href.split("#");
      const inner = <MdInline text={label} docDir={docDir} />;
      if (/^https?:\/\//.test(href))
        nodes.push(
          <a key={key++} href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            {inner}
          </a>
        );
      else if (href.startsWith("/"))
        nodes.push(
          <Link key={key++} href={href} className="underline underline-offset-2">
            {inner}
          </Link>
        );
      else if (file.endsWith(".md"))
        nodes.push(
          <Link key={key++} href={resolveDocHref(href, docDir)} className="underline underline-offset-2">
            {inner}
          </Link>
        );
      else nodes.push(<span key={key++}>{inner}</span>);
    }
    else
      nodes.push(
        <em key={key++}>
          <MdInline text={tok.slice(1, -1)} anchors={anchors} docDir={docDir} />
        </em>
      );
    last = m.index + tok.length;
  }
  if (last < text.length) pushText(text.slice(last));
  return <>{nodes}</>;
}


/** The id a rendered heading gets: its text, slugged by the one shared
 *  function (lib/system.ts → headingSlug), so the inspector's deep links land.
 *
 *  `prefix` scopes the id to one document. /system/phase stacks every open
 *  board — and, for a run, the run board's body plus every member board in
 *  full — into a single document, so two boards with `## Items` emitted two
 *  `id="items"` and every link to the second landed on the first. The docs
 *  route renders one doc per page and passes no prefix, deliberately: its ids
 *  are the destination of links written by hand across a project's docs (every
 *  board mold's `../CONTRIBUTING.md#…`, `resolveDocHref`'s surviving #fragment,
 *  the inspector's deep link into the patterns doc), and prefixing there would
 *  break every one. */
function headingId(children: ReactNode, prefix?: string): string {
  const textOf = (n: ReactNode): string => {
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(textOf).join("");
    if (n && typeof n === "object" && "props" in n)
      return textOf((n as { props: { children?: ReactNode } }).props.children);
    return "";
  };
  return scopedId(headingSlug(textOf(children)), prefix);
}

function scopedId(slug: string, prefix?: string): string {
  return prefix ? `${prefix}-${slug}` : slug;
}

/** The `##` headings of a doc body, in order, each with the id DocProse will
 *  stamp on it — the section index's source.
 *
 *  Two things this has to get right. It is **fence-aware**: a `## ` line inside
 *  a code block is code, and the decisions log's Format block is the standing
 *  instance — it holds a literal `## YYYY-MM-DD` example that is not a section.
 *  And it slugs the SOURCE text where headingId slugs the RENDERED children, so
 *  the two paths have to agree — stripMd is what makes them: it removes the
 *  inline markup react-markdown would have turned into elements, leaving the
 *  same plain text headingId sees. A link in a heading is the case that proves
 *  it (`[a](b)` renders as "a", and stripMd yields "a"). Any inline form stripMd
 *  does not know is a heading whose index entry will not land, so new inline
 *  syntax in a heading belongs in that function, not in a second stripper. */
export function docHeadings(body: string, prefix?: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let fence: string | null = null;
  for (const line of body.split("\n")) {
    const f = line.match(/^\s{0,3}(```+|~~~+)/);
    if (f) {
      if (fence === null) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;
    // Exactly two hashes: `### foo` has no whitespace at position 2 and falls
    // through. Trailing hashes are the closed-atx form markdown allows.
    const m = line.match(/^##\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    const text = stripMd(m[1]);
    if (!text) continue;
    out.push({ id: scopedId(headingSlug(text), prefix), text });
  }
  return out;
}

/** What earns an index is LENGTH, and heading count is a bad proxy for it. The
 *  first cut of this gated on `##` count alone and missed the docs the work was
 *  named after — a roadmap or a lifecycle doc carrying four long sections lost
 *  to a board mold carrying seven short ones. So the measure is the body, and
 *  the heading count is only a floor: an index of two entries is not an index,
 *  whatever the doc weighs.
 *
 *  The fold is the one threshold that IS a heading count, because what it sizes
 *  is the index itself — a mature decisions log renders through here with
 *  well over a hundred sections, and open, that index is the wall it exists to
 *  fix. Folded it keeps its scannability and gives up being always-open, the
 *  cheaper of the two.
 *
 *  All three are thresholds on DERIVED values, never an authored prop: the
 *  surface's law is that a page renders what the docs say, and an opt-in flag
 *  would leave every long doc one forgotten prop away from being a wall again. */
const INDEX_MIN_BODY = 3000;
const INDEX_MIN_HEADINGS = 3;
const INDEX_FOLD_ABOVE = 20;

/** The section index: the doc's own `##` headings as in-page links.
 *
 *  Inline and per-document, under whatever chrome the consumer puts above it —
 *  the badge row on /system/phase, the frontmatter card on the docs route. Not
 *  a sticky rail: `.sys-main` is a centred 880px column, so a rail means
 *  breaking the column or overlaying it, and /system/phase stacks several
 *  documents, so one rail would have to swap contents as the reader scrolls
 *  between them.
 *
 *  A block list, never a flex one — a flex parent blockifies its children and
 *  drops every marker. Markers are off here anyway, but the rule is about the
 *  mechanism, not the bullet. */
function DocIndex({
  headings,
  bodyLength,
}: {
  headings: { id: string; text: string }[];
  bodyLength: number;
}) {
  if (headings.length < INDEX_MIN_HEADINGS || bodyLength < INDEX_MIN_BODY) return null;

  const label = `Sections · ${headings.length}`;
  const list = (
    <ul className="sys-doc-index-list">
      {headings.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`}>{h.text}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="sys-doc-index" aria-label="Sections">
      {headings.length > INDEX_FOLD_ABOVE ? (
        <details className="sys-details sys-details--solo">
          <summary className="flex items-baseline gap-sm text-2xs text-fg-tertiary">
            <span className="sys-caret" aria-hidden>
              ›
            </span>
            {label}
          </summary>
          {list}
        </details>
      ) : (
        <>
          <p className="sys-doc-index-label">{label}</p>
          {list}
        </>
      )}
    </nav>
  );
}

/** Doc prose rendered from markdown, with relative `.md` links resolved to
 *  doc pages under /system. Two routes render doc bodies — the docs route and
 *  the active board on /system/phase — and only the first used to resolve
 *  links, so every board shipped a dead `../CONTRIBUTING.md`. It is in all
 *  three board molds, so every project carried it. One home for both.
 *
 *  `docDir` is the doc's own directory relative to the docs root, so a link
 *  resolves the way it reads in the file: "phases" for a board, "." at root. */
export function DocProse({
  body,
  docDir,
  idPrefix,
}: {
  body: string;
  docDir: string;
  idPrefix?: string;
}) {
  const resolveHref = (href: string) => resolveDocHref(href, docDir);

  return (
    <>
      <DocIndex headings={docHeadings(body, idPrefix)} bodyLength={body.length} />
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Raw HTML nodes hide instead of rendering as literal text — the
      // parser markers (<!-- PARSED by … -->) must stay invisible here.
      // Code spans/fences are unaffected (they aren't html nodes).
      skipHtml
      components={{
        h2: ({ children }) => <h2 id={headingId(children, idPrefix)}>{children}</h2>,
        h3: ({ children }) => <h3 id={headingId(children, idPrefix)}>{children}</h3>,
        h4: ({ children }) => <h4 id={headingId(children, idPrefix)}>{children}</h4>,
        a: ({ href, children }) => {
          const resolved = resolveHref(href ?? "");
          if (resolved.startsWith("/system/")) return <Link href={resolved}>{children}</Link>;
          if (/^https?:\/\//.test(resolved)) {
            return (
              <a href={resolved} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          }
          // An in-app path the mount does not own is still a real destination.
          // Emit a plain anchor rather than swallowing the link into text — a
          // de-linked path gives the reader no sign a link was ever meant.
          // Only an unresolvable ref stays inert.
          if (resolved.startsWith("/")) return <a href={resolved}>{children}</a>;
          return <span>{children}</span>;
        },
      }}
    >
      {body}
    </ReactMarkdown>
    </>
  );
}
