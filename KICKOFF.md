# Kickoff — launching a project from this template

This repo is a **project operating system**, not a codebase: a work model (phases · modes · rituals), doc tiers, planning trackers, and a `/system` dashboard derived from the docs. The machinery is complete. Your first session fills in the project.

**The one rule that makes it work: derived, never authored — and prune on resolve.** The docs are the truth; the dashboard renders them; finished things *leave* (removed, or compressed to a pointer). Keep that discipline and the system stays legible instead of bloating — which is the entire point.

**It's built for agent-assisted work.** `CLAUDE.md` is the standing briefing a coding agent (Claude Code or similar) reads every session — "session" in these docs means one chat. Everything is plain markdown, so it all works by hand too; the rituals just assume an agent doing the mechanical parts while you make the calls.

## What's here

```
README.md                     the front door — replaced with your project's own at kickoff close
CHANGELOG.md                  the template's changes, numbered — deleted at kickoff close; read it at the template's repo
CLAUDE.md                     project instructions (Work Model summary + kickoff stubs)
docs/
  CONTRIBUTING.md             the full Work Model, tiers, trackers, hygiene — the rulebook
  ROADMAP.md                  the queue (empty — you fill it)
  decisions.md                institutional memory (empty)
  upstream.md                 your side of the template's changelog: the marker, your declines, your outbox
  strategy/
    Vision.md                 BEDROCK stub — the thesis; fill first
    Scope & Constraints.md    in/out of scope, non-goals
  planning/
    Open Questions & …Log.md  SEEDED with kickoff questions — answer these
    punch-list.md             empty
    Future Considerations.md  empty
    queued/_seed-template.md   one seed per queued phase
    _run-picture-template.md  the picture of a run: many phases inside one bound
  phases/
    kickoff.md                the bootstrap board — ships OPEN; work it first, then delete
    _product-template.md      the four board molds, one per mode
    _system-template.md
    _side-template.md
    _queue-shaping-template.md
    _walkthrough-template.md  the review doc a product or system phase walks with you
  implementation/
    system-surface.md         the /system dashboard spec (its law + page→source map)
    shipping.md               identity (name + mark), where the record lives, the gate, renaming later
    component-patterns.md     your rules for shared components (empty — they fill as you build)
app/, components/, lib/        the live /system dashboard — Next.js + the doc parsers
app/globals.css                the starter design system (edit these tokens to re-skin)
components/ui/Mark.tsx         the starter mark — one home for the shape, set at kickoff
lib/project.ts                 the project's name + description, set at kickoff
package.json, *.config.*       the web host (Next.js, Tailwind v4)
```

## First run — the kickoff phase (ships already open)

The kickoff is the **bootstrap** — the one-time phase that runs *before* the mode loop (`docs/CONTRIBUTING.md → The Kickoff`). It ships **already open** as `docs/phases/kickoff.md`, so you don't open it — you work it, and it shows up as the active board on `/system`. It's a guided conversation: answer the prompts, and the system explains its options as you go. The board is the checklist; the steps below are the how and why.

**Before the first commit, make sure this copy pushes to your own repo.** Every session ends by committing and pushing, so this comes before anything else. Run `git remote -v` and match what you see:

- **`origin` is the template's repo,** the address on the `template:` line of `docs/upstream.md`. You cloned or copied it. Make an empty private repo on your git host, then `git remote set-url origin <your-repo-url>`. Private, because the repo holds your record.
- **No git at all** (`fatal: not a git repository`). You downloaded it. Run `git init` and make a first commit, then add an empty private repo as `origin`. With the GitHub CLI, `gh repo create <name> --private --source=. --push` does that last part in one line.
- **`origin` is your own repo.** You used "Use this template" on GitHub. Nothing to do.

Not ready for a remote? Stay local: commits work, and pushes start once `origin` exists. The one state never to leave is `origin` pointing at the template.

Then:

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
7. **Meet the styleguide** (web projects). Open [localhost:3000/system/styleguide](http://localhost:3000/system/styleguide), or Structure → Styleguide on the dashboard. Nobody writes it: it is parsed from `app/globals.css` and the shared components in `components/ui/` on every build, so it cannot drift from the code.

   **Whose design it shows.** On day one, the dashboard's: the starter tokens and the components `/system` is built from. If your product is built in this app on the same tokens, the re-skin in step 6 makes this your product's design system too, documented from here on. If your product's design lives somewhere else, another app or its own token file, this page documents the dashboard only. Then give your product's design system a home of its own, such as a feature doc.

   **What it shows.** Four sections, each derived:

   - **Colors.** Token health (what is defined, what nothing uses, what is used but never defined), the semantic families, and *The ladder on every surface*: each text rung and the control boundary, measured on every surface in both themes.
   - **Typography.** The families, the type scale, weights, line heights.
   - **Layout.** Spacing, radius, shadows, border widths, breakpoints.
   - **Components.** Every shared component in one shape, read from its own file: what it is, when to reach for it, a live demo in both themes, its variants, its measured contrast, and who uses it.

   **What is yours.** All of it, by editing the source the page reads:

   - **Values.** Any token in `app/globals.css`. The names stay, and the file's RE-SKINNING note says why.
   - **New families.** A new `SEMANTIC TOKENS — Name` banner in `:root` is a new block on Colors. The file's header says how the banners group the page.
   - **Fonts.** Set `--font-heading` and `--font-body`. The type scale names whichever family it reads.
   - **Components.** A new component in `components/ui/` joins the Components page on the next build. Whatever it lacks shows as a named gap: no docblock, no `@when`, no demo. `docs/implementation/component-patterns.md` says what goes in the docblock and what goes in that doc.

   **After a re-skin, look for one word.** Search Colors and Components for `under`. Each one is a pair your palette put below its contrast floor. The Text and Border comments in `globals.css` say how the ladder is built, so you can solve it again for your colours.

   **Nothing here is a task.** The page shows what is there and never asks you to fill it in today. Something you want and will not do now, a real type pairing say, is a Future Consideration in your own words with your own trigger, the way a deferred mark is.
8. **Set the ROADMAP** — the Goal line, Where We Are, and queue your **first product phase** with a one-line thesis + a seed in `planning/queued/`.
9. **Log the kickoff decisions** in `decisions.md` (the stack choice, the vision as first drafted).
10. **Close the kickoff** with the verification handoff (present the filled shelf for a read), then work the board's close items — they replace the README with your project's own, **delete this file** and the template's `CHANGELOG.md` — and open your first product phase from the roadmap.

After that, work the normal loop: queue → open a phase from its mode's template → orient (align or challenge) → build → (product and system) walkthrough → close (distill + delete). The whole loop is in `docs/CONTRIBUTING.md`.

## Starting a session, after the kickoff

The kickoff is the one session that ships with its board already open. Every session after it starts with you arriving with something, and naming the shape is the first move. The shape sets the mode, and the mode sets the rituals. Three doors cover almost all of it, and each one is a sentence you type.

**A new idea nobody is doing yet.**

> Shape the queue: exports keep failing and nothing planned covers it.

The lightest door, and the one most work should come through. Queue-shaping is a mode of its own, the fourth beside product, system and side. It writes a queue row and a seed, the file where context collects, for a phase of any mode: a build, a research pass, a fix to the rules themselves. A later session opens it with fresh eyes, which is the whole reason shaping and building are separate sittings.

**The next queued thing, ready to build.**

> Open [phase name] from the queue.

The seed names the mode, so the rituals are already set. Its notes fold into a fresh board, and row and seed leave the queue together.

**A pile of small fixes.**

> Run a side phase, sweep: P04 · P07 · P09.

Punch list IDs. They come onto one light board and get worked together, with no queue row needed.

**The queue is a staging area, never a gate.** Work that cannot wait skips it and opens its board directly. Everything else queues first, because the session that builds reads the seed fresh instead of grading its own plan.

**Two things need no door.** A board left open by an earlier chat is a **continuation**, so pick it back up rather than opening anything. Questions, reading and thinking out loud need no board at all; the first edit is the line where a shape gets named.

**Not sure which one you're holding?** Open the queue-shaping door. Its shaping step exists to name the thing: it proposes the shape, the mode and the kind, and pushes back when what you have isn't phase-shaped at all.

### The doors are yours too

Three doors is the short version, and the full set in Session starters is not fixed. `docs/CONTRIBUTING.md` → **Adjustments** is the map: name a **kind** when you keep opening the same shape of work, bind a ritual to a moment where nothing fires, edit or delete a step that costs more than it catches, redraw a mode's bands when they stop matching who edits what. Each one names the moment you'd want it, and none of them is something you should do on day one.

The one thing worth doing deliberately rather than by drift: make the change in the section that owns it, commit it, and check that `/system/method` renders your version. The dashboard reads these docs, so your model is the one it shows.

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
