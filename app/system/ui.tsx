import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { ActivePhase, BoardGroup, BoardMode, Tier } from "@/lib/system";
import { boardName, MODE_KINDS, MODE_META, TIER_META, headingSlug } from "@/lib/system";
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
  const standalone = groups.filter((g) => !g.run);
  const runs = groups.filter((g) => g.run);
  return (
    <div className="flex flex-col gap-md">
      {standalone.length > 0 && (
        <div className={`grid gap-md ${standalone.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {standalone.map((g) => (
            <BoardTile key={g.boards[0].slug} board={g.boards[0]} />
          ))}
        </div>
      )}
      {runs.map((g) => {
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
          <div key={`${g.mode}:${g.run}`} className="sys-run">
            {/* The run board is the shelf's header, not a tile among the
                members: it holds the thesis, the survey's table and the
                roster, and is read at the survey and the close — the one
                board a reader does not open between. So it gets the name,
                its stage and a link, and no task count; the members are
                the run's progress. */}
            <div className="flex items-baseline justify-between gap-md flex-wrap">
              <span className="flex items-baseline gap-sm flex-wrap">
                <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">Run</span>
                {g.runBoard ? (
                  <Link href={`/system/phase#${g.runBoard.slug}`} className="sys-run-head">
                    {g.run}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-fg-primary">{g.run}</span>
                )}
                {g.runBoard && <StagePill board={g.runBoard} />}
                {runActive && (
                  <span className="text-2xs font-semibold uppercase tracking-wide text-brand-strong">active</span>
                )}
              </span>
              <span className="text-2xs text-fg-tertiary tabular-nums">
                {g.boards.length} {g.boards.length === 1 ? "board" : "boards"}
                {active > 0 && ` · ${active} active`}
                {spread && ` · ${spread}`}
              </span>
            </div>
            {g.boards.length > 0 && (
              <div className="grid gap-sm grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                {g.boards.map((b) => (
                  <BoardTile key={b.slug} board={b} />
                ))}
              </div>
            )}
          </div>
        );
      })}
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
 *  function (lib/system.ts → headingSlug), so the inspector's deep links land. */
function headingId(children: ReactNode): string {
  const textOf = (n: ReactNode): string => {
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(textOf).join("");
    if (n && typeof n === "object" && "props" in n)
      return textOf((n as { props: { children?: ReactNode } }).props.children);
    return "";
  };
  return headingSlug(textOf(children));
}

/** Doc prose rendered from markdown, with relative `.md` links resolved to
 *  doc pages under /system. Two routes render doc bodies — the docs route and
 *  the active board on /system/phase — and only the first used to resolve
 *  links, so every board shipped a dead `../CONTRIBUTING.md`. It is in all
 *  three board molds, so every project carried it. One home for both.
 *
 *  `docDir` is the doc's own directory relative to the docs root, so a link
 *  resolves the way it reads in the file: "phases" for a board, "." at root. */
export function DocProse({ body, docDir }: { body: string; docDir: string }) {
  const resolveHref = (href: string) => resolveDocHref(href, docDir);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // Raw HTML nodes hide instead of rendering as literal text — the
      // parser markers (<!-- PARSED by … -->) must stay invisible here.
      // Code spans/fences are unaffected (they aren't html nodes).
      skipHtml
      components={{
        h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
        h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
        h4: ({ children }) => <h4 id={headingId(children)}>{children}</h4>,
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
  );
}
