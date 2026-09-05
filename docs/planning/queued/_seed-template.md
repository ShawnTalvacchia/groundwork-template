---
category: planning
status: queued
tier: working
last-reviewed: YYYY-MM-DD
read-when: "when work touches this phase's territory — append a dated note; at phase open, fold into the board and delete this file"
mode: product | system | side | queue-shaping
phase: "Exact ROADMAP row name"
queued: YYYY-MM-DD
priority: low | medium | high
---

<!-- PARSED by lib/system.ts (getQueuedSeeds) -> /system/roadmap cards. The frontmatter
     (mode/phase/queued/priority) is all the card takes from this file, plus a count of the
     `## Notes & finds` bullets; its sentence is the ROADMAP row's own Goal cell, never the
     pitch below. `phase` must match the ROADMAP row name exactly - the /system drift banner
     flags a mismatch. `mode` badges the card, `priority` sits beside it as a pill. -->

# Phase Name — {product | system | side | queue-shaping} seed

One-paragraph pitch: what this phase is and why it's queued.

> **How this works**
>
> **This seed opens a phase in the mode its heading names**, and that mode sets the board's template, the rituals it runs, what it reads at open and what it may edit. Keep the heading and the `mode:` field above saying the same thing — the field badges this seed's card on the roadmap, and the heading is what a person sees when they open the file.
>
> **A seed holds notes and pointers, never tasks.** It's the accumulation space between "queued on the ROADMAP" and "board opens" — the plan starts here, the work doesn't. A task list here is a shadow board; if you're writing one, open the phase. At phase open the seed feeds the board and is deleted.
>
> **Every queued ROADMAP row carries a seed** — a bare seed keeps this full section structure even where sections hold little or nothing; the container ready to receive notes is the point. Doc refs are relative markdown links (from `planning/queued/`, e.g. `[features/foo.md](../../features/foo.md)`) so they navigate in the doc reader; other identifiers stay plain text. A seed carries an **expected-weight note** when someone can already say one — how heavy the phase looks, in the project's tier words — so the PO can size the opening chat before starting it (CONTRIBUTING.md → The phase pipeline).
>
> **`priority` is optional, and it is not the queue's order.** The list is written in whatever order it is written in; `priority` says how badly a row wants picking up next, which a list read top to bottom cannot say once modes run concurrently. Set it when you can honestly rank this against the other rows, leave it off when you cannot, and the card simply carries no pill.

## Notes & finds

- **YYYY-MM-DD** — dated notes append here as relevant things surface in other sessions (any mode may append; shaping scope is the phase's job, not the note's).

## Settled & open

- **Settled:** *(calls already made with the PO that the phase inherits rather than re-makes — not findings; a finding is a lead the phase re-checks at open)*
- **Open:** *(the fork the phase has to close first — what its open cannot agree scope without answering)*

## Candidate scope

- Bullets of what the phase will *probably* cover — direction, not commitment. The board's Opening Checklist re-derives real scope from these plus the world as it stands then.

## Refs

- [[doc-or-file]] — why it matters here
