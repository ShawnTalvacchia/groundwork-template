---
category: phase
status: active
mode: system
tier: working
last-reviewed: YYYY-MM-DD
read-when: "the first board — work it before anything else; deleted at close, when the mode loop begins"
---

# Kickoff — bootstrap this project (ACTIVE)

**This is the bootstrap phase — it runs once, before the mode loop** (`CONTRIBUTING.md → The Kickoff`). It ships already open; you don't open it, you work it. It's the one phase that *writes* the strategy shelf instead of orienting against it, and the one time all ground is open (system + product), because it's creating the ground the touch bands later protect. Treat it as a guided conversation — answer the prompts and let the system explain its options as you go.

**Full step-by-step: the root `KICKOFF.md`** (one home, many references — this board is the checklist, not the guide). Each item below maps to a KICKOFF.md step.

## Items

- [ ] **Point this copy at your own repo, before the first commit** — `git remote -v`: the template's repo → repoint `origin` at a private repo of your own; no git → `git init` and connect one, or stay local for now; your own repo → nothing to do. Every session ends with a push, so this comes first (`KICKOFF.md` → First run).
- [ ] **Answer the seeded Open Questions** (`planning/Open Questions & Assumptions Log.md`) — who's the user, what's out of scope, the smallest thesis-proving thing, the riskiest assumption. Each answer becomes a decision, a strategy edit, or a queued phase; then delete the question.
- [ ] **Fill the strategy shelf** — `strategy/Vision.md` (bedrock) + `Scope & Constraints.md`; flip both `status: draft → active` and set their `summary:`.
- [ ] **Choose the stack** — fill CLAUDE.md's `## Stack` + `## Design & Code Conventions` blocks.
- [ ] **Name the project, everywhere** — `lib/project.ts` covers every in-app surface in one edit; `package.json`, the git repo, the folder, and the deploy project are each their own. Set them together (`implementation/shipping.md`).
- [ ] **Decide where the record lives — or defer, deliberately** — one gated deployment · two deployments · local-only. Tradeoffs in `implementation/shipping.md`; the choice (including "not yet") goes in `decisions.md`.
- [ ] **Make the identity yours** (web projects) — re-skin the tokens in `app/globals.css`, then the mark in `components/ui/Mark.tsx` (`app/icon.svg` and `app/opengraph-image.tsx` carry the same shape; neither can read a stylesheet). Token *names* are load-bearing; *values* are yours. No mark yet? Defer it as a Future Consideration with your own trigger — deliberately, not as an unowned placeholder.
- [ ] **Meet the styleguide** (web projects) — open `localhost:3000/system/styleguide`: what it derives from `app/globals.css` and your shared components, what is yours to change, and the `under` check after a re-skin. Nothing to fill in; anything you want later is a Future Consideration with your own trigger.
- [ ] **Set the ROADMAP + queue the first product phase** — the Goal line, Where We Are, and one queued row with a one-line thesis and a seed in `planning/queued/`.
- [ ] **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).

## Close items

- [ ] **Hand off for verification** — present the filled shelf (Vision + Scope `active`, ROADMAP set, first product phase queued) for the PO's read.
- [ ] `last-reviewed` stamped on every doc filled/reviewed during kickoff.
- [ ] **Replace README.md with your project's own** — the template's pitch + quickstart have done their job.
- [ ] **Delete KICKOFF.md and CHANGELOG.md** — KICKOFF.md's durable notes already live in their homes (`implementation/shipping.md`, `implementation/system-surface.md`, `implementation/component-patterns.md`, `app/globals.css`, your CLAUDE.md Stack block), and the changelog is the template's, read at its own repo where `docs/upstream.md` points. The template leaves no onboarding behind.
- [ ] **Distill + delete this board**, then open the first product phase from the roadmap. The mode loop starts here.
