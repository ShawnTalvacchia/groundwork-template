---
status: active
tier: working
mode: product
last-reviewed: YYYY-MM-DD
read-when: When any task is completed or blocked
---

# Phase Name

**Mode:** product · [the rituals this board runs](../CONTRIBUTING.md#the-product-phase-builds-the-thing)

**Project:** *(the repo this board lives in — work outside it gets handed over, not done)*

**Goal:** One sentence describing what "done" looks like.

**Levels:** *(none — one chat, roles collapsed | planner: high · executor: [tier] · closer: [tier], fires: [the `Read when:` triggers its close is expected to fire] — see CONTRIBUTING → The phase pipeline)*

**Depends on:** Previous phases or conditions.

**Refs:** [[doc-1]], [[doc-2]]

---

## Open notes (phase-specific only)

> **Canonical open process** — [product-lifecycle.md → Opening a Product Phase](../product-lifecycle.md#opening-a-product-phase) is the single source of truth. Work through those steps; do **not** copy them here.
>
> List below ONLY what's specific to THIS phase: how it serves the vision (checklist step 1), conflicts surfaced during the opening audit, docs re-checked, scope calls made at open.

- **Session title(s):** *(ask at each chat's open, then record the PO's answer here — `Phase name · mode` collapsed, one line per role chat when split: `role · Phase name · mode`)*
- **Serves the vision by:** *(one line — from `strategy/Vision.md`, read at open)*
- *(other phase-specific open notes go here — delete this line)*

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

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Close notes (phase-specific only)

> **Canonical close process** — [product-lifecycle.md → Closing a Phase](../product-lifecycle.md#closing-a-phase) is the single source of truth. Work through those steps; do **not** copy them here — that duplication is exactly what drifts.
>
> List below ONLY what's specific to THIS phase: the feature docs it touched, outward-facing artifacts to graduate, punch-list items it closes, next-phase dependencies it satisfies. Per-decision doc targets live in the walkthrough's "Decisions surfaced" log.

- *(phase-specific close notes go here — delete this line)*
