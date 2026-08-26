---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
tags: [rules, workflow, product]
read-when: "opening or closing a product phase, or preparing a walkthrough"
---

# Product Lifecycle — the product phase's rituals, in full

The detail behind `CONTRIBUTING.md` § The product phase. That section is the summary every session reads at orient; this file is the checklists it points at, read when a product phase opens or closes. It lives apart for that reason: a ritual you *run* is read at the moment it fires, not held in context all session.

Every product phase follows this lifecycle. **Do not skip steps.**

**Template:** New product phases start from `phases/_product-template.md`, which includes embedded opening and closing checklists. The checklists are part of the board — they get marked done alongside the tasks.

## Opening a Product Phase

Before writing any code for a new phase, complete the **Opening Checklist** on the phase board:

1. **Ring 1 — read the strategy shelf whole.** The evergreen strategy docs (`strategy/` root) plus CLAUDE.md and the Work Model. They're few, reading is fast, and this is exactly the set the Careful band lets a product phase touch — a phase can only carefully-edit what it oriented on. Reading the vision here IS bedrock's check-up (it has no staleness clock because it gets read at every open); state on the board, in one line, how this phase serves it. **Align or challenge:** if the work presses on a commitment — or on bedrock — don't quietly bend the work to the doc or the doc to the work; raise a structured challenge (§ Doc Tiers). Sometimes the challenge should win: new ideas pressing on old ones is how new directions, features, and strategy are born.
2. **Read the phase board** in `phases/`. Understand every task and its references.
3. **Ring 2 — active alignment.** The docs this phase is *answerable to*, read as instruction rather than background: every doc the board references, every doc whose `read-when` matches this phase's subject, and any domain gate the project defines (a subject area that always requires reading a specific doc first). Everything else stays a free pull mid-build — reading is never gated.
4. **Review Open Questions** (`planning/Open Questions & Assumptions Log.md`) — your phase's **area**, not all of them. Resolve or flag before building.
5. **Audit for conflicts.** Compare what the phase proposes against what's currently built. Raise anything that contradicts existing code, strategy docs, or feature docs. Don't assume the phase board is correct — it may have been written before recent changes.
6. **Re-check anything flagged stale.** If a referenced doc is past its tier's threshold (§ Doc Tiers — 90d commitments, 30d working), review it now and stamp `last-reviewed`.
7. **Scan the Punch List and Future Considerations.** Check if any open items overlap the new phase's scope — adopt them into the board or note the overlap. If this phase **fires a Future Consideration's trigger**, promote that FC onto the board now rather than building blind to it.
8. **Confirm scope.** If the phase has tasks that feel like they belong in a different phase, or if scope has grown, discuss before starting.

**Enforcement:** Run the checklist from here — the board does **not** copy it (that duplication is what drifts). What the board's *Open notes* records is what the checklist surfaced: the one-line statement of how the phase serves the vision, conflicts found, docs re-checked, scope calls made. No note, no start.

## During a Phase

- Work only on tasks from the **current phase board**.
- **Decide-and-flag — bias toward action.** Make reasonable design and implementation calls during the build instead of stopping at every fork to ask. Two things still get raised mid-build:
  - **(a) True blockers** — you can't take the next step and can't unblock yourself.
  - **(b) Scope or strategy shifts** — anything that contradicts the phase board, expands what the phase ships, affects another phase, or touches a paused phase.

  Everything else — design choices, copy variants, structural picks where multiple answers are reasonable — gets MADE during the build and surfaced as an **"Open for your call"** item on the phase walkthrough. The reviewer ratifies or redirects there. "No feature sprawl" still applies: if the call would EXPAND scope, that's a scope shift and gets raised.
- When you finish a task, update the phase board status immediately.
- If you change a feature, update its **feature doc** in `features/`.
- If you make a significant decision, record it in the relevant feature doc under a "Decisions" section.
- **Keep the shared compass accurate: any ROADMAP current-state claim your work invalidates, in Where We Are as much as in What's Next, and CLAUDE.md's Where We Are** (§ Rules shared by all modes — the rule binds whoever makes the change). A compass line naming work that just shipped reads as a live claim, and the build-time dangling-reference alarm only catches the subset that names an ID. **Noticed something stale on another board's walkthrough? Raise it, don't fix it** — the PO routes it, and its owner re-reads at close.

## Walkthrough (the review stage)

**The walkthrough is a main stage of the phase, not a step inside closing.** Once the build is committed, the phase enters a collaborative review: the PO and the agent go through the walkthrough doc **together, point by point.** This is where the bulk of the design refinement happens — building gets a surface ~80% there; the walkthrough gets it right. **Expect many iterations.** Budget for it; don't rush toward close.

How it runs:

- **The agent prepares the walkthrough doc as it builds** (`phases/<name>-walkthrough.md`, from `_walkthrough-template.md`) — "Open for your call" (O) items, "Worth verifying" (V) items, and a Decisions log. It is ready for review when the build is committed; it is **not** authored from scratch at close.
- **Every checkable item names where to look + what to expect, and holds exactly one check.** Each O/V item carries the exact URL/view + a one-line expected result. If an item bundles two surfaces or behaviours, split it into two.
- **Only the agent's own calls become O items.** A change the PO **directed** is not one — filing it asks the PO to ratify their own instruction and makes the close gate meaningless. A directed change that *reverses settled work* is a structured challenge (§ Doc Tiers), logged in `decisions.md` win or lose.
- **The PO drives the review with the agent.** Each O/V point is passed or sent back. **A resolved O item is deleted from the list and its outcome written as one line in the Decisions log** — never checked off in place, never grown where it sits. The O list shrinks as the walkthrough runs, so it always shows exactly what still needs the PO. Identifiers are never reused.
- **The phase is not ready to close until the O list is empty and every V point has passed**, with the Decisions log reflecting what actually shipped.

Closing comes *after* the walkthrough passes, and **consumes** it — the Decisions log is the propagation worklist, and the file itself is deleted with the board at step 8. **A walkthrough is a working surface and is never archived.**

## Closing a Phase

These steps are the **canonical closing process — the single source of truth.** Work through them in order. The phase board does **not** repeat them; it carries only **phase-specific** close items under its "Close notes" section. Do not copy these steps onto the board — that duplication is what drifts.

1. **Confirm the walkthrough passed.** The O list is empty and every V point checked, acceptance criteria holding against the running app. **Re-read the remaining items against the running app first** — the phase's own later work is the commonest source of drift, and a concurrent phase touching these surfaces is the other. Other boards raise what they notice rather than editing your items, so this re-read is the net that catches the rest.
2. **Sweep the walkthrough's "Decisions surfaced" section.** A plain log — process each entry in order: update the named home doc per the `→` annotation, then check it off in the phase board's Closing Checklist. **The phase cannot close until every entry has been propagated** — the walkthrough is deleted at step 8, so an unpropagated entry is a lost decision. **Then lift the load-bearing subset into `decisions.md`** (What / Why / Instead of / Scope, newest first) — only entries that would surprise a reader in six months or that future-us might reopen, **each written as the call that survived rather than the path to it.** Then read what you wrote back against the index: every heading states its call, and no entry already there covers it — if one does, merge rather than add (`decisions.md` names the two forms). Scoped to this phase's own entries; the log is not re-audited at every close.
3. **Update all affected feature docs.** Scan for anything else the phase changed (component patterns, edge cases, copy conventions). The feature docs must reflect the new reality.
4. **Update the Open Questions log.** Close any questions this phase resolved — and **compress each resolved item to a one-line pointer at its home doc.** Add any new questions that emerged.
5. **Update ROADMAP.md — re-orient forward.** The phase's row already left the roadmap at open; refresh the Where-We-Are current-phase line. Then update the forward view *informed by what this phase built and revealed*. Keep it strictly **future-focused** — never log *what shipped*. The Roadmap tracks objectives and what's next, not history.
6. **Review CLAUDE.md.** If the phase changed navigation, key components, or project structure, update the project instructions.
7. **Review the running trackers — Punch List and Future Considerations.** Check completed punch-list items since the last close for doc impact. Then **prune Future Considerations**: every FC this phase **shipped** is removed; every FC **partly** shipped is rewritten to lead with the remaining open work; every FC whose **trigger fired** is confirmed promoted out.
7a. **The canon diff** (§ Rules shared by all modes). Gather every change this phase made to bedrock- and commitments-tier docs (CLAUDE.md included) — steps 2–7 wrote most of it — and walk the PO through it for ratification. Most hunks are quick confirms of walkthrough decisions; the step catches what nobody decided.
8. **Distill and delete.** Write a **compact record** (~15 lines: frontmatter with `status: archived` + dates, the thesis, the what-shipped close banner, a pointer to its `decisions.md` entries) at `docs/archive/phases/<name>.md`, then **delete the full board and walkthrough files**. Precondition: steps 2 and 7a fully done.
9. **Trim pass.** Skim the Roadmap, CLAUDE.md, and touched docs. Cut anything stale, redundant, or duplicated.
9a. **Structural audit.** Run these checks — any hits get fixed before phase close:
   - `grep -rl "status: archived\|status: complete" docs/phases/` should return nothing but the `_*-template.md` molds (never) and legitimately paused phases. Anything else — delete it; the archive copy exists.
   - Compare filenames in `docs/phases/` vs `docs/archive/phases/`. Any overlap means a cleanup was skipped — delete the live copy.
   - Scan docs in `strategy/`, `features/`, `implementation/` with `last-reviewed` older than 21 days. Review or bump.
10. **Strategic review.** The most important step. Stop building and think. Read the Open Questions log, the Roadmap, the relevant strategy docs, and the next phase's scope. Then present a brief covering: **what changed** (how the work shifts understanding), **open questions worth resolving now**, **alternatives and challenges** (overbuilding? underbuilding? simpler paths?), **research suggestions**, and **next phase readiness**. This isn't a checkbox — it's a thinking mode.

**Enforcement:** The closing checklist items must all be checked off before a new phase can be opened.
