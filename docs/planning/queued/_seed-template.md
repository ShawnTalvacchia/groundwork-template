---
category: planning
status: queued
tier: working
last-reviewed: YYYY-MM-DD
read-when: "when work touches this phase's territory — append a dated note; at phase open, fold into the board and delete this file"
mode: product | system | side
phase: "Exact ROADMAP row name"
queued: YYYY-MM-DD
---

<!-- PARSED by lib/system.ts (getQueuedSeeds) -> /system/roadmap cards. The frontmatter
     (mode/phase/queued/priority) + the first paragraph are the card; `phase` must match the
     ROADMAP row name exactly - the /system drift banner flags a mismatch. `mode` badges the card. -->

# Phase Name — {product | system | side} seed

One-paragraph pitch: what this phase is and why it's queued.

> **How this works**
>
> **This seed opens a phase in the mode its heading names**, and that mode sets the board's template, the rituals it runs, what it reads at open and what it may edit. Keep the heading and the `mode:` field above saying the same thing — the field badges this seed's card on the roadmap, and the heading is what a person sees when they open the file.
>
> **A seed holds notes and pointers, never tasks.** It's the accumulation space between "queued on the ROADMAP" and "board opens" — the plan starts here, the work doesn't. A task list here is a shadow board; if you're writing one, open the phase. At phase open the seed feeds the board and is deleted.
>
> **Every queued ROADMAP row carries a seed** — a bare seed keeps this full section structure even where sections hold little or nothing; the container ready to receive notes is the point. Doc refs are relative markdown links (from `planning/queued/`, e.g. `[features/foo.md](../../features/foo.md)`) so they navigate in the doc reader; other identifiers stay plain text.

## Notes & finds

- **YYYY-MM-DD** — dated notes append here as relevant things surface in other sessions (any mode may append; shaping scope is the phase's job, not the note's).

## Candidate scope

- Bullets of what the phase will *probably* cover — direction, not commitment. The board's Opening Checklist re-derives real scope from these plus the world as it stands then.

## Refs

- [[doc-or-file]] — why it matters here
