---
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "Update as items are walked, edit as scope adjusts"
---

# Phase Name — Walkthrough

Verification checklist for the Phase Name phase. **Concise by design** — three priority categories instead of an exhaustive per-workstream checklist. Trust that automated checks + visual sanity passes ran during the build; surface only what's worth the reader's judgment, what risks regression, and what they should glance at to confirm the phase thesis lands.

**How to use:** run the app, walk top-to-bottom (categories ordered by "needs your eyeballs most" → "least"). `[ ]` not yet walked · `[x]` walked, no issues. The settled calls collect in the Decisions log at the bottom.

**This is a working surface, not an archive.** It is consumed at close: the Decisions log is the propagation worklist, and then this file is deleted along with the board (`CONTRIBUTING.md` → Closing a Phase, steps 2 and 8). Nothing here has to survive, because everything that matters has left for its home doc by then.

**Any change that makes an item here inaccurate fixes the item in the same edit** — whoever made the change, including a concurrent board of another mode (`CONTRIBUTING.md` → Rules shared by all modes). Flagging it on your own board does not work: that board is deleted at your close and the stale item outlives it.

<!-- Optional context block — phase-specific seed data, dates that matter, etc. Keep it terse. Drop entirely if not needed. -->

---

## Open for your call

Decisions the author made that warrant a second look — direction, not bug-hunt. These are the calls made during the build instead of stopping to ask — surfaced so the reviewer can ratify or redirect (see `CONTRIBUTING.md` → "During a Phase" → decide-and-flag). Each one describes a real call the author made that someone else might land differently, and tells the reader the quickest path to see it in context.

Identifier prefix: **`O`** (O1, O2, ...). **Bullets, not checkboxes** — an item is open, or it is gone.

**What enters: only calls the author made alone.** A change the PO **directed**, or picked from options offered, is never an O item — filing it here asks the PO to ratify their own instruction, and it turns the close gate into checking your own work. One exception, and it does not live here either: a directed change that **reverses settled work** is a structured challenge (`CONTRIBUTING.md` → Doc Tiers & Review Physics), logged in `decisions.md` win or lose.

**What leaves: a resolved item is deleted, and its outcome becomes one line in the Decisions log.** Nothing is checked off in place; no item grows its rationale where it sits. The list only ever shrinks as the walkthrough runs, so what is on screen is exactly what still needs the reviewer. **Identifiers are never reused** — O7 stays O7's name after O7 is gone, so anything that referred to it still resolves.

- **O1. {One-line framing of the call.}** Why it could go another way. ({who's looking} → `/url` to see it.)
- **O2. {The next one — its own call, its own pointer.}** ...

---

## Worth verifying

Interaction nuance, complex state, round-trips, anything author-confidence is genuinely uncertain about. Each item describes a behavior the reader needs to drive themselves — an automated check or a static screenshot wouldn't have caught it.

**Every check names where to look and what to expect.** Give each item the exact URL/view + a one-line *Expect:*. A check the reader can't locate is not a check. Add a *who's-looking* qualifier only when who's looking changes what's shown (an edit/self surface, a permission-gated view, a viewer-specific default); omit it when the surface looks the same to everyone.

**What earns a V item: a behavior a human has to drive.** Multi-step round-trips, interaction nuance, anything whose result depends on who is looking. **Not** "confirm the text now says X" — an author verifies their own edits before the walkthrough starts, and filing that here spends the reviewer's attention on finished work. If a check can pass unattended, it is not a V item; run it and move on.

**One check per item — split freely.** If an item bundles two surfaces or two behaviours, that's two items. No penalty for many small, clearly-pointed items; the penalty is a fat item that buries three checks behind one URL.

Identifier prefix: **`V`**. Group a workstream's checks under a `### V1 — {workstream}` sub-heading and **number each `V1.1`, `V1.2`, …**. These keep their checkboxes: a passed check is evidence, and it stays.

### V1 — {workstream}

- [ ] **V1.1 {What this one check proves.}** `{/exact/url}` → {the one action}. *Expect:* {the single observable result}.
- [ ] **V1.2 {The next distinct check — its own item, its own URL.}** ...

---

## Surfaces to glance _(usually skip)_

**Only include when V can't naturally exercise a shipped surface** — a styleguide render, a static seeded view, a print/export view, a CSS-only state no behavioral test reaches. Driving a V item already lands the reviewer on the surface, so a separate glance pass is almost always redundant. Most phases have 0 G items. If this section ends up empty, delete it before shipping.

Identifier prefix: **`G`** (G1, G2, ...).

- [ ] **G1.** {who's looking} → `/url` — one-line description of what should be there.

---

## Decisions surfaced during walkthrough

The calls the walkthrough settled, one line each, newest at the bottom. Every entry carries a `→ target-doc.md` annotation naming where it lands. At close this section **is** the propagation worklist: each entry is written into its home doc, and the load-bearing ones lift to `decisions.md`.

**Two rules keep this honest. They are the two ways this section has actually failed:**

1. **Current state, not an event log.** A superseded entry is **edited**, never appended beside the one it replaces. The signal you got this wrong: at close, one surface has two entries describing it differently.
2. **The call, not the path to it.** Three rounds of back-and-forth produce **one** entry — the decision that survived, written as though it had always been the answer. Reasoning goes to the doc the `→` names, not into the line here: this section is transit, and it is deleted at close.

Format:
```
- **{Decision in one line.}** {Optional one-line context.} → `features/foo.md`
- **{Implementation-only change.}** {What/why.} → no feature-doc update needed
```

<!--
================================================================================
Authoring conventions — read before writing or expanding this walkthrough.
================================================================================

THE THREE CATEGORIES — what belongs where:

  Open for your call — calls the author made where another reasonable person
    would land differently. Lead with the call itself. Zero of these is fine:
    "No open calls — everything landed per spec."

  Worth verifying — behaviors that need a human at the keyboard. The entry
    test is in the body, with the section.

  Surfaces to glance (usually skip) — only shipped surfaces V can't exercise.
    If it overlaps any V item, delete it.

ANTI-PATTERNS the structure exists to fight:

  1. Listing every viewer × surface permutation. If verifying X once implies it
     works everywhere (same code path), list it once.
  2. Spelling out what another item exercises in passing.
  3. Pure-visual checks dressed up as verification. Either it's fine (don't list
     it) or it isn't (fix it, don't ask the reader to flag it).
  4. Decisions buried in workstream items — promote to the Decisions log, shrink
     the item to "verify X behaves correctly."
  5. Bundled or unpointed checks — one check per item; every item carries an
     exact URL + a one-line Expect. Two surfaces = two items.

The rules governing what enters the O list, what leaves it, and how the
Decisions log is written are in the BODY, next to the sections they govern —
they are read while the walkthrough is being walked, not only while it is
being authored.
-->
