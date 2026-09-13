---
status: active | waiting
tier: working
mode: product
stage: open | build | basic-layer | survey | deepen | close
run: "" | [the run name]
last-reviewed: YYYY-MM-DD
read-when: When any task is completed or blocked
---

# Phase Name

**Mode:** product · [the rituals this board runs](../CONTRIBUTING.md#the-product-phase-builds-the-thing)

**Project:** *(the repo this board lives in — work outside it gets handed over, not done)*

**Thesis:** *(run boards only — the run in one sentence: the change it sets out to make; delete on a member or standalone board)*

**Goal:** One sentence: what the close leaves behind. Never the criterion — that lives in Acceptance Criteria.

**Picture:** *(run boards only — [planning/<run>-picture.md](../planning/_run-picture-template.md), the one-frame view of the run, written by the open kind from `_run-picture-template.md` and reconciled at the close; delete on a member or standalone board)*

**Levels:** *(none — one chat, kinds run in order | one level per kind: open high · build [tier] · close [tier], or in a run open high · basic layer [tier] · survey high · deepen [tier] · close [tier]; fires: [the `Read when:` triggers the close is expected to fire] — see CONTRIBUTING → The phase pipeline)*

**Depends on:** Previous phases or conditions.

**Refs:** [[doc-1]], [[doc-2]]

---

## Open notes (phase-specific only)

> **Canonical open process** — [product-lifecycle.md → Opening a Product Phase](../product-lifecycle.md#opening-a-product-phase) is the single source of truth. Work through those steps; do **not** copy them here.
>
> List below ONLY what's specific to THIS phase: how it serves the vision (checklist step 1), conflicts surfaced during the opening audit, docs re-checked, scope calls made at open.

- **Session title(s):** *(set at each chat's open and recorded here — `Phase name · mode` collapsed, one line per kind's chat when split: `kind · Phase name · mode`; ask only when the title is not derivable)*
- **Serves the vision by:** *(one line — from `strategy/Vision.md`, read at open)*
- *(other phase-specific open notes go here — delete this line)*

---

## Considered

> **Run boards only — delete on a member or standalone board**
>
> The alternatives and challenges weighed before building, written by the open kind: the shapes this run could have taken and why this one, the settled commitments it presses on and how each was raised. Decisions come from here; the survey re-reads it.

- *(alternative or challenge — what was weighed, what won, why)*

---

## Survey

> **Run boards only — delete on a member or standalone board**
>
> Filled by the survey kind: the audiences walked, and the shown / launch / later table — what the site shows now, what must be good at launch, what waits. Its decisions land on this board's walkthrough and propagate at close. The member list below is the run's roster; each member names this run in its `run:`.

| Surface | Shown | Launch | Later |
|---------|-------|--------|-------|
| *(surface)* | | | |

**Members:** *(one board per chunk, with its `stage:` — the run board closes after the last of them)*

---

## Workstream A — Name

<!-- PARSED by lib/system.ts (getActiveBoards) -> /system/work board progress.
     Task rows are counted by their Status cell (keep it LAST in the row):
       done            -> complete
       todo | in_progress | blocked -> open (counts toward the total)
       deferred | cut   -> excluded from the count (out of scope)
     Legacy `- [ ]`/`- [x]` checkbox tasks under a Workstream heading also count.
     A row whose last cell isn't one of these keywords is ignored, so the
     header + |---| separator + any non-task data table don't inflate the count. -->

> **How to read the workstreams**
>
> Letters are creation-order IDs, not sequence — workstreams get added as the board runs, so don't read A→Z as priority. The **close workstream is unlettered** ("## Close items") and sits last, whenever it was written.

| Task | Description | Refs | Status |
|------|-------------|------|--------|
| A1 | Description | [[ref]] | todo |

---

## Deepening

> **Member boards in a run — delete on a standalone board**
>
> What makes this surface good, written by the survey kind, plus the V items the basic layer wrote and did not walk. The deepen kind works from here and walks every item, device-tested. A new idea that arrives during the basic layer is filed here, never into the current build.

- *(what the surface still needs, from the survey)*
- *(deferred V item — moved here unwalked at the basic layer's close)*

---

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Close notes (phase-specific only)

> **Canonical close process** — [product-lifecycle.md → Closing a Phase](../product-lifecycle.md#closing-a-phase) is the single source of truth. Work through those steps; do **not** copy them here — that duplication is exactly what drifts.
>
> List below ONLY what's specific to THIS phase: the feature docs it touched, outward-facing artifacts to graduate, punch-list items it closes, next-phase dependencies it satisfies. Per-decision doc targets live in the walkthrough's "Decisions surfaced" log.

- *(phase-specific close notes go here — delete this line)*
