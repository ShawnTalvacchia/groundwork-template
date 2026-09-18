---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
tags: [roadmap, phases, planning]
read-when: "at the start and end of every phase"
---

# Roadmap

<!-- PARSED by lib/system.ts (getRoadmap) -> /system/roadmap + the hub. Changing this section's SHAPE
     (the Goal line, the Where We Are / What's Next / Key Considerations / On the horizon section headings, the queued-phase table,
     and Key Considerations' `- **Title:** text` bullets) breaks that page silently - the /system drift banner will name it.
     Section ORDER is free and the PAGE FOLLOWS IT - reorder the sections here and /system/roadmap reorders with them.
     Check /system after editing. Spec: docs/implementation/system-surface.md

     WHERE WE ARE says the project's stage TODAY and what blocks its next step, each blocker
     naming the tracker ID that holds it. No dates, no past tense, no log, no risks.
     Four rules hold it there, and they run at EVERY EDIT to it, not only at a close:
       1. Falsifiable now. Every sentence checkable against the project's present state - open the
          doc, load the page, run the command. Checkable only against git history = a log line, and
          its home is archive/ or decisions.md. Past-tense verbs and dates are the smell.
       2. Replace, never append. Rewrite the claim your own work changed, in place. The section
          grows only where you can name the new standing state or blocker; otherwise same size or smaller.
       3. A pattern is a lens, not state. True across phases = it has stopped describing where the
          project IS. Move it to Key Considerations, compressed to its bold lead.
       4. If a derived surface or a tracker already holds it, it does not go here. What is open is
          the boards in phases/, and /system/roadmap renders them first; archive/ holds what shipped,
          decisions.md why a call was made. Risks are the trackers: an untested assumption goes to
          the Assumptions Log, a known gap to Future Considerations, a lasting risk to Key
          Considerations as a lens. A sentence restating any of these is a second copy, and the
          copy is what goes stale.
     A drift alarm fires past 400 words. It only counts; the four rules are the judgement it
     cannot make. Full statement:
     CONTRIBUTING.md -> Doc Hygiene Rules -> "The ROADMAP and the briefing are not changelogs." -->

**Goal:** _(fill at kickoff — one or two sentences on what this project is building toward.)_

**Process:** The Work Model in `CONTRIBUTING.md`; the product phase's checklists in `product-lifecycle.md`. Boards in `phases/`. Archive in `archive/phases/`.

---

## Principles

1. _(fill at kickoff — the guardrails every phase honours.)_

---

## Where We Are

_(fill at kickoff — the project's stage, and what blocks its next step, each blocker naming the tracker ID that holds it. The rules are in the comment at the top of this file.)_

---

## What's Next

**The queue — upcoming planned work of any mode, one mode-tagged list.** Each row carries a seed (`planning/queued/`, badged by its `mode:` — that's where context accumulates); boards are created when a phase opens.

| Phase | Goal | Key refs |
|-------|------|----------|

_(No phases queued yet — the kickoff queues the first one. Every row added here carries a seed in `planning/queued/`, badged by its `mode:`.)_

---

## Key Considerations

Things to keep in mind across phases. Not tasks — lenses.

_(fill as they emerge.)_

---

## On the horizon

Not yet planned, but will become relevant:

- _(fill as they emerge.)_
