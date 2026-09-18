---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
tags: [rules, workflow, conventions]
read-when: "always — read before any working session"
---

# Contributing Rules

Rules for humans and agents working in this repo. Read before building. This is the **methodology template** — the machinery is complete; the project-specific parts (stack, design conventions, strategy) are yours to fill at kickoff (see `KICKOFF.md`).

---

## The Work Model — every phase runs in one of four modes

<!-- PARSED by lib/system.ts (getWorkModel) -> /system/method + the hub. Changing this section's SHAPE
     (the four '### The <product|system|side|queue-shaping> phase — tagline' headings, the bold 'Purpose/Home ground/Careful/Gated/During' labels, the numbered ritual lists, the 'Session starters' table, the '#### <Part>' blocks under '### The parts' carrying bold 'Is/Properties' fields, and the 'Adjustments' arrow bullets) breaks that page silently - the /system drift banner will name it.
     Two shapes inside that are easy to miss, because they read as ordinary prose:
     - The Trigger part's 'Is:' sentence lists the moments as 'name (what it fires)', separated by '·'. The method page tags each ritual with the moment that fires it by reading that list.
     - A ritual step that reaches for a human names 'the PO'. That is how the page knows which steps stop and which the session runs alone - so 'the user' for the same person silently un-marks a step. Naming is not reaching: a purpose clause ('...so the PO can spot overlap') is stripped before the match, because the session still runs that step alone.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

**Work here happens in phases. A phase is any chunk of work — a feature, a rules change, a sweep of small fixes — and its arc is open → build → review → close.** The arc runs as a sequence of **kinds** — each the shape of one session: what it reads, does and leaves, at what level — the phase's plan riding between them on its **board**, a doc any chat can pick up (§ The phase pipeline). Every step of opening, orienting and closing is a **ritual** — built into the phase, run by the session and stopping for you where a step says so, yours to reshape. The **mode** — product · system · side · queue-shaping — sets a phase's focus: what it reads before editing, and what it may touch. Can't name the mode? Just describe what you're holding — the session names the shape with you (§ Session starters). No phase is ritual-free.

**Rules shared by all modes:**

- **Phase = board while open.** A phase opens its board from its mode's template (`_product-template.md` · `_system-template.md` · `_side-template.md` · `_queue-shaping-template.md`) and closes it in the same arc — usually the same sitting. Boards are always `tier: working` while open; at close they are **distilled and deleted** — extraction first (decisions → `decisions.md`, behavior → feature docs, tracker rows moved), then the file goes; git history is the deep record. Product phases additionally leave a compact record for the timeline.
- **No canon change lands unratified — the canon diff.** Before a board is deleted, the phase gathers every change it made to bedrock- and commitments-tier docs (CLAUDE.md included) and walks the PO through it, hunk by hunk — the doc-tier analog of the walkthrough. It runs inside the system and side phases' verification handoff, and as its own step before the product phase's distill-and-delete. Most hunks are quick confirms of calls the PO already drove; the step exists to catch what nobody decided. "None" is a valid answer for a phase that touched no tiered doc.
- **The queue is the ROADMAP's What's Next — upcoming planned work of any mode, one mode-tagged list.** Every queued row carries a **seed** (`planning/queued/`, badged by its `mode:`) accumulating context until the phase opens. The queue is a staging area, never a gate: something serious can skip it — write a collapsed board and kick off directly.
- **Every phase maintains its own footprint in the queue — nobody maintains anyone else's — and every phase reads the rest.** At open, a phase removes its own row and deletes its seed, whatever its mode: the queue is future-only, and the open board is that phase's pointer, so a row left behind double-counts. **Then it scans what's left** — the remaining rows and their seed ledes — because what is downstream changes how you build for it, not just what you queue after. **A row and its seed are written as the idea forms, mid-phase** — the moment the work throws off something committed, phase-sized and not this phase's job — so the close confirms rather than discovers. At close, the phase writes the rows its work created **that it has not already written** — row and seed together, always, because the match between them is a build-time invariant — **and appends a dated note to any existing seed its work bore on.** A seed accumulates only when something prompts it; this is the prompt, and without it the queue is written at close and read by nobody. Three guardrails hold mid-phase too: row and seed land in the **same edit**; writing a seed is not doing the work, and the phase stays on its board; and the **PO owns what lands on the ROADMAP**, which is commitments-tier, so a row is proposed, never slipped in. Shaping the queue at any other time — adding work nobody is doing, reordering, dropping a row the project outgrew — is a **queue-shaping phase** (§ The queue-shaping phase). An unowned queue rots; this is who owns it.
- **Trackers hold candidates, not queued work.** A tracker note that bloats, or a cluster of connected notes, promotes into a phase — the rows leave the trackers and the board gets a cohesive chunk. Tracker work needed sooner than later gets a seed and/or a board, depending on how soon it'll be picked up.
- **Reading is never gated — the touch bands gate pens, not eyes.** Every opening ritual has a bounded orient step (read the mode's core set whole; actively align to the emphasized set), and any doc may be pulled freely mid-build. Orientation is **align or challenge**: new work pressing on an old commitment isn't drift to suppress — it's a structured challenge to raise (§ Doc Tiers), and sometimes the challenge should win. That pressure is how new directions, features, and strategy are born.
- **Concurrency — one active board per mode.** A board is `status: active` while a session works it, `waiting` when it cleared its kind and is queued for the next, and **`paused`** when it stopped mid-kind with nobody working it — stopped on purpose, or moved on prematurely and not picked back up right now. Never two active boards of the same mode. A **run** holds many open product boards at once, one active and the rest waiting or paused (§ The phase pipeline). **`paused` is what `waiting` was lying about:** `waiting` is a claim of completion, so a board stopped mid-walkthrough sat in the record looking finished. Three rules come with it. **Pausing sets `stage:` back to the unfinished kind** — `paused` says *resume here*, and it is a lie without an honest stage. A paused board **holds no slot**, because nobody is working it. And it **clears one way**: a session picks it up, sets it `active`, finishes the kind, then sets `waiting` and advances `stage:`. Editing the field is not finishing the kind. The light modes (side, queue-shaping) run alongside the heavy ones freely — a queue-shaping phase edits one row and one seed, never the rules, so the forked-rules risk the limit exists for cannot arise.
- **A change that makes a ROADMAP current-state claim inaccurate fixes it in the same edit, whoever made the change.** Those claims — in Where We Are as much as in What's Next — belong to no board, so nobody else will. **Every mode may make this correction, even where the text is otherwise gated ground**: repointing a line your own work invalidated is mechanical, and the alternative is a rule nobody is permitted to obey. Never defer it — a note on your board is deleted at your close, and the stale text outlives it. Re-orienting the ROADMAP's *direction* is not covered and stays where it was. **Another board's walkthrough is not yours to edit:** raise what you noticed and the PO routes it, and its owner re-reads at close (`product-lifecycle.md` → Closing a Phase, step 1). (Detail: `product-lifecycle.md` → During a Phase.)
- **A find about another open board's ground lands on that board — `## Raised`.** Every mold carries the section and every board keeps it — empty is its ordinary state, because a sender cannot write into a section that is not there — and it is the one part of another board any mode may write, because a note is not that board's work. An entry names **what** was found or changed, **where** (the file or route), **which board found it and when**, and **what the receiving session owes** — judge, verify, or nothing, FYI. **A note is never an item.** The receiving session drains the section: it reads it at its open, does the work, and where a ruling or a check is owed **authors its own O or V item from it**, then deletes the entry. Crossing re-authors, and re-authoring is how the receiving session takes ownership — which is why the walkthrough itself stays shut: the O list is the close gate, so a session that could add to it could block another board's close without owning the work, and every O item is a call its own chat has to defend when the PO rules. **An entry owed to a kind the board has already passed sets it back there** — `paused` at that kind, the same move a close's `defect` verdict makes (§ The phase pipeline) — and the **draining** session makes that call, never the sender. **A close does not delete a board with entries left in it:** draining is reading rather than work, and the board is destroyed at close, so an entry left in one is destroyed silently. **A board that has already closed has no section to land in** — that find goes where every cross-phase find goes: a tracker row by its stance, or a queue row and seed if it is phase-sized. Urgency is not the section's job: a defect that cannot wait is raised in chat *as well*, and written here so it survives the chat.
- **A phase belongs to one project — the repo its board lives in.** The board names that repo at open, and everything outside it is out of bounds for every mode: no edits, no commits, no "while I'm here." A sibling project's problem gets written down and handed to a session running *in* that project; re-scoping takes a new session there, not a note here.
- **A session serves one board-kind — and no board, no pen.** The pipeline multiplies sessions per phase, never phases per session, and the unit is neither the board nor the phase: a **split** board (a Levels line declaring kinds) takes one session per kind, because a chat holds one level and the kinds need different ones; a **collapsed** board declares no split, so its whole arc is one stretch and one session. Picking that stretch back up after a break is continuation, not a second session (§ Session starters). **Never two boards in one session** — the next phase opens cold, off the line the previous close handed over. A session that only reads or talks needs no phase at all — but the first edit is the line: before touching code or docs, stop, name the shape that fits (§ Session starters), and open its board. Filing a tracker row stays free — capture between phases is what trackers are for, and the valve that keeps this rule from pushing a discovered fix into the open phase's scope. A fix small enough not to earn a board is a punch item (≤30 min, any mode), swept later.
- **Every close hands off the next opening line.** A phase's close ends by writing, in chat, the line that opens what comes next: its starter shape and mode, the name, one sentence of why, and where the context already sits — a seed, a tracker row, the `decisions.md` entry just written. A **pointer, not a briefing** — the cold session reads the record, so the line costs a sentence and the handoff carries no new file. Nothing next is a real answer; say so. (Inside a phase, the kind seam already hands the next kind's line over — § The phase pipeline.)
- **Every chat serving a phase names itself, and the board records each title.** A session can set its own title — the harness exposes a rename to the session it runs — so at the moment the title is known, right after the board is created or at a kind's chat open, the session **sets it from the convention, records it on the board, and says in one line what it chose.** It asks only when the title is not derivable: no phase name yet, a harness with no rename the session can reach, or a title the PO set by hand that the harness will not replace unasked. Then the ask is its own prompt, carrying the proposed title so it can be copied — yes, renamed · no, I named it: [title] · skip — and the session waits for the answer. The title is **`Phase name · mode`** for a collapsed board, and **`kind · Phase name · mode`** for each chat of a split phase — the kind leads because it is the PO's which-chat-am-I-in cue when several of one phase are open, and the mode trails because it matters most to the agent, which reads it from the board anyway. Whoever set it, the board records the title beside the kind that carried it. Session identity lives in the harness, not in git; the board's lines are the only place the record can say which chats ran the phase.
- **Session end commits the board, and pushes it.** A session that ends mid-phase — deliberately or with the chat force-closed — commits the open board as it stands, code ready or not, **sets it `paused` when its kind is unfinished** — session end is the moment that status is knowable, and the only one — and pushes: a committed board nobody can see is still stranded work. A board is a doc: committing it is mode-pure and costs nothing, and it is the difference between a phase that survives its chat and work that strands. A session that finds stranded work commits and pushes the board before anything else.
- **Push is the publish trigger.** The deploy rebuilds the record from every push, so pushing *is* publishing where things stand. The smallest push worth naming is the **status push**: commit the record alone — board, trackers, ROADMAP — and push. One gesture that puts the state of the work on the record without shipping half-finished code. Session end's board commit is its natural companion.
- **Commits are mode-pure.** A commit serves exactly one board and names it in the message. Never mix product and system changes in one commit.
- Boards work the main working tree — parallelism is *between* phases, not within one. (Spawned side tasks are the exception: they run in worktrees, per the side phase.)
- **Routing ("where does this go?"):** ≤30 min isolated fix → punch list, swept later · focused work, no strategy → side phase · structural thesis or cross-surface coupling → product phase · workflow/doc/dashboard work → system phase · committed, phase-sized, not this phase's job → a row and seed on the queue · strategic and unresolved → Open Questions · known direction, no trigger yet → Future Considerations.
- The active board(s) render live at `/system` (Work → Active board), badged by mode.

### Session starters — the front door

Every session starts with someone arriving with something, and your part is two choices the chat cannot make for itself: **what you're holding**, which picks the shape below — the shape sets the mode, and the mode sets the rituals — and **the chat's level**, set in your tool before you type. Opening a phase runs high. Arriving at a board already opened, its Levels line names the level for the kind its `stage:` sits at. Queue-shaping and sweeps take what the work honestly needs — your call. Then say the row's line; the session runs the rituals from there, and when its stretch of the arc ends it commits the board and hands you the next opening line — the next kind's, or at a close, the next phase's. No vocabulary yet? Describing what you're holding is enough.

| You're arriving with | The shape | Mode | Example prompt | What happens |
|---|---|---|---|---|
| A new idea nobody is doing yet | Queue-shaping | queue-shaping | "Shape the queue: I keep hitting X and there's no row for it." · "Shape a run: the whole client site, by the 20th." | The **queue-shaping phase**: capture the idea and its context as a row + seed, for phases of any mode — product builds, sweeps, research alike (§ The queue-shaping phase). An idea bigger than one phase is shaped as a **run**: ordered rows with seeds, the kinds each will run, inside a stated bound. It ends at the shaped queue: a queued phase launches in its own session, with fresh eyes on the seed. Can't wait? Skip the queue and open a **collapsed** board directly; a split phase still opens from its seed, which a fresh open chat picks up next. |
| The next queued thing, ready to plan | Phase from the queue | from its seed | "Open [phase name] from the queue." · "Open the [run name] run." | The **open** kind: the seed names the mode — product, system or side — and the run, if it belongs to one; this session verifies the seed, orients, agrees scope and writes the board, Levels line included; row and seed leave the queue. A board with no Levels line keeps this same chat for the whole arc — the collapsed default. One that declares levels ends here at the committed board, and the next kind arrives fresh. A run's boards open together here, or one at a time as the run grows. |
| A pile of small fixes or tracker items | Sweep | side | "Run a side phase, sweep: P07 · P12 · §5." | The **side phase**, in its **sweep** kind. Tracker-born: pull the items onto a light board and open directly — no queue row needed. A sweep can also be a verification pass over shipped work. |
| Something to understand before anything gets decided | Research | side | "Run a side phase, research: explore §2 before we commit." | The **side phase**, in its **research** kind. Lands a doc in `strategy/research/` and updates the tracker that asked — understanding is the deliverable, not code. |
| Friction with the system itself — docs, rules, dashboard | System phase | system | "Run a system phase: the close ritual keeps missing X." | The **system phase** itself, no kind. Name the friction and agree the scope before touching anything; system work is always done with the PO. |
| An open board from an earlier chat | Continuation | the board's | "Continue the [phase name] board." | Not a new phase — the board's own mode carries on, so its rituals are already set. Commit anything stranded first (the session-end rule), then keep working the board. |
| A board waiting at its next kind | Kind chat | the board's | "Build the [phase name] board." · "Survey the [run name] run." · "Deepen the [phase name] board." · "Close the [phase name] board." | The queue row's continuation when the board split the phase (§ The phase pipeline): the chat sets the board active and runs the kind its `stage:` names, at the level the Levels line declares for it — **build** or **basic layer** builds, verifying the board as leads; **survey** walks the whole run with the PO; **deepen** makes one surface good; **close** — always a fresh chat — reads the phase's paper cold and runs the close. Each chat's level is fixed at its open. |
| Questions, reading, thinking out loud | Not a phase yet | — | "How do the touch bands work?" | No mode, no board — reading is never gated. The first edit is the line: at it, name the shape that fits and open its board (see the shared rules). |

### The queue-shaping phase — Shapes what's next

**Purpose:** An idea forms and nobody is doing it yet: capture it while it's fresh — a row on the queue and the seed behind it, holding the context the eventual phase will open from. The routine way work of any mode enters the queue when no phase's own open or close is doing it: add a row and write its seed, split one row in two, reorder what comes next, drop a row the project outgrew — or lay out a **run**: an idea bigger than one phase, shaped as an ordered set of rows with seeds, each seed naming the run and the kinds its board will pass through, inside a stated bound (a week, a date). Runs are editable, not fixed. It ends at the shaped queue — the phase launches in its own session, with fresh eyes on the seed.

**Reads first:** The indexes, then depth only where the idea touches. Shaping is a search problem, not a comprehension one: you need to know what already exists and where to look, not to hold the rule-set in context.

**Home ground:** The queue — its rows in the ROADMAP's What's Next and their seeds in `planning/queued/` — plus the tracker rows the idea absorbs.

**Careful:** The rest of the trackers, swept for overlap rather than restructured. Rows are proposed, never slipped in — the PO owns what lands on the ROADMAP, which is commitments-tier.

**Gated:** The rules, strategy content, product behavior, and other phases' boards — their `## Raised` excepted, which is a note rather than an edit of the board's work (§ Rules shared by all modes). Suggestions, never decisions, is what separates a shaper from a gate; a rules defect found while shaping is raised, and a system phase lands it.

**Opening ritual:**

1. **Open the chat with the friction, not the feature** — "I keep hitting X and there's no row for it," "these two rows are really one phase" — and agree the scope with the PO: the queue is the PO's ground, so shaping is done with the PO, never solo.
2. **Open a board** from `_queue-shaping-template.md` (`mode: queue-shaping`) — a few lines is the right size, and it never carries a Levels line: this mode runs as one chat, always, at whatever level you set at open — the ordinary working tier for straightforward shaping, higher when the idea is tangled or the queue's order is genuinely in question. **Then name the chat** — set its title from the convention and record it on the board, asking only when the title is not derivable (§ Rules shared by all modes).
3. **Orient in two tiers.** Tier 1 — scan the index: every heading in `decisions.md`, every FC and open-question title, every punch row's title, the ROADMAP and its queue, plus § Session starters and the rules shared by all modes. Tier 2 — deep-read only what the idea touches, usually two to four entries; leave the rest at their titles. The scan is trustworthy only while *absent from the index* means *absent* — a heading that hides its content (an untitled tracker row, an entry named for its phase instead of its call) is a hole in the index, and it gets fixed where it lives rather than read around.

**During:** shape, and shape actively — sweep the trackers for items the idea absorbs, check the open boards, the queued rows and the strategy shelf for overlap and conflict, propose the shape, mode and kind beyond what the PO arrived with, and push back when the thing isn't phase-shaped at all. Then the bookkeeping: every row added gets its seed in `planning/queued/` in the same edit, and every row dropped takes its seed with it — the match between them is checked at build time, so a half-done edit shows up as a drift alarm. Writing a seed is not doing the work; the phase stays on its board. It never settles product strategy — a strategic question found while shaping goes to Open Questions — and wanting to launch the work immediately is the signal it was never queue work: stop shaping and open the phase directly instead.

**Closing ritual:**

1. **Hand off for verification** — present the shaped queue (the rows and their seeds) and the **canon diff** (§ Rules shared by all modes) for the PO's confirm; the ROADMAP is commitments-tier, so a shaped queue is nearly always a canon diff of one hunk. The board isn't deleted until the PO confirms.
2. Log to `decisions.md` only when the *reasoning* would surprise someone in six months — the rows themselves speak.
3. One mode-pure commit, **pushed**; **board deleted** (the rows and seeds are the record).

### The product phase — Builds the thing

**Purpose:** A thesis, the change the phase sets out to make. Then the build, then a walkthrough you drive point by point. The deepest ritual of the four, because this is where the product ships. On its own a product phase runs open → build → close; inside a **run** it runs open → basic layer → survey → deepen → close, so the basic layer of everything exists before anything is polished (§ The phase pipeline).

**Reads first:** The strategy docs, whole. Then whatever this particular phase answers to.

**Home ground:** Product code and feature docs.

**Careful:** Strategy docs and roadmap content. Updated when the work genuinely bears on them, never in passing: a walkthrough decision the PO ratified, or a structured challenge when new work presses on an old commitment.

**Gated:** The rules themselves. CLAUDE.md, this file, the ROADMAP's *structure*, the `/system` code. Not forbidden: suggest the edit and a system phase lands it.

**Opening ritual:**

1. Open the board from `_product-template.md` (`mode: product`) with its thesis stated; fold the phase's **seed** into the board, and remove row + seed per the shared rule (§ Rules shared by all modes). Declare `stage`, `status` and `run` in the frontmatter, and the Levels line — one level per kind the board will run; the open is the **open** kind's work, and every later kind arrives at what it declares (§ The phase pipeline). **A product phase opens from its seed.** Arriving without one, shape the seed first — a fresh open chat opens from it.
2. **Then name the chat** — set its title from the convention and record it on the board, asking only when the title is not derivable (§ Rules shared by all modes).
3. Orient — run the **Opening Checklist** (`product-lifecycle.md` → Opening a Product Phase): Ring 1 reads the strategy shelf whole, Ring 2 actively aligns to the docs this phase answers to; align or challenge.
4. Confirm thesis + scope with the PO — no task moves to in-progress before this.

**During:** work only from the board; decide-and-flag; keep the walkthrough doc current as you build (`product-lifecycle.md` → During a Phase). When the build commits, the building kind hosts the **walkthrough** — the PO walks every O/V point, point by point (`product-lifecycle.md` → Walkthrough); review is the build chat's last stretch, not the close's first. In a run, the **basic layer** walks flow- and feature-level O items only and moves its V items to the board's Deepening section; the **deepen** kind walks them, device-tested (§ The phase pipeline).

**Closing ritual:**

1. Confirm the **walkthrough** passed — the building kind hosted it when the build committed (`product-lifecycle.md` → Walkthrough); the close does not begin until its O list is empty and every V point holds. In a run, a member board closes when its deepen walkthrough passes; the run board closes last.
2. The **Closing Checklist** (`product-lifecycle.md` → Closing a Phase) — decisions propagated to home docs and the load-bearing ones lifted to `decisions.md`, feature docs updated, trackers pruned, ROADMAP re-oriented. Here the **close** kind takes over: fresh eyes at the declared level (§ The phase pipeline).
3. Walk the PO through the **canon diff** (§ Rules shared by all modes).
4. **Distill + delete** — a compact record replaces the board and walkthrough, and the close lands as its own mode-pure commit, **pushed**.

### The system phase — Tends the rules

**Purpose:** The docs, the work model, and the dashboard itself. Always done together, never solo. It runs open → build → close.

**Reads first:** The rules themselves — the standing sections whole, and the ones marked `Read when` only if this work fires them. The decisions log by its headings, opened where the work touches it.

**Home ground:** The docs, the rules, the molds, and the code behind the dashboard.

**Careful:** Prior entries in `decisions.md`: amend with a new dated entry, and never rewrite one silently — supersede or merge by the dated forms that file states. And ripples into product-facing docs when a rule changes: repoint the references, leave their content alone.

**Gated:** **Product behavior**: features, flows, product copy, seeded content, and the *content* of strategy docs. The band is **purpose, not file location**: production code is home ground while the edit serves the system's own surface, and gated the moment it adds or changes what the product does for its users. That surface is `lib/system.ts` and `app/system/`, plus the styleguide, the design tokens and the shared component patterns wherever they live. It never settles product strategy in passing either: a strategic question that surfaces goes to Open Questions rather than being decided here. Not forbidden: suggest it and a product phase lands it.

**Opening ritual:**

1. **Name the friction** this phase fixes, and agree the scope with the PO — system work is always done *with* the PO, never solo.
2. **Open a board** from `_system-template.md` (`mode: system`) sized to the friction — a few lines for a small fix, workstreams for a build. Max one open; may run alongside a product phase, but never opens mid-walkthrough (doc churn collides with phase edits). **Declare the Levels line in the same breath** — one level per kind; the open is the **open** kind's work, and build and close arrive at what it declares (§ The phase pipeline). **Declaring levels means this phase opens from a seed;** collapsed, it opens direct from the friction.
3. **Then name the chat** — set its title from the convention and record it on the board, asking only when the title is not derivable (§ Rules shared by all modes).
4. **Orient by trigger, not by list.** Read this file whole *except* the sections carrying a **`Read when:`** line — those are read only when their moment fires, and this work's may (§ Frontmatter maintenance). Every other governance doc is read when its own frontmatter `read-when` matches the work, `implementation/system-surface.md` included; CLAUDE.md was read at session start, which is its ritual, and is not read twice. Then **scan `decisions.md` by its headings**, deep-reading only the entries this work touches, and check the doc tiers — the log is lookup context, not standing context, and reading every settled call cold is not what aligns a phase. Both scans carry the same honest-index caveat as the queue-shaping phase's orient (§ The queue-shaping phase). Reopening a settled call is a structured challenge (§ Doc Tiers), not a silent rewrite.

**During:** keep it lean — **a system pass adds to the rule-set only to close a gap or a contradiction, and names which on its board; otherwise it leaves the rule-set the same size or smaller.** Silence and self-contradiction are what prose has to fix; everything else that grows the rules is bloat carrying a rationale. ("Rule-set" = the governance docs: this file and CLAUDE.md.) Log decisions in `decisions.md` **as they're made** (this mode writes there directly) — **and read each entry back as you write it, the read `product-lifecycle.md` → Closing a Phase step 2 defines, because a system entry reaches no close that would run it.** When the build commits, the build kind hosts the **walkthrough** (`product-lifecycle.md` → Walkthrough, from `_walkthrough-template.md`) — standard for system phases: delegated execution needs explicit review, and the sharpest defects come from the review surface.

**Closing ritual:**

1. **Hand off for verification.** Before deleting anything, present the phase's durable output for the PO's final read — the artifact that outlives the board: the `decisions.md` entries, the **canon diff** (§ Rules shared by all modes), the surface/build state (`/system` renders, drift alarms silent), and anything worth a second look. The board isn't deleted until the PO confirms. (The walkthrough reviewed the work during the build; this handoff ratifies the record.)
2. Every non-obvious call landed in `decisions.md` (challenges logged win or lose).
3. `implementation/system-surface.md` and/or this file updated in the same change, if the system's behavior changed.
4. `last-reviewed` bumped on every doc **reviewed** — not the ones only mechanically touched (§ Doc Tiers → Stamping `last-reviewed`).
5. Lands as its **own commit** (or PR), described as system work — mode-pure, and **pushed**.
6. **Board deleted** (git is the record; `decisions.md` carries the calls). A build-scale system phase that shipped something durable leaves a compact record in `archive/phases/`, like a product phase.

### The side phase — Sweeps the small stuff

**Purpose:** Small logged fixes, an open question, a research pass. Tracker-born work that runs alongside the other phases, usually **several** items at once (a **sweep**) rather than one. Runs as one chat, always — one kind, sweep or research, and never split (§ The phase pipeline). If an item grows a thesis it stops, because that is product work now.

**Reads first:** The items it pulled, and the docs for the code they touch.

**Home ground:** The code it changes, and **the tracker items it pulled**.

**Careful:** The feature docs describing the code it changed. Updated at close, `last-reviewed` bumped.

**Gated:** The rules, other boards, strategy, and tracker *restructuring* (moving your own items is not reformatting the file). **Another board's `## Raised` is the exception** — writing a find there is not editing that board's work (§ Rules shared by all modes). Resuming a `paused` board is gated too, and the default answer is no: ask first. Not forbidden: surface it and the PO routes it to the right mode.

**Opening ritual:**

1. **Open a light board** from `_side-template.md` (`mode: side`) listing the tracker items pulled — e.g. "Sweep — P87 · P88 · P92" or "Explore §5". **Then name the chat** — set its title from the convention and record it on the board, asking only when the title is not derivable (§ Rules shared by all modes). Orient: read each pulled item's refs and the feature docs of what it touches before acting.
2. **Check file-level overlap with the active phases' in-flight edits.** If they collide: defer the item, let the other phase settle those files first, or brief the session on the concurrent changes. (A side sweep and an open product phase editing the same file is the failure mode this prevents.)
3. **Spawned tasks only:** declare the files it expects to touch in the spawn prompt (Files: list) so the PO can spot overlap before spawning.

**During:** stay on the pulled items. Meaningful new scope → surface it, don't expand silently. A find about a surface another **open** board owns → write it into that board's `## Raised` (§ Rules shared by all modes): a sweep touches many surfaces, and that section is the one part of another board this mode may write. If an item grows a thesis or cross-surface coupling → stop; it's product-shaped — propose resuming an open board — `waiting` or `paused` — opening a new one, or deferring the rest; the PO picks.

**Closing ritual:**

1. **Hand off for verification** *(in-session closes; spawned/worktree tasks use the PR as the gate).* Before deleting anything, present the phase's durable output for the PO's check, shaped to what it produced: **code / UI work** → each changed surface as a pointer, `who's looking → /url → what to expect`; **research** → the doc's `summary:` + its load-bearing findings to sanity-check, and the tracker/question it answers. Plus the **canon diff** (§ Rules shared by all modes — "none" is the common case here), the tracker rows being moved, and anything flagged. The board isn't deleted until the PO confirms. (No walkthrough doc — side work is quick; this is its in-chat verification moment.)
2. Feature docs whose described behavior changed → updated; `last-reviewed` bumped on those (§ Doc Tiers → Stamping `last-reviewed`). **Load-bearing calls → `decisions.md`** — a side phase leaves no archive record, so the log is the only place a call it made can survive its board.
3. **Its tracker rows moved in the same PR** — punch rows removed, §N markers updated, FCs promoted/removed; research lands its doc in `strategy/research/` (frontmatter + `summary:`) and updates the spawning marker. Nothing ends without its trackers moving.
4. One focused, mode-pure commit, **pushed**; **board deleted** (the moved rows + the commit are the record). **Spawned/worktree tasks additionally:** rebase onto current `main` before completing (conflicts are the side phase's problem, not the merger's — stale-vs-main work doesn't land), push a remote branch, open a PR as the merge surface.


### The parts — the model is a kit

This model is built from five parts, and every one of them is yours to reshape. That is the difference between adopting a method and owning a system: a part you can explain is a part you can change. Each part below says what it is and what defines it; what you can do with them — change them included — is § Adjustments, just below.

#### Phase

**Is:** The unit of work — any chunk of work run through the rituals, in exactly one mode. Opens as a board, closes by distill + delete.
**Properties:** A mode (or a kind within one) · a goal or thesis · an orient set (what it reads at open) · touch bands · an opening and closing ritual · a board template · a `stage:` naming the kind it sits at, a `status:` of active, waiting or paused, a `run:` when it belongs to one · declared chat levels, one per kind, when its board carries a Levels line (§ The phase pipeline).

#### Mode

**Is:** A phase's flavor — the setting that fixes every property at once. Four ship: the product phase (builds the thing), the system phase (tends the rules), the side phase (sweeps the small stuff), the queue-shaping phase (shapes what's next).
**Properties:** Purpose · the touch bands · opening ritual · during-rules · closing ritual · a board template (`phases/_*-template.md`) · the sequence of kinds its boards pass through — each kind the shape of one session, with its own open, close, reads and level (§ The phase pipeline): product runs open → build → close, or open → basic layer → survey → deepen → close inside a run; system runs open → build → close; side runs sweep or research in one session; queue-shaping runs one, shaping a run included.

#### Ritual

**Is:** A named set of steps bound to a trigger. No phase is ritual-free — and rituals are not phase-only: session start and session end run rituals too.
**Properties:** A trigger · the steps · what it reads · what it leaves behind (a board, a commit, a handoff).

#### Trigger

**Is:** The moment a ritual fires. Six exist here, each naming what it fires: phase open (the mode's opening ritual) · phase close (the mode's closing ritual) · session start (reading `CLAUDE.md` — that *is* its ritual) · session end (commit and push the open board — see the shared rules) · push (the publish — see the shared rules) · kickoff (the run-once bootstrap — § The Kickoff).
**Properties:** The event · the ritual bound to it · who runs it — you, the agent, or the build.

#### Band

**Is:** The edit permission a phase carries for each doc family: home ground (edit freely) · careful (deliberate, never in passing) · gated (another mode's ground — suggest, don't edit). Bands gate pens, not eyes: reading is never gated.
**Properties:** The three bands · each mode's mapping of docs to bands — the three band lines in its mode section.

### Adjustments — allowed, never required

None of these are things you should do. They're things the model won't break under, when you want them — each names the moment you'd want it. Make the change deliberately: edit the section that owns it, commit, and check that `/system/method` renders your version. The standing warning cuts both ways — a rule that no longer fits how you work is drift already; you're just the one obeying it.

- **You keep opening the same shape of session and it has no name** → name it as a kind. The test is threefold: it recurs, it has its own open or close (its own opening line, its own deliverable, or its own reads), and it lives inside a mode's sequence — tuning a step for the kind is fine (the research kind landing its deliverable in `strategy/research/` is the worked example; the survey kind building nothing is another); needing its own template, badge or band lines is a mode argument, not a kind. Then it's a bullet in § The phase pipeline or a sentence in the host mode's Purpose, and a line in § Session starters.
- **You want something to happen at a moment nothing fires** → bind a ritual to a trigger: write the steps where the person acting on them will read them. The session-end rule entered the model exactly this way.
- **A ritual step keeps getting skipped, or costs more than it catches** → edit or delete it in place; the numbered lists render as written. Chronic skipping is data: enforce the step or remove it deliberately, but don't keep obeying a rule you've already abandoned.
- **A mode's ground doesn't match who actually edits what** → re-draw its band lines. The one rule worth keeping whatever you draw: reading is never gated.
- **The boards don't record what you actually want to remember** → edit the molds (`phases/_*-template.md`); every new board inherits the change.
- **You want a fourth mode** → the one change that costs code: a heading in the parsed shape, a board template, and a parser change (`getWorkModel` in `lib/system.ts`). Weigh a kind first; it's nearly always enough.
- **A settled rule has stopped fitting** → reopen it deliberately: a structured challenge (§ Doc Tiers), logged win or lose. The model applies this to itself.

---

## The phase pipeline — one phase across chats, kind by kind

<!-- PARSED by lib/system.ts (getPhasePipeline) -> /system/method (§ The phase pipeline, the page's kind layer).
     Shape: the Read when: line, the lede paragraph after it, `- **Kind** (level) text` bullets, and the
     trailing bold-led rule paragraphs. The Read when: line renders as the section's gate on the page — it is
     the condition under which the kind layer applies at all, so it is content here, not just a reader's cue.
     Deleting the whole section is allowed — the page then renders the arc without the kind layer; a present
     section whose lede or bullets parse empty trips the drift banner.
     Spec: docs/implementation/system-surface.md -->

**Read when:** a board carries a **Levels** line — you're writing one at a phase open, or you're a chat picking up a board at the kind its `stage:` names.

**A phase is a board passing through kinds in order, and a kind is the shape of one session: what it reads, what it does, what it leaves behind, and the level it runs at.** Each chat holds **one capability level, fixed at open**, because switching model or effort mid-chat degrades the work — where the level changes, the chat changes. The change is a **seam**, and a seam is a kind's close followed by the next kind's open: the outgoing chat commits the board, sets it `waiting`, advances `stage:`, pushes, and hands you the next kind's opening line (§ Session starters). Your part is the segmenting; every ritual is built into the kind and runs on its own. Small work skips the seams: a board with no Levels line runs its kinds in one chat, in order — the kinds are still the steps. The mode sets the sequence: **product** runs open → build → close on its own and open → basic layer → survey → deepen → close inside a **run**; **system** runs open → build → close; **side** runs one kind, sweep or research, in one session; queue-shaping runs one, and shaping a run is its second shape. The six kinds, each at the level the board declares:

- **Open** (high) opens the phase: verifies the seed, orients on the mode's set, agrees scope and thesis with the PO, writes the board — `stage`, `status`, `run` declared, the Levels line sizing every kind downstream and the close's read (which `Read when:` triggers it is expected to fire) — and on a run board writes **Considered**: the alternatives and challenges weighed before building — and the run's **picture** (`planning/<run>-picture.md`). Sizing is ratified beside "Scope agreed with the PO." Open stays the sizing authority afterwards: raises come back to it, and it amends the board for whatever has not opened yet.
- **Build** (standard) builds a standalone phase: verifies the board at open the way any session verifies a seed — leads to re-check, licensed to challenge — writes the walkthrough with evidence attached as it builds, and hosts the PO's run-through. It never changes its own level: work too big for the level is a raise.
- **Basic layer** (standard) builds the first pass of every surface a run board names, and stops at basic: the surfaces exist, the main flow works end to end on seeded data, the real content is in, the layout is a first draft and stays one. Its walkthrough carries flow- and feature-level O items only; the V items it writes move to the board's **Deepening** section unwalked. A new idea mid-build goes to Deepening too — never into the current kind. Clear this kind across the run before the survey opens.
- **Survey** (high) reads every board in the run and walks the whole with the PO as each audience, building nothing: directions, features and alternatives are its O items, and the run board's walkthrough holds its decisions. It drafts the shown/launch/later table on the run board, writes each member board's Deepening section — what makes that surface good, with the deferred V items under it — and may send a board back to basic layer or open a new one into the run.
- **Deepen** (standard) makes one settled surface good, one board at a time. It reads the board and its Deepening section, the survey's decisions, the feature docs it touches, the Vision, and the decisions log by its headings — the shelf stays a free pull, and a deepen chat that finds itself pressing on strategy raises it rather than editing. Full walkthrough: V items walked, device-tested.
- **Close** (high, always a fresh chat) knows the phase only from its paper — board, walkthrough, decisions entries, the diff. It reads the project context cold, raises misalignments, proposes the distillation, and runs the close; the PO ratifies. A member board closes when its deepen walkthrough passes; the run board closes last, with the compact record for the whole. A phase that cannot be distilled from its documents had an insufficient record, and that is itself a finding. Close may read past its declared triggers when evidence leads there — bands gate pens, not eyes — and reports the divergence, so the sizing miss reaches open as feedback.

**A run is many small boards moving through the kinds together, inside a stated bound.** One product board per chunk, each carrying `run:` with the run's name and `stage:` with the kind it sits at; the **run board** is one more board from the product mold, holding the thesis of the whole, Considered, the shown/launch/later table and the member list, with no workstreams of its own — **and its picture**: `planning/<run>-picture.md`, from `_run-picture-template.md`, linked from the board's `Picture:` line and written by the open kind — the loop the run builds, the aspirational site map, and who owns which parts, a reading aid whose every fact has a home elsewhere. The default is to clear a kind across every board before any advances — build the basic layer of everything first, survey once, then deepen — and it is a default, not a gate: a board drops back a kind by editing its `stage:`, and new work joins as a new board at basic layer. **A paused member does not block the run, and is not silent either:** the next kind's open raises it — the survey already reads every board in the run — and the run advances past it deliberately or not at all. The raise is what makes it deliberate. One board is `active` per mode at any moment and the rest of the run sits `waiting` or `paused`; a session that picks one up sets it active first. **The run board is the spine of its members, not a competitor for that slot:** the slot counts *sessions*, and the run board hosts one only at its own kinds — its open, its survey and its close. So it sits `waiting` while any member is being worked, and a run between kinds, with every member waiting too, has **none active** — a real state, not a gap in the record. Shaping a run — the rows, their seeds, the kinds each will run, the bound — is the queue-shaping phase's work (§ The queue-shaping phase); a run's boards open together in one open chat, or one at a time as the run grows. **The run's close reconciles the picture before deleting it:** the aspirational site map against the derived one (`/system/site`, read from the routes directory) — what exists in both is done; what only the aspiration holds goes to the queue, to Future Considerations, or is dropped with a note in `decisions.md`. The loop map is lifted to a durable authored home — the vision, or the feature doc for the flow it draws — never deleted; then the picture doc goes with the run board.

**A collapsed phase that outgrows small splits at the seam.** The tell is a decision turning into a build. The collapsed chat has already done open's work — seed verified, orient run, scope agreed, board written — so it raises the change with the PO, amends the board with a Levels line, commits, and hands over the next kind's opening line; the chats from there carry the kind-led titles.

**Every close leaves the pipeline feedback.** Three questions shape the next chunk of work rather than the pipeline's fate: does under-sized work sail through unraised · does open's spot-check earn its keep · and, from a **collapsed** phase, did its arc run without ceremony a split would have needed. The first two are every close's to answer; the third is only a collapsed close's, because a split phase has no evidence about collapsing.

**Subagents stay inside a chat.** A session fans mechanical stretches out to subagents on its own — a build chat's workers, an open or close chat's reading sweeps — and that is the session's call, never a step you take. The boundary: anything the PO must converse with is a chat; a subagent is dispatched and judged by its chat, inherits its bands, and runs at or below its level.

**Escalation is notes up, never self-upgrade.** No chat changes its own level. A build chat raises; open rules — amend the board, or continue the kind in a fresh chat at the new level. Every handoff crosses by commit: the board at open's close, the build and walkthrough before review, verdicts on the doc before close runs. Not on the doc = did not happen.

**Review reviews evidence, never narrative.** A walkthrough item links its proof — command output, a diff hunk, a verify run, a screenshot — never a claim about it; a coherent story about broken work passes any review that reads only the story. Verdicts are written on the walkthrough, one writer per lane: open rules per item — **pass · query · fail · escalate** — and on a build chat's challenges — **accepted · declined with reason · escalated**; close states its findings — **defect** (back to the building kind, which means the board goes `paused` at the kind that owes the work — that is how "back to" becomes a state rather than a sentence; a session draining a `## Raised` entry owed to a kind the board has already passed reaches the same verdict and sets the same state, which is why that case needed no trigger of its own) · **plan error** (open + PO) · **out-of-scope** (a suggested seed — the PO owns rows) · **clear**. The PO's run-through stays load-bearing throughout.

**Crossing a seam is one sentence.** The outgoing chat closes its kind — commits the board, sets it waiting, advances `stage:`, pushes — and hands you the next kind's opening line, so you never have to spot the seam yourself. Open a fresh chat at the level the board declares for that kind and say the line: "Build the [phase name] board." · "Survey the [run name] run." · "Deepen the [phase name] board." · "Close the [phase name] board." (§ Session starters). The sentence is all you say: the new chat reads the briefing at session start, then the board, sets it active, and runs its kind's ritual from the canon on its own — starting by setting its own title, because a kind chat's title is knowable at its open and at no earlier moment (§ Rules shared by all modes). The rituals are the session's job, not steps you carry in your head, and yours to reshape (§ Adjustments) when they stop fitting.

**Sizing the levels.** Open declares them, in the project's tier words, one per kind the board will run: `open high · build standard · close high`, or for a run `open high · basic layer standard · survey high · deepen standard · close high`. The judgment-dense kinds — open, survey, close — run high; the building kinds take what the work honestly needs — the ordinary working tier for most builds, the cheap tier only when the stretch is truly mechanical, and mechanical stretches mostly belong to subagents anyway; close runs at or above the kind before it. Unsure? Size up: an under-sized chat can only raise what it notices.

**Levels are named in the project's own tier words, never as models.** The mapping from tier to model or effort belongs to the project's briefing file, because the rituals ship to any harness. Seeds carry an expected-weight note so the PO can size the open chat before starting it.

---

## The Kickoff — the bootstrap before the loop

<!-- Prose only — NOT parsed by lib/system.ts (deliberately not a mode; getWorkModel still parses exactly the four phase headings above). The kickoff is the one-time ignition, not part of the recurring cycle. -->

**Read when:** once, at the very start of a project — or when you want to know why the bootstrap isn't a mode of its own.

The four modes govern the **recurring** work cycle. The **kickoff is the ignition that runs once, before the cycle begins** — the bootstrap that turns an empty template into a project. It is deliberately *not* a mode, because it breaks the two traits every mode shares:

- **Modes recur; the kickoff happens exactly once, ever.**
- **Modes orient against the existing shelf; the kickoff has nothing to read — its job is to *write* the shelf** every later phase will align to (or challenge).

Two more things make it an outlier, and they're features:

- **It's interview-shaped.** It pulls the project out of the user — the seeded Open Questions are its prompts — and explains the system + its options as it goes, rather than building from a brief.
- **All ground is open — the one exception to the touch bands.** It makes both system choices (stack, CLAUDE.md, ROADMAP structure) *and* product choices (Vision, Scope, the first thesis), because it's *creating* the ground the bands later protect. You can't gate strategy content from a phase whose whole job is to author it, and you can't run a product phase to serve a vision that doesn't exist yet — the chicken-and-egg is exactly why the kickoff sits outside the modes.

**How it ships and runs:** the template ships with the kickoff board **already open** at `phases/kickoff.md` (it's never re-run, so there's no template mold). Its board carries `mode: system` for the badge — it's meta-setup, done with the user — flagged as the bootstrap. Work it as a guided conversation; the step-by-step lives in the root `KICKOFF.md` (one home, many references — the board points there). At close it is **distilled + deleted** like any board, and the mode loop begins: from here on, every phase runs in one of the four modes and the touch bands apply as written.

---

## Glossary

<!-- PARSED by lib/system.ts (getGlossary) -> /system/glossary + the hub. Changing this section's SHAPE
     (the '- **Term** — definition' bullet form) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

The system's terms, defined once. Used consistently everywhere — docs, boards, the `/system` surface (which renders these definitions from this section).

- **PO** — the product owner: the human the work is done with and for. Every close ritual hands off to the PO; walkthroughs are driven by the PO. In a solo project, that's you wearing the reviewer hat.
- **Phase** — the work unit: any chunk of work run through the rituals, in exactly one mode. Opens as a board, closes by distill + delete.
- **Session** — one chat, holding one capability level fixed at open and serving one **board-kind**: a split board's single kind, or a collapsed board's whole arc (§ The phase pipeline). Never two boards. A phase survives a force-ended chat, and a fresh session picking its board back up is continuation, not error-recovery. Names itself when its title is known — `Phase name · mode` collapsed, `kind · Phase name · mode` in a split phase — with each title recorded on the board.
- **Mode** — a phase's flavor: the product phase (builds the thing), the system phase (tends the rules), the side phase (sweeps the small stuff), or the queue-shaping phase (shapes what's next). The mode sets the ritual's focus, the board's template, the orient set, and the touch bands; how heavy a phase runs is its board's **Levels** line — one level per kind.
- **Level** — the capability a chat runs at, fixed at chat open and never changed mid-chat. Named in the project's own tier words, never as a model — the tier→model mapping lives in the project's briefing file.
- **Kind** — the shape of one session: what it reads, what it does, what it leaves behind, and the level it runs at, with its own open and close. A phase is a board passing through kinds in order, and the mode sets the sequence. Eight exist: open · build · basic layer · survey · deepen · close (§ The phase pipeline), sweep · research (side). Earned by recurrence, never declared for symmetry — the test lives in § Adjustments, each kind's opening line in § Session starters.
- **Stage** — the kind a board currently sits at, declared in its `stage:` frontmatter and advanced by each kind's close. What a session reads first when it picks a board up.
- **Run** — many small product boards moving through the kinds together inside a stated bound, each naming the run in `run:`, plus a **run board** holding the thesis of the whole, Considered, the shown/launch/later table and the member list, and linking its **picture** (`planning/<run>-picture.md`: the loop, the aspirational site map, who owns which parts — reconciled against `/system/site` at the close, then deleted). Clear a kind across the run before advancing, by default. Shaped by queue-shaping; see § The phase pipeline.
- **Kickoff** — the one-time bootstrap that runs before the mode loop: it writes the strategy shelf (rather than orienting against it) and opens all ground because it's creating everything. Not a mode — the ignition. See "The Kickoff" above.
- **Board** — a phase's worklist and running record while open, in `phases/`, created from its mode's template. `status: active` while a session works it, `waiting` when it cleared its kind, `paused` when it stopped mid-kind with nobody on it (its `stage:` set back to the unfinished kind); one active per mode, and a paused board holds no slot. Scale varies by mode: product boards are heavy (workstreams + a walkthrough sibling); side boards are light (the tracker items pulled in); system boards fit the friction; queue-shaping boards are a few lines. Every mold carries `## Raised` whatever the scale — the section other boards write their finds into. Always `tier: working` while open; distilled and deleted at close — product phases leave a compact record.
- **Raised** — a find about a surface another **open** board owns, written into that board's `## Raised` section: what was found or changed, where, which board found it and when, and what the receiving session owes (judge · verify · nothing, FYI). Any mode may write one, because a note is not that board's work — and **a note is never an item**: the receiving session **drains** the section at its open, authors its own O or V item where a ruling or a check is owed, and deletes the entry. Crossing re-authors, which is how the receiver takes ownership. Undrained entries hold the close; a closed board has no section, so that find goes to a tracker row or the queue (§ Rules shared by all modes).
- **Seed** — a queued phase's accumulation space, one file in `planning/queued/` for any mode: a pitch, dated notes, what is settled and what is still open, candidate scope, refs — never tasks. Folds into the board at phase open and is deleted.
- **Queue** — the ROADMAP's What's Next: upcoming planned work of any mode, one mode-tagged list, every row carrying a seed. A staging area, not a gate. Each phase maintains its own row: removed at open, written as the work names it or at close.
- **Queue-shaping** — the fourth mode: the phase that captures an idea and its context as a row + seed — adding, splitting, reordering or dropping queue rows when no phase's own open or close is doing it. A two-tier orient, one chat that never splits, done with the PO. See § The queue-shaping phase.
- **Ritual** — a named set of steps bound to a trigger: a mode's opening steps (orient + touch-check included), during-rules, and closing steps — and not phase-only: session start, session end, and push run rituals too (§ The parts). No phase is ritual-free.
- **Trigger** — the moment a ritual fires: phase open, phase close, session start, session end, push, or the run-once kickoff. Bind a ritual to a trigger by writing its steps where the person acting on it will read them (§ The parts).
- **Touch bands** — a mode's three editing tiers: **home ground** (edit freely, per the board), **careful** (update deliberately when the work bears on it, never in passing), **gated** (another mode's ground — suggest, don't edit). Bands gate pens, not eyes: reading is never gated.
- **Walkthrough** — a collaborative review doc: "Open for your call" + "Worth verifying" points, passed one by one with the PO before the phase can close. Every product and system phase runs one. Only the agent's own calls become O items, and a resolved one leaves the list for the Decisions log — so the list shows what still needs the PO, never what already got their answer. A **working surface**: consumed at close and deleted with the board, never archived.
- **Canon diff** — the ratification gate at every close: before its board is deleted, a phase walks the PO through every change it made to bedrock- and commitments-tier docs (CLAUDE.md included). Runs inside the system and side phases' verification handoff and as its own step before the product phase's distill-and-delete.
- **Tracker** — one of the three standing lists holding *candidates* — quick, lean task notes waiting between phases: the punch list (P##), the Open Questions log (§N), and Future Considerations (FC##). Phases pull items at open (a side phase usually pulls several — a sweep) and move the rows at close.
- **Tier** — a doc's review cadence: bedrock · commitments · working. Docs sink toward bedrock by surviving; reopening a settled one takes a structured challenge.
- **The law** — "derived, never authored": every `/system` page renders from the docs at build time. To change a page, change its source doc; if they disagree, the docs win.

---

## The Planning Trackers

<!-- PARSED by lib/system.ts (getTrackerModel) -> /system/trackers. Changing this section's SHAPE
     (the tracker table columns, the 'How work flows' bullets, the bold 'Shared rule' lede) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

**Read when:** you're filing, moving or pruning a tracker row, or deciding where a loose piece of work goes.

Three running lists in `planning/` hold **candidates** — quick, lean task notes that aren't on a board or in the queue. Each is a different **stance** on not-yet-done work — keep an item in the one that matches its stance, and move it when the stance changes. Phases pull from them at open; side phases usually sweep several at once. Keep the notes lean: an item that bloats, or a cluster of connected items, is a phase trying to be born — pull it out.

| Tracker | Holds | Unit | Default exit |
|---------|-------|------|-------------|
| `punch-list.md` | Known small fixes (≤30 min) | the fix | **Removed** when fixed — the commit is the record |
| `Open Questions & Assumptions Log.md` | Unanswered questions blocking future work | the question | **Compressed** to a one-line pointer when resolved |
| `Future Considerations.md` | Known directions waiting for a trigger | the trigger | **Removed** when shipped (archive is the record), or **promoted** when the trigger fires |

**How work flows between them and into phases:**

- An **Open Question** resolves → it becomes a **Future Consideration** (direction now known, trigger pending), a **punch-list** item (small fix), a **phase** (coordinated work), or just a decision recorded in its home doc.
- A **Future Consideration**'s trigger fires → it **promotes out** to the punch list, a phase board, or feature scope.
- A **punch-list** item grows past ~30 min or sprouts an open design call → it **promotes** to a phase board (or to Open Questions if the open part is a question).
- Any of them, once it's multi-task with real design thinking → opens a **phase** (the rows leave the tracker; the board gets the cohesive chunk).
- Any of them, needed **sooner than later** → gets a **seed** on the queue, or opens a board directly, depending on how soon it'll be picked up.

**Seeds (`planning/queued/`) — the fourth stance, one file per queued phase, any mode.** A seed is *committed work accumulating context*: the ROADMAP row stays brief (1–2 sentences), and the seed holds the growing plan — a pitch, dated **Notes & finds** (any mode may append a note when something relevant surfaces), what is **settled and open** (the calls the phase inherits, and the fork it has to close first), candidate scope, refs — plus a `mode:` in its frontmatter that badges the roadmap card. **Never tasks or workstreams** — a task list in a seed is a shadow board; if you're writing one, open the phase. Distinct from a Future Consideration (an FC is a *maybe* waiting on a trigger; a seed's phase is already on the queue). **Every queued ROADMAP row carries a seed** — a bare one keeps the template's full section structure even where sections hold little. The row's refs live in the seed, not the ROADMAP (one home, many references). At phase open the seed feeds the board and is **deleted**; it never outlives the queue.

**Shared rule — prune on resolve.** None of these is an archive. When an item is done it *leaves* — removed, or compressed to a pointer at its home doc / phase archive. Reassessment is ritualized at phase open (scan for overlap + fired triggers) and phase close (prune shipped, compress resolved). Don't let finished items accumulate behind banners or strikethroughs — that bloat is the thing these rules exist to prevent.

---

## Doc Tiers & Review Physics

<!-- PARSED by lib/system.ts (getTiers + getTierPhysics) -> /system/tiers + doc staleness flags. Changing this section's SHAPE
     (the tier table's columns (Stale-after drives the flags) and the bold physics paragraph labels) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

**A doc's tier says how guarded it is** — what it takes to change it, and nothing else. Tier follows from what the doc is about, not from a rank to climb: most docs sit where their subject puts them (a tracker is working by nature, the vision is bedrock by nature). Movement happens, but it's the exception — see Sinking, below.

| Tier | What lives there | To change it | When to re-check | Stale after |
|------|-----------------|--------------|------------------|-------------|
| **bedrock** | The settled vision (`strategy/Vision.md`) | Structured challenge — logged whether it succeeds or fails | Every phase open — reading it *is* the check | — |
| **commitments** | Strategy models, implementation references, feature docs, this file, `decisions.md`, ROADMAP | Deliberate — it's a promise, so changing it is a decision and lands in `decisions.md` | At phase boundaries, or when building contradicts it | 90 days |
| **working** | Active boards, docs mid-revision, and all three trackers — Open Questions, Future Considerations, the punch list | Freely — that's what the tier is for | Constantly, by being used | 30 days |

**Read is not review.** Bedrock is the *most-read* tier and the *least-changed* one — a foundation's whole job is to be the thing every session aligns to. Guarded means hard to change, never rarely consulted. But reading is *how* a doc earns a re-check: you read the vision at a phase open, and if it no longer matches the world, that mismatch is what a structured challenge is for. When to read is set by each doc's `read-when` and its mode's opening ritual, not by tier.

**Stamping `last-reviewed`.** It records when someone last confirmed the doc is *accurate* — not when its bytes last changed. A material edit bumps it, and so does a deliberate check that finds nothing to change (the purest case). A mechanical edit — a ref repoint, a rename, a typo, a link fix — does **not**: you fixed a token, you didn't read the doc.

**No clock on bedrock.** A vision untouched for 200 days is a foundation holding, not rot; flagging it would nag us to churn the one thing that shouldn't churn. Bedrock has no timer because it has something better: it is read at every phase open, so a foundation that stopped matching the world gets caught by use, not by a calendar.

**Sinking (down, toward foundational):** nothing *starts* at bedrock — docs earn their way down by surviving contact. A working draft that gets built against and holds becomes a commitment; a commitment that holds across phases can sink to bedrock. A sink is recorded in `decisions.md` with a date and what it survived.

**Structured challenge (reopening a settled tier):** requires three things stated up front — the *reason*, *what has changed* since it settled, and *the proposed revision*. Challenges are logged in `decisions.md` **whether they succeed or fail**. This applies to everything settled, including this system itself. Two guarantees: if we're re-debating something settled without new information, name the tier and move on; if we keep hitting the same wall against a settled thing, the wall *is* "what changed" — challenge it.

Tiers govern **docs**, not coding rules — hard gates (if your project defines any) are rules, not tiers. The tier board renders live at `/system/tiers` with staleness flags; staleness is a signal to review, not an obligation.

---

## Workflow Rules

### No feature sprawl
- If it's not on the phase board, don't build it without discussion.
- UI tweaks and bug fixes during a phase are fine, but new features require a phase home.

### Task references
- Every task should reference the docs it depends on.
- Before starting a task, **read the referenced docs**. After finishing, **update them if anything changed**.

### Frontmatter maintenance
- Every doc has YAML frontmatter: `status`, `tier`, `last-reviewed`, `read-when` (plus `category`/`tags` where the family uses them).
- **`read-when`** answers *when is this doc relevant to what I'm doing?* — the condition that should pull it open. It is a **read** condition, not a review schedule: a session's opening ritual reads the docs whose `read-when` matches the work.
- **Sections carry the same field when a doc outgrows one answer.** A doc a ritual reads whole can still hold sections only a named moment needs. Such a section opens with a **`Read when:`** line naming that moment, and the ritual skips it until the moment fires; a section with no line is read with the doc. This is what lets an orient step read by trigger instead of by a list of sections somebody has to keep extending. Adding a section to a whole-read doc is therefore a question, not a default: *what fires this?* No answer means it's standing, and it stays unmarked.
- Update `last-reviewed` when you **review** a doc — a material edit, or a deliberate check that finds nothing to change. Not on mechanical touches.
- Valid statuses: `active` (living doc), `draft` (in progress), `archived`.
- `tier`: `bedrock | commitments | working` — see "Doc Tiers & Review Physics."
- **Strategy docs** add `summary:` — the one-line thesis rendered on `/system/strategy`.
- **Feature docs** add: `feature-status: imagined | staged | built`, `feature-kind: product | demo` (if the project has a demo layer), `area:` (domain area, product features only — your own word for the part of the product it belongs to; the Features page groups by whatever areas your docs declare), `routes:` (comma-separated).
- **Boards and seeds** add `mode: product | system | side | queue-shaping` (see "The Work Model"). **Boards** also carry `status: active | waiting | paused` (one active per mode; the light modes never split, so their molds offer `active | paused`), `stage:` (the kind the board sits at), and `run:` (the run it belongs to, or empty).
- These fields are load-bearing: `/system` renders from them (derived, never authored — `implementation/system-surface.md`). A wrong field is a wrong dashboard.

---

## Design & Code Conventions

> **Project-specific — fill at kickoff.** The stack-neutral *principles* below are part of the system and stay; the concrete rules (framework, styling, tokens, naming) are yours to define once the stack is chosen. See `KICKOFF.md`.

### Reuse-first (check before building new)

**Before building ANY new component, abstraction, or pattern, search for an existing one to reuse or consolidate with.** The burden is on the builder to find the existing thing, not on the reviewer to point it out. Do the reuse pass first and **state the result before building** — "the existing thing is X" or "nothing matches, because…". Prefer extending a shared thing (an opt-in prop) over a new one.

### New = flagged, not silent

When nothing fits and new is genuinely warranted, surface it before creating — what you searched, why nothing fits, the proposed shape. Never introduce a parallel variant / abstraction silently.

### _(Project-specific conventions go here — styling system, tokens, naming, accessibility baseline, dead-code discipline, hard gates.)_

---

## Doc Structure

| Folder | What goes here |
|--------|---------------|
| `strategy/` | Product direction, user models, scope. Research **inputs** live in `strategy/research/` — kept separate from the evergreen strategy docs. |
| `planning/` | Cross-phase running lists that feed scheduling: `Open Questions & Assumptions Log.md`, `Future Considerations.md`, `punch-list.md`, and `queued/` (one seed per queued ROADMAP row). A run's picture (`<run>-picture.md`, from `_run-picture-template.md`) lives here while the run is open |
| `features/` | Feature specs — what's built, key decisions, future plans |
| `implementation/` | Technical references, coding standards, component catalog |
| `phases/` | Active boards (any mode) + walkthroughs, plus the `_product-template.md` / `_system-template.md` / `_side-template.md` / `_queue-shaping-template.md` / `_walkthrough-template.md` molds. Closed boards are distilled + deleted; product phases leave a compact record in the archive. |
| `archive/` | Completed/superseded docs kept for reference |
| root | Meta docs (this file, `product-lifecycle.md`, ROADMAP, `decisions.md`, CLAUDE.md) |

**Meeting notes and prep live outside the repo.** They're ephemeral *input*, not project knowledge — whatever a meeting settles lands in `decisions.md`, a strategy doc, or a tracker. `docs/` holds what the project knows, not the conversations it came from.

---

## Doc Hygiene Rules

These prevent the documentation from bloating over time. **Treat these as seriously as the code rules.**

### One home, many references

Every piece of information has exactly one home doc. Other docs reference it — they don't repeat it.

| Information type | Home doc | Other docs should... |
|-----------------|----------|---------------------|
| Product decisions, strategy | `strategy/` docs | Reference: "See strategy/Vision.md" |
| What a feature does, how it works | `features/` doc for that feature | Reference: "See features/<name>.md" |
| Phase-specific tasks | Phase board in `phases/` | Not appear in the Roadmap or feature docs |
| Open questions | `Open Questions & Assumptions Log.md` | Not be duplicated in strategy or feature docs |
| Build history, what was shipped | `archive/phases/` | Not be summarized in the Roadmap |
| Why a rule exists, when it was ratified | `decisions.md` | **State the rule, not its provenance.** No "(ratified <date>)" in a doc's own prose |

**The test:** If you're writing something and it already exists elsewhere, write a reference instead. If you can't point to where it lives, then this is the home — write it here and reference it from elsewhere.

### The ROADMAP and the briefing are not changelogs

The Roadmap tracks: where we're going, the project's stage and what blocks its next step, what's coming next, key strategic considerations. It does NOT track: what phase is open (that's `phases/`), what was built in previous phases (that's `archive/`), or detailed task lists (that's phase boards).

When closing a phase, do NOT add a completion summary to the Roadmap. Take the finished phase off the forward list and archive its board — that IS the record. Let what the phase revealed *re-orient* the forward view, but express it as direction, never as a log of what's done.

**The briefing carries no current-state section at all.** A project's briefing (`CLAUDE.md`) is read in full at the start of every session by every mode, which makes it the most expensive prose the project owns and the one place nobody thinks to prune — so it holds the standing rules and nothing that changes week to week. **What is open lives in `phases/`**, where the board already is and where the briefing's own workflow rules point; direction is the ROADMAP's, a call's reasoning is `decisions.md`'s, what shipped is `archive/phases/`'s. A rule still being trialled is stated where the rule itself is written, not in a status line somewhere else.

**Four rules keep the ROADMAP's current-state section current, and they run at every edit to it** — a close is when the whole section is re-read, not when the rules start applying.

1. **The falsifiable-now test.** Every sentence must be checkable against the project's *present* state — open the doc, load the page, run the command. A sentence you could only check against git history is a log line wearing a claim's clothes, and its home is `archive/` or `decisions.md`. Past-tense verbs and dates are the smell: *closed*, *shipped*, *was fixed*, *now reads N where it read M*, *on <date>*. A date that cites a `decisions.md` entry is a reference, not a claim.
2. **Replace, never append.** A phase rewrites the claims its own work changed, in place. The section grows only where the phase can name the new standing state or blocker that earned the space; otherwise it comes out the same size or smaller. Appending is how a current-state section rots — every phase arrives with something to add and none arrives with something to remove.
3. **A pattern is a lens, not state.** A paragraph that stays true across phases has stopped describing where the project *is*. It moves to Key Considerations compressed to its bold lead, and Where We Are keeps only what is true today.
4. **If a derived surface or a tracker already holds it, it does not go here.** The boards in `phases/` hold what is open, and the dashboard renders them on `/system/work` and at the top of `/system/roadmap`; `archive/` holds what shipped; `decisions.md` holds why a call was made. **Risks are the trackers':** an untested assumption is the Assumptions Log's, a known gap waiting on a trigger is a Future Consideration's, and a risk that stays true across phases is a lens in Key Considerations. What is left is the project's stage and what blocks its next step, each naming the tracker ID that holds it, so the dangling-ID alarm flags the line the day its item resolves. A sentence restating any of these is a second copy of a fact that has a home, and the copy is the one that goes stale. The briefing already obeys this by carrying no current-state section at all.

### When adding new information

1. **Does a home doc already exist for this?** → Add it there, reference from elsewhere.
2. **Am I duplicating something?** → Stop. Write a reference instead.
3. **Am I adding tasks to a strategy doc?** → Tasks belong in phase boards.
4. **Am I making a doc longer?** → Could I make it shorter instead?

### A mold explains itself in one card

A **mold** — the phase and seed templates — carries its "how to use this surface" text as one blockquote led by a bold label, and the sections below it are heading plus items, nothing between. The dashboard renders that blockquote as an inset card with an info icon, so the explainer reads as chrome rather than as content. Rules only a file's *author* needs go in a second card at the foot, which the first real instance deletes.

**It is the molds' voice, not every doc's.** A living doc's opening paragraphs are its content — the ROADMAP says what the queue is, a tracker says what it holds — and they stay prose.

**A mold's placeholders are written `*(like this)*`, never `_(like this)_`.** Both are italics to a markdown reader, but the dashboard renders a mold's fields through an inline renderer that reads `*` only — and teaching it `_` would break the canon's own `_product-template.md · _system-template.md` lists, where the underscores are filenames.

### Periodic cleanup

At every phase close: **trim pass** (cut stale/redundant/duplicated), **challenge the product** (flag anything overcomplicated or inconsistent with the vision), **question the docs** (are we maintaining docs nobody reads? documented twice? could two merge?).
