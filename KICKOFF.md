# Kickoff — launching a project from this template

This repo is a **project operating system**, not a codebase: a work model (phases · modes · rituals), doc tiers, planning trackers, and a `/system` dashboard derived from the docs. The machinery is complete. Your first session fills in the project.

**The one rule that makes it work: derived, never authored — and prune on resolve.** The docs are the truth; the dashboard renders them; finished things *leave* (removed, or compressed to a pointer). Keep that discipline and the system stays legible instead of bloating — which is the entire point.

**It's built for agent-assisted work.** `CLAUDE.md` is the standing briefing a coding agent (Claude Code or similar) reads every session — "session" in these docs means one chat. Everything is plain markdown, so it all works by hand too; the rituals just assume an agent doing the mechanical parts while you make the calls.

## What's here

```
README.md                     the front door — replaced with your project's own at kickoff close
CLAUDE.md                     project instructions (Work Model summary + kickoff stubs)
docs/
  CONTRIBUTING.md             the full Work Model, tiers, trackers, hygiene — the rulebook
  ROADMAP.md                  the queue (empty — you fill it)
  decisions.md                institutional memory (empty)
  strategy/
    Vision.md                 BEDROCK stub — the thesis; fill first
    Scope & Constraints.md    in/out of scope, non-goals
  planning/
    Open Questions & …Log.md  SEEDED with kickoff questions — answer these
    punch-list.md             empty
    Future Considerations.md  empty
    queued/_seed-template.md   one seed per queued phase
  phases/
    kickoff.md                the bootstrap board — ships OPEN; work it first, then delete
    _product-template.md      the four board molds
    _system-template.md
    _side-template.md
    _walkthrough-template.md
  implementation/
    system-surface.md         the /system dashboard spec (its law + page→source map)
    shipping.md               identity (name + mark), where the record lives, the gate, renaming later
app/, components/, lib/        the live /system dashboard — Next.js + the doc parsers
app/globals.css                the starter design system (edit these tokens to re-skin)
components/ui/Mark.tsx         the starter mark — one home for the shape, set at kickoff
lib/project.ts                 the project's name + description, set at kickoff
package.json, *.config.*       the web host (Next.js, Tailwind v4)
```

## First run — the kickoff phase (ships already open)

The kickoff is the **bootstrap** — the one-time phase that runs *before* the three-mode loop (`docs/CONTRIBUTING.md → The Kickoff`). It ships **already open** as `docs/phases/kickoff.md`, so you don't open it — you work it, and it shows up as the active board on `/system`. It's a guided conversation: answer the prompts, and the system explains its options as you go. The board is the checklist; the steps below are the how and why. Then:

1. **Answer the seeded Open Questions** (`planning/Open Questions & Assumptions Log.md`). They're the fresh-project prompts: who's the user, what's out of scope, the smallest thesis-proving thing, the riskiest assumption. Each answer becomes a decision, a strategy-doc edit, or a queued phase — then delete the question.
2. **Fill `strategy/Vision.md`** (bedrock) and **`Scope & Constraints.md`**. Flip both `status: draft → active` and set their `summary:`. Delete the prompt blocks as you answer them.
3. **Choose the stack** and fill CLAUDE.md's `## Stack` + `## Design & Code Conventions` blocks (the stack-neutral reuse-first principles already live in CONTRIBUTING).

   > **⚠ The template's own stack is NOT a default.** This repo arrives as a Next.js app only because the `/system` dashboard needed a host. That's a decision about the *dashboard*, not about your product.
   >
   > Choose the product's stack from the project's goals and a **fresh check** of current tooling and hosting costs — they change fast, so check the web rather than trusting an assistant's training-data priors or what this repo ships with. If the right stack isn't Next.js, fine: the dashboard lives beside it as its own small app.
   >
   > The test: the kickoff can say why the stack is right in one sentence that isn't "it came with the template."
4. **Name it, everywhere.** One edit to `lib/project.ts` (`PROJECT_NAME` + `PROJECT_DESCRIPTION`, both obvious placeholders) renames every in-app surface: the browser tab, the `/system` wordmark, the front door at `/`, the link-preview image. The wordmark carries the *project's* name on purpose, since "System" is already the first tab.

   **The app boundary is not the identity boundary.** Four more places hold the name, and each is its own edit:

   - `package.json` → `"name"`
   - your git repo
   - the local folder
   - your deploy project, once there is one

   Set them together now. Renaming later is doable but has a trap in the deploy step: `implementation/shipping.md` → Where your project's name lives.

5. **Decide where the record lives — or defer, deliberately.** Your product is public; `/system` is your strategy, decisions, and open questions. Three arrangements, with real tradeoffs, in `implementation/shipping.md` → Where the record lives:

   - **One deployment, `/system` gated** (what ships): simplest, reachable from anywhere with a password, record shares an origin with the product.
   - **Two deployments of one repo**: strongest separation and real per-person access, at the cost of two pipelines.
   - **Local only, for now**: zero config, zero exposure, no access from another device.

   If you're still shaping the system and have no live pages to show, **local-only is a legitimate answer** — record it in `decisions.md` with what would change your mind, and revisit at first deploy. Nothing here has to be wired today. The gate fails closed in production, so a deploy can't quietly publish the record while this is still undecided.

6. **Make the identity yours** (web projects) — the design system, then the mark. In that order, because the mark takes its colour from the tokens.

   **Tokens.** Edit `app/globals.css`; the styleguide re-derives on the next build. Token *names* are load-bearing (the dashboard's utilities come from them); token *values* are yours.

   **The mark.** `components/ui/Mark.tsx` is the one home for the shape, the way `lib/project.ts` is the one home for the name. Swap the path data there and the `/system` wordmark follows. Two more renderers carry the same shape because neither can read your stylesheet: `app/icon.svg` (a favicon has no CSS to inherit) and `app/opengraph-image.tsx` (Satori renders outside CSS entirely). One shape, three files — `Mark.tsx`'s docblock says why, and why its centre is a real cutout rather than a painted one.

   The starter reads `--brand-main`, so it already stops looking like the template the moment you re-skin, before you touch the shape at all.

   **No mark yet? Defer it deliberately, not silently.** A kickoff must never stall waiting on a designer, and "generic placeholder" is a legitimate answer on day one. Write a Future Consideration in your own words with your own trigger — "the first time someone outside the project sees a link preview," say — and move on. The one thing not to do is leave it unowned: the trigger you name is what brings it back.
7. **Set the ROADMAP** — the Goal line, Where We Are, and queue your **first product phase** with a one-line thesis + a seed in `planning/queued/`.
8. **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).
9. **Close the kickoff** with the verification handoff (present the filled shelf for a read), then work the board's close items — they replace the README with your project's own and **delete this file** — and open your first product phase from the roadmap.

After that, work the normal loop: queue → open a phase from its mode's template → orient (align or challenge) → build → (product) walkthrough → close (distill + delete). The whole loop is in `docs/CONTRIBUTING.md`.

## The `/system` dashboard (ships with the template)

The live derived dashboard is already built — a **Next.js/React** app that renders every `/system` page from the docs in `docs/` at build time. Run it:

```
npm install
npm run dev        # → http://localhost:3000/system
```

> **`npm install` will report ~12 "high severity vulnerabilities." Don't panic, and don't force-fix them.** They're all in build and lint tooling that runs on your machine, not in anything your site serves. The real ones get patched promptly and are already applied.
>
> **Never run `npm audit fix --force`.** Here it "fixes" things by downgrading Next.js to a 2020 version that can't run this app. Plain `npm audit fix` is safe. Full explanation: `CLAUDE.md` → A note on `npm audit`.

It boots with **zero drift alarms** against the empty template, so you watch the surface fill in as you do the kickoff. The starter design system lives in `app/globals.css` (edit those tokens to make it yours — the token *names* are load-bearing, the *values* are yours); `app/system/` + `lib/system.ts` + `lib/styleguide.ts` are the parsers and pages — see `docs/implementation/system-surface.md` for the law (derived, never authored) and the page→source map.

**Deploying: your product is public, your record is gated.** `/system` renders your strategy, roadmap, questions, and decisions, so it ships behind a gate (`proxy.ts`):

- Local dev is always open. Nothing to configure.
- Deploying? Set **`SYSTEM_PASSWORD`** and the record sits behind a password.
- Want it public anyway (a demo, an open project)? Set **`SYSTEM_GATE=off`**.
- Set neither in production and `/system` blocks itself, telling you which variable to set. Forgetting can't publish your record.

Choosing between one gated deployment, two deployments, or local-only: `docs/implementation/shipping.md` → Where the record lives. Gate mechanics and host-level alternatives: `docs/implementation/system-surface.md` → The gate.

The methodology works without the web app too — the docs are the source of truth. For a **non-web project**, delete `app/`, `components/`, `lib/`, and the web config files; keep `docs/` + `CLAUDE.md`.
