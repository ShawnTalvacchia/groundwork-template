---
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "Update as items are walked, edit as scope adjusts"
---

# Phase Name — Walkthrough

> **How this works**
>
> A living surface while the phase is open, in two parts. **The first part is yours to walk:** each **O** item is a call the agent made alone, for you to ratify or redirect — settled ones are deleted; each **V** item is a check that needs a human at the keyboard, naming where to look and what to expect — `[ ]` not walked, `[x]` passed; the occasional **G** item is a surface to glance at, nothing to drive. **The second part is what the system absorbs:** the Decisions log at the bottom holds the calls as they currently stand, one line each, and closing writes each line into the doc it names, then deletes this file with the board. The full ritual: [CONTRIBUTING.md → Walkthrough](../CONTRIBUTING.md#walkthrough-the-review-stage).
>
> Work keeps moving while this is open — on this board or another — and that can change the plan an item or a logged decision describes. Both get **updated in place** so what's written is always the current plan (raised with you first when the direction is in question), and nothing here chronicles how it changed: this file records where things stand, never the path taken. History lives in git.
>
> Items are written concisely. Unsure what one means? **Just ask.**

---

## Open for your call

- **O1. {One-line framing of the call.}** Why it could go another way. ({who's looking} → `/url` to see it.)
- **O2. {The next one — its own call, its own pointer.}** ...

---

## Worth verifying

### V1 — {workstream}

- [ ] **V1.1 {What this one check proves.}** `{/exact/url}` → {the one action}. *Expect:* {the single observable result}.
- [ ] **V1.2 {The next distinct check — its own item, its own URL.}** ...

---

## Surfaces to glance _(usually skip)_

- [ ] **G1.** {who's looking} → `/url` — one-line description of what should be there.

---

## Decisions surfaced during walkthrough

- **{Decision in one line.}** {Optional one-line context.} → `features/foo.md`
- **{Implementation-only change.}** {What/why.} → no feature-doc update needed

---

> **Before you write items — then delete this card**
>
> This half is for whoever authors the items, not for the reader walking them. Write your first pass, then delete this card and the `---` above it. Everything the reader needs is in the card at the top.
>
> **Identifiers** — `O1`, `V1.1` under a `### V1 — {workstream}` heading, `G1`. **Never reused:** `O7` stays O7's name after O7 is gone, so anything that referred to it still resolves. O items are bullets, not checkboxes — an item is open, or it is gone.
>
> **What enters the O list: only calls you made alone.** A change the PO directed, or picked from options you offered, is never an O item — filing it there asks them to ratify their own instruction, and turns the close gate into checking your own work. One exception, and it does not live here either: a directed change that *reverses settled work* is a structured challenge ([CONTRIBUTING.md → Doc Tiers & Review Physics](../CONTRIBUTING.md#doc-tiers-review-physics)), logged in `decisions.md` win or lose. **What leaves:** a resolved item is deleted and its outcome becomes one line in the Decisions log. Nothing is checked off in place, and no item grows its rationale where it sits — the list only shrinks, so what is on screen is exactly what still needs the reader.
>
> **An O item has to be legible cold.** This file is read across days, not in one sitting, so an item names the concrete thing on screen — its label, its numbers — the fork that was open, and why you picked your side. "The stats came back plain" is not an item: it assumes the reader is carrying your build in their head.
>
> **What earns a V item: a behavior a human has to drive.** Round-trips, interaction nuance, anything whose result depends on who is looking. **Not** "confirm the text now says X" — you verify your own edits before the walkthrough starts, and filing that spends the reader's attention on finished work. If a check can pass unattended, run it and move on. **One check per item, split freely:** two surfaces is two items, and every item carries its URL **as a markdown link** plus a one-line *Expect*. Link it, do not just name it — the dashboard renders in-app paths as real links, and a reader who has to reassemble an address is one who skips the check. Add a *who's-looking* qualifier only when who is looking changes what is shown.
>
> **G is an exception, not a section to fill.** Only a shipped surface V cannot exercise — a styleguide render, a static seeded view, a print or export view, a CSS-only state no behavioral test reaches. Driving a V item already lands the reader on the surface, so most phases have no G items; delete the section if yours does.
>
> **The Decisions log has two rules, and they are the two ways it has actually failed.** A superseded entry is **edited**, never appended beside the one it replaces — the tell is two entries at close describing one surface differently. And it carries **the call, not the path to it**: three rounds of back-and-forth produce one entry, written as though it had always been the answer. Reasoning goes to the doc the `→` names, never into the line here; this section is transit, and it is deleted at close.
>
> **Four anti-patterns the structure exists to fight:** listing every viewer × surface permutation, where one code path means one item · spelling out what another item already exercises in passing · pure-visual checks dressed up as verification, where either it is fine or you fix it · a decision buried in a workstream item, which belongs in the log with the item shrunk to its check.
