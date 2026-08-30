---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
read-when: "at the start of every session, before any other doc"
---

# Project Instructions

These rules override defaults. **This is a fresh template** — fill the `_(fill at kickoff)_` blocks in your first session (see `KICKOFF.md`).

## The Work Model — phases, modes, rituals

Canonical rules + glossary: `docs/CONTRIBUTING.md` → "The Work Model." Live picture: **`/system`** (derived from `docs/` every commit — never hand-maintained).

- **A phase runs the arc open → build → review → close, carried by planner, executor and closer chats — each at one fixed level from the board's Levels line — or by one chat with the roles collapsed for small work** (`docs/CONTRIBUTING.md` → The phase pipeline). **Its mode — product · system · side — sets ritual focus, template, orient set, and touch bands.** Every phase opens a board in `docs/phases/` from its mode's template (`mode: product | system | side`) and closes it in the same arc; one phase per **session** (chat) is a strong default, not a law. Opening a session: match your arrival to a shape — § Session starters in `docs/CONTRIBUTING.md` (rendered at `/system/method`); a reading-only session needs no board, and the first edit is the line that opens one. **Close = distill + delete:** decisions → `docs/decisions.md`, behavior → feature docs, tracker rows moved, the canon diff ratified by the PO (changes to bedrock/commitments docs — `docs/CONTRIBUTING.md` → shared rules), board deleted; product phases leave a compact record in `docs/archive/phases/`. Concurrency: one open board per mode; commits are mode-pure and name their board. **A phase belongs to one project — the repo its board lives in;** a sibling project's work is handed over, never done from here.
- **The queue = the ROADMAP's What's Next** — upcoming planned work of any mode, one mode-tagged list; every row carries a **seed** (`docs/planning/queued/`) where context accumulates. A staging area, never a gate: urgent work opens a board directly. **Each phase maintains its own row and reads the rest** — its row removed at open (then scan what's left), written at close (then feed a dated note into any seed the work bore on), row and seed always together; shaping the queue at any other time is a **queue-shaping** session (a system-phase kind, not a fourth mode, and the one kind with its own cheaper two-tier orient). **Trackers hold candidates, not queued work** — an item that bloats or clusters promotes into a phase.
- **Orient, then edit — the touch bands gate pens, not eyes.**
- **Chat levels — your tier→model mapping (fill at kickoff; the canon names tiers, never models):** high = [your strongest model / max effort] · standard = [your working model] · cheap = [a fast model, for mechanical stretches]. Boards declare tier words on their Levels line; this mapping is where the words meet a model. Every mode's opening ritual reads its core set whole (product: the full strategy shelf) and actively aligns to the emphasized set; reading is never gated. Bands: **home ground** (edit freely), **careful** (deliberate, flagged), **gated** (another mode's ground — suggest, don't edit). Orientation is **align or challenge** — work pressing on a settled commitment raises a structured challenge; sometimes it should win. (The one-time **kickoff** bootstrap is the exception — all ground is open, because it's *creating* the shelf the bands protect; see `docs/CONTRIBUTING.md → The Kickoff`.)
- **Product phase:** carries a thesis; usually queue-born. After the build commits, the **walkthrough** is a main chunk of the phase — a collaborative point-by-point review WITH the user (`docs/phases/<name>-walkthrough.md`). Before closing: show the user the Closing Checklist.
- **System phase:** governance docs are its home ground (this file, CONTRIBUTING, ROADMAP structure, `/system` code), along with production code that *is* the system's surface — the band is purpose, not file location, and product behavior stays gated. Always done with the user; closes with a light in-chat verification handoff.
- **Side phase:** tracker-born — a **sweep** of several punch/question/FC items on a light board. Home ground: the code it changes + **its own tracker rows**. Grows a thesis → stop, it's product-shaped. Closes with an in-chat verification handoff. Default for "resume a paused phase?" is **no — ask first.**

## Workflow Rules

1. **Work from the current phase board** in `docs/phases/`. Check it before starting.
2. **Read referenced docs** before starting a task. Update them if anything changed.
3. **Doc frontmatter:** every doc has `status`, `tier`, `last-reviewed`, `read-when`. Bump `last-reviewed` only when you **review** a doc, never on a mechanical touch.
4. **No feature sprawl.** If it's not on the phase board, don't build it without discussion.
5. **Phase close = doc review.** See `docs/product-lifecycle.md` → Closing a Phase.
6. **Push back, don't just comply.** When there's a better approach, make the case — lead with a recommendation, not a menu.
7. **Never run `npm audit fix --force`.** In this dependency tree it "fixes" advisories by **downgrading Next.js to 9.x** — a pre-App-Router version from 2020 that cannot run this app. `npm audit fix` (without `--force`) is safe. See "A note on `npm audit`" below before acting on a vulnerability report.

## A note on `npm audit`

<!-- Delete this section once npm audit runs clean; it describes a real, current state, not a permanent rule. -->

A fresh `npm install` reports around a dozen **high** severity advisories. They are all transitive and none is a live exposure for this app:

- Most are the **ESLint chain** — a denial-of-service in a glob matcher used by a linter that only ever runs on your own machine.
- The rest are **inside Next.js's own bundled dependencies** (`postcss`, and `sharp`, which is only used by `next/image` — a component this template never imports).

They cannot currently be resolved from here. ESLint 10 breaks `eslint-plugin-react`, and the vulnerable packages are bundled inside `eslint-config-next`, so the fix belongs upstream. Dropping `eslint-config-next` would silence the report at the cost of the React and accessibility rules that catch real mistakes — a bad trade.

**What to do:** keep Next.js patched (`npm install next@latest` for patch and minor releases; that is what fixed the last real one). Re-check with `npm audit` after upstream releases. Do not force it.

## Stack

_(fill at kickoff — framework, language, styling, backend, dev-server command, test/lint/build commands. **Do NOT inherit the template's Next.js stack by default** — it hosts the `/system` dashboard, nothing more. Choose from the project's goals and a FRESH check of current tooling/hosting options and costs; state the reason for the choice in `decisions.md`. See KICKOFF.md step 3.)_

## Design & Code Conventions

_(fill at kickoff — the stack-neutral reuse-first + flag-new principles live in `docs/CONTRIBUTING.md` → Design & Code Conventions; add the concrete rules here: styling system, tokens, naming, accessibility baseline, any hard gates)_

## Key Docs

| Doc | What it covers |
|-----|---------------|
| `docs/ROADMAP.md` | Where we are, the queue, the horizon. Never a changelog |
| `docs/decisions.md` | Institutional memory — dated What/Why/Where decisions, newest first |
| `docs/CONTRIBUTING.md` | The Work Model, phase lifecycle, doc conventions, hygiene |
| `docs/implementation/system-surface.md` | The `/system` dashboard's spec — derived-never-authored law, IA, page→source map |
| `docs/implementation/shipping.md` | Identity across every surface (the name and the mark), where the record lives, gate config, renaming later |
| `docs/strategy/Vision.md` | _(fill at kickoff — the bedrock thesis)_ |
| `docs/strategy/Scope & Constraints.md` | _(fill at kickoff — in/out of scope, hard constraints, non-goals)_ |
| `docs/planning/Open Questions & Assumptions Log.md` | Unresolved questions affecting upcoming work |
| `docs/planning/Future Considerations.md` | Known directions waiting for a trigger |

## Strategic Context

_(fill at kickoff — the project's guiding thesis and priorities. Full strategy in `docs/strategy/`.)_

## Core Principles

_(fill at kickoff — foundational rules that shape decisions across the project. Implementation details live in their home docs, not here.)_
