# Changelog

Every change the template ships that a project built on it may want. Numbered, newest first, never renumbered.

**Your project's side is `docs/upstream.md`.** Its `template-entry:` is the last entry you reviewed. The entries above it are waiting. Taking them is the upgrade kind, in `docs/CONTRIBUTING.md` under The upgrade kind.

**Each entry lands in the same commit as the change it describes.** So the commit that added an entry is that change. In a clone of this repo, `git log -S "## 3 · " -- CHANGELOG.md` finds entry 3's. An entry that covers earlier commits names them.

**Every entry carries a class, or several:**

- **protocol:** a shape in `docs/` that something else parses, like a frontmatter field or a section's layout. Tools outside the dashboard may read it, so take these first.
- **parser:** the `/system` dashboard's code.
- **convention:** the rules' prose and the molds.

**Every entry names what it builds on.** Its **Depends on** line lists the rules and code it assumes that are older than this changelog, each with the commit that shipped it. If your project was copied before one of those commits, port that first, or the entry will not apply cleanly. Earlier entries are never listed, because you take entries in order.

**Every entry names the issues it resolves.** Its **Resolves** line lists the GitHub issues on this repo that the entry fixes, or `none`. It never names an entry in your outbox. You judge those yourself, against What changed, at step 4 of an upgrade.

## 11 · Orient gets its body back, the contrast comments measure this palette, and the inspector's route names the gate it needs

**Class:** convention
**Depends on:** the *Chat levels* bullet and the phase pipeline (`ea479e0`) · the element inspector's route and the primary button's `fg-inverse` label (`3a9e01b`)
**Resolves:** none

**What changed.**

- **`CLAUDE.md`'s *Orient, then edit* bullet has its body back.** It read as a bold lead and nothing else, while its body — the orient step, the three bands, align-or-challenge, the kickoff exception — sat on the end of the *Chat levels* bullet below it. `ea479e0` inserted *Chat levels* by splitting Orient's line instead of adding one. Both bullets now say their own thing; neither's wording changed.
- **The `.tab-badge` and primary-button comments measure the ramps this template ships.** They quoted 2.79 / 6.38 / 5.92 and a brand hex that is not in this palette. On the shipped ramps, white on `--brand-main` is **2.98:1** in dark, `--text-inverse` reads **7.43:1** light and **5.54:1** dark, and hover is **9.34 / 8.29**. The reasoning was always right; the figures were another skin's. Entry 9 quoted the same wrong numbers and is corrected in place.
- **A quoted ratio now says to re-measure it.** Both comments end the way `--brand-faded`'s already did: measured on this palette, re-measure if you re-skin, the relationship survives any brand and the figures do not. **If you have re-skinned, these numbers are not yours** — that sentence is the part to take, not the digits.
- **`app/system/inspector.json/route.ts` names the gate it depends on.** Its privacy rests entirely on `proxy.ts`, and nothing said so. Route handlers sit outside the layout tree, so a gate wired *inside* the app — a layout's `notFound()`, a page-level env check — never runs for one: the pages render as closed while the route keeps serving the record's derived data. The route's docblock says it, and `docs/implementation/system-surface.md` → The gate says it beside the alternatives table, where the swap actually gets made.

**If you replaced `proxy.ts` with an in-app gate, this route is public right now.** That is the finding behind the last bullet, and it is worth checking before anything else here. Host password protection and a second private deployment sit above the app and are unaffected.

**How to adopt.**

1. **`CLAUDE.md`:** move the text from `Every mode's opening ritual reads its core set whole` to the end of the *Chat levels* bullet back onto the end of *Orient, then edit*. Two bullets, one cut and paste. If you rewrote either bullet, keep your wording and just put the body under the right lead.
2. **`app/globals.css` (`.tab-badge`) and `components/ui/Button.tsx`:** comments only, no property changes. **On the shipped ramps,** take both comments as written. **If you re-skinned,** take only the closing two lines and measure your own pair — white on your `--brand-main` in dark, and `--text-inverse` on it in both themes. A ratio under 4.5:1 for the label is the thing these comments exist to warn about.
3. **`app/system/inspector.json/route.ts`:** take the new paragraph in the docblock. If your gate is not `proxy.ts`, this is the step that matters: add your own check to this route, and to any other route handler you have added under `/system`.
4. **`docs/implementation/system-surface.md` → The gate:** take the paragraph above the `SYSTEM_GATE=off` line.

## 10 · The upgrade prompt needs no numbers, a finding for the template goes to your outbox, and a repo your product reads gets written down

**Class:** convention
**Depends on:** the rule *A phase belongs to one project* (`a752c73`)
**Resolves:** none

**Does this affect you?** Every project: three small patches to `docs/CONTRIBUTING.md`, step 1. Steps 2 and 3 are for the rare project that needs them. Most have nothing more to do.

**What changed.**

- **The upgrade prompt is just `Run a system phase, upgrade.`** The old example named entry numbers, which read as if you had to look them up first. You never do. The session reads your marker, then the changelog past it. Changed in Session starters and in `README.md`.
- **A close checks for waiting entries by reading one line.** The newest entry is this file's first `## N ·` heading. The rule *Every close hands off the next opening line* now says to read that line, never the file, so the check stays cheap as this changelog grows.
- A second rule gains two sentences: `docs/CONTRIBUTING.md` → Rules shared by all modes → **A phase belongs to one project**.
- **A finding for the template goes to your outbox.** The rule used to send any other repo's problem "to a session running in that project." You hold no session in the template, so that route led nowhere. The outbox in `docs/upstream.md` was already the route. The rule now says so.
- **A repo your product reads gets written down.** The rule fences your sessions out of other repos. It never said that reading them is fine. It is. But if your product needs another repo's files to work, say a tool that parses a sibling project's docs, name that repo in `strategy/Scope & Constraints.md` → Hard constraints. Otherwise a later phase breaks it and nothing says why.
- **Reading this changelog does not count.** Your `docs/upstream.md` already names the template.

**How to adopt.**

1. Patch `docs/CONTRIBUTING.md` from this entry's commit: the Upgrade row's example prompt in Session starters, and two shared rules, *Every close hands off the next opening line* and *A phase belongs to one project*. If you already wrote a local clause for a read dependency or the outbox, keep your wording and drop what this duplicates.
2. Only if your product reads another repo: add the line to your Hard constraints.
3. Only if your briefing has a rule saying the template is not editable from here: point it at your outbox.

## 9 · The tab badge's count is readable in dark

**Class:** convention
**Depends on:** the starter token set and `TabBar` (`feb807b`) · the primary button's `fg-inverse` label, whose reasoning this repeats (`3a9e01b`)
**Resolves:** none

**What changed.**

- **`.tab-badge` paints its count with `--text-inverse` instead of `--text-white`.** White on `--brand-main` measures 7.90:1 in light and **2.98:1 in dark**, against the 4.5:1 floor for small text. `--text-inverse` reads 7.43:1 and 5.54:1. Figures are the shipped ramps'; re-measure against your own.
- **This is the same call the primary button already made, at a callsite that was missed.** In dark the brand lifts so it stays readable as brand *text* on dark surfaces, which is why the fix is the label token and not the ramp: darkening `--brand-main` would break its other job. `--text-inverse` already flips with the theme, so one token covers both.
- The rule it illustrates is worth keeping: **a measured contrast failure is fixed where the token resolves, not at the callsite — except where the token has a second job that moving it would break.** Then the fix moves the *other* side of the pair.

**If you pass `badge` to a `TabBar`, this was failing for your readers in dark.** The starter app does not use the prop, so the components page's demo is where it shows.

**How to adopt.**

1. **One property in `app/globals.css`:** `.tab-badge`'s `color`, from `var(--text-white)` to `var(--text-inverse)`. Take the comment above the rule with it.
2. **If your styleguide has the components page (entry 8),** update `TabBar`'s `badge count` pair in `demos.tsx` to name `--text-inverse`, or the table measures a colour the page no longer paints.

## 8 · The components page shows what a component is, when to reach for it, and what it paints

**Class:** parser · convention
**Depends on:** `getComponentDetails` and the docblock-is-the-why convention, both from the element inspector (`3a9e01b`) · the styleguide's components page and `lib/styleguide.ts` (`feb807b`)
**Resolves:** none

**What changed.**

- **The components page consumes `getComponentDetails`, which until now fed the element inspector and nothing else.** It listed component names; it now renders one fixed anatomy per component — what it is, when to reach for it and when not, a live demo, composition, variants, measured contrast, callsites — joining the component's own file to a demo registry by name, and authoring no fact of its own.
- **Two tags in the docblock carry the guidance: `@when` and `@whenNot`.** They are parsed out of the comment and rendered as their own answers, so the description stays a description. A tag runs to the next tag or the end of the comment, so either may wrap. The nine components here are worked examples.
- **A component's docblock is now the first doc comment at column 0.** It was the first `/**` anywhere in the file, which read an indented *field* comment as the component's description — `TabBar` had no docblock and both the inspector and the styleguide reported its `Tab.badge` field comment as what TabBar is. A wrong answer stands in for a missing one indefinitely, where a missing one is a nudge. `TabBar` now has a docblock.
- **A signature no longer leaks a template expression.** A `${…}` whose expression contains a nested template literal is cut in half by the parser's outer backtick match, so its `}` never arrives and the existing break could not see it: `Input`'s signature read `…focus:outline-none${className ?`. The inspector identifies *server* components by that string, so this was a live defect there.
- **`app/system/styleguide/components/demos.tsx` is the new demo registry, and coverage derives from it.** It holds only what a comment cannot: the mount, the surface it sits on, a declared `noDemoReason`, and the token pairs the demo paints. The old hand-kept `DEMOED` set — five names commented "update when adding one" — is deleted, along with `components-demos.tsx`. An entry with mounts is demoed, an entry with a `noDemoReason` deliberately is not, and a component with neither renders as a gap named in the per-directory line. An entry for a component you do not have is dropped silently; an entry's **import** is not, so it leaves with its component.
- **Demos render twice, once per theme.** `:root[data-theme="dark"]` is root-scoped, so a nested `data-theme` changes nothing — and overriding the `:root` tokens alone changes nothing either, because a custom property's `var()` is substituted where it is *declared*, so `--color-fg-primary` computes on `:root` and inherits as a light literal. `ThemePanesStyle` (in `derived-ui.tsx`) emits both layers from the same parse the token pages use.
- **`lib/contrast.ts` is new, and contrast is computed at build** from those same values rather than quoted from a comment. It parses hex, `rgb()` and the `color-mix(…, transparent)` fade form, composites a translucent value over a named backdrop, and returns the WCAG ratio. The page prints it per theme beside the floor the pair is held to — 4.5:1 for text, 3:1 for a graphical object or a border that is what identifies a control.
- **A failing ratio is marked by the word `under`, not by colour.** Colour alone is WCAG 1.4.1, and the red this page reached for measured 4.34:1 against its own 4.5 floor — the mark saying "under the floor" was under it. The colour stays as emphasis on a message already written.
- **Pointer states are measured, not drawn.** `hover` and `focus` cannot be forced in a static render without duplicating the skin, so the demos show the states a component exposes as props and those two appear as their own contrast pairs.
- `docs/implementation/system-surface.md`: the Styleguide row. `docs/implementation/component-patterns.md`: the two tag names, in its explainer.

**Expect the page to report failures on day one.** It measures the starter tokens honestly, and several pairs in the shipped ramps are under their floors. That is the page working. Treat each as a row on your punch list and fix it where the token resolves, not at the callsite.

**How to adopt.**

1. **Take this entry's commit as a patch for `lib/styleguide.ts`.** Three hunks: `parseDocblock` replacing the inline docblock match, the two new fields on `ComponentDetail`, and the extra `${` break in `expand`.
2. **Copy `lib/contrast.ts`** whole. It is new and depends on nothing.
3. **Copy `app/system/styleguide/components/page.tsx`, `demos.tsx` and `demos.client.tsx`,** and delete `components-demos.tsx`. If your components have diverged from the starters, edit `demos.tsx`: it is the only file that names them. An entry for a component you removed is harmless — its `import` is not, so delete both.
4. **Take `ThemePanesStyle` into `app/system/styleguide/derived-ui.tsx`** from this entry's commit, and `getStyleguide` / `TokenDef` into that file's imports if they are not already there.
5. **Write `@when` and `@whenNot` into your own components' docblocks.** The page prints a named absence until you do, which is the nudge. If you took the nine starters as they ship, they are already written.
6. **Then the two doc rows,** from this entry's commit.

## 7 · The docs surface takes your project root's own docs

**Class:** parser · convention
**Depends on:** the briefing in the doc registry (`1c5a10d`) · the doc reader's frontmatter fold (`fca16cf`)
**Resolves:** none

**What changed.**

- **`getAllDocs` and `getAllDocPaths` take every `.md` beside `docs/` that carries a `tier:`,** not the briefing alone. `rootDocs()` is the new reader. Until now `CLAUDE.md` was hard-coded as the one file the registry would reach outside the tree, so any other meta doc you keep at your root — a boundary doc, a conventions note, an operations runbook — was readable in an editor and nowhere else.
- **A root doc declares itself, and the declaration is a `tier:`.** Not a list in code and not every `.md` at the root. Declaring a tier is already what a file does to be a registry doc, so the rule needs no new field, and the frontmatter-coverage alarm then holds a root doc to `read-when` and `last-reviewed` the way it holds every other. The set derives, the way the molds' does: add one and it renders.
- **`getDocByPath` resolves `docs/` first and the project root second.** A project that keeps `docs/NOTES.md` reads that one; a root doc never shadows the tree.
- **`SystemDoc` gains `sourcePath`, and `docSourcePath` is deleted.** The old function guessed a doc's real path from `relPath` alone, which cannot survive more than one root doc: `ROADMAP.md` means `docs/ROADMAP.md` while `CLAUDE.md` does not mean `docs/CLAUDE.md`. The path is now recorded where it is known. `BRIEFING_FILE` stays, for the two jobs only the briefing has — the Structure lead tile and the dangling-reference scan.
- **The Docs index labels any root doc `project root`,** reading it off `sourcePath` rather than comparing against the briefing's name, and its blurb says so.
- `docs/implementation/system-surface.md`: the Docs row and the doc-reader row.

**Nothing changes for a project whose root declares no tiered doc.** That is the shipped state of this template — `README.md`, `KICKOFF.md` and `CHANGELOG.md` carry no frontmatter — so the registry you get is the one you had.

**How to adopt.**

1. **Take this entry's commit as a patch for `lib/system.ts`.** Four hunks: `rootDocs` replacing `docSourcePath`, `sourcePath` on `SystemDoc` and `toSystemDoc`, the two registry walks, and `getDocByPath`'s resolution order.
2. **Then the two pages.** `app/system/docs/page.tsx` (the label and the blurb, and `BRIEFING_FILE` drops out of its imports) and `app/system/docs/[...slug]/page.tsx` (`docSourcePath(doc.relPath)` becomes `doc.sourcePath`). If your doc reader has diverged, the only thing it needs is to print `doc.sourcePath` instead of deriving the path.
3. **Then the spec rows,** from this entry's commit.
4. **To put a root doc on the surface, give it frontmatter** — `status`, `tier`, `last-reviewed`, `read-when` — and it appears on `/system/docs` at its tier, at `/system/docs/<NAME>.md`, labelled `project root`. Give it none and nothing changes. **Check the page:** your doc count should rise by exactly the number of root files you tiered, and a drift alarm naming a missing field means that file is now a registry doc and owes the rest of them.

## 6 · The method page teaches the run, and the kind sequences come from one declared list

**Class:** protocol · parser · convention
**Depends on:** kinds as session shapes and the product phase's run (`a79bb71`) · `MODE_KINDS` and boards declaring status, stage and run (`fd0ded8`) · the method page's arrival order (`c68b503`)
**Resolves:** none

**What changed.**

- **`docs/CONTRIBUTING.md` → § The phase pipeline gains a `### The run` subsection.** Same words as the run paragraph it replaces, broken at its own bold sentences: a lede, then three bold-led paragraphs. It sits **last** in the section, because everything under a `###` reads as part of it, and the parser cuts it out before reading the parent's rules — which is what lets the page render it beside the kind cards. The section's parser marker says so, and names the kind-name join below.
- **`lib/system.ts`: `MODE_SEQUENCES` replaces the hard-coded `MODE_KINDS`,** which now derives from it. A mode declares the shapes its boards run — a product phase runs open → build → close on its own and the longer shape inside a run — and the flat list a `stage:` is checked against is their merged union, in the same order as before. One flat list could order a run's members but could not say which kinds only a run has.
- **`getPhasePipeline` returns `kinds` and `run`.** `PipelineRole` is now `PipelineKind`, `pipeline.roles` is `pipeline.kinds`, and `PipelineRun` carries the subsection's heading, tagline, lede and rules. `WorkModel.arc` is deleted: nothing consumed it once the kind cards stopped carrying arc-step tags.
- **The method page renders the kind layer in three parts** — one strip per declared sequence, the kind cards each tagged with the sequences that run it, then the run. The tag join is the card's name against the sequence list, normalised for case and hyphens (`**Basic layer**` ⇔ `basic-layer`); a name no sequence lists renders untagged.
- **The Concurrency shared rule renders with the modes** instead of folded at the foot, carrying a chip per status its own text names. A canon whose rule names no status gets no chips; a canon with no such rule leaves the foot as it was.
- **`app/system/system.css`: the kind grid's columns are floored at 240px.** They were `minmax(0, 1fr)`, so auto-fit put six kinds on one row — six unreadable slivers at a 1024 viewport. `.sys-arc-role(s)` is now `.sys-arc-kind(s)`, and `.sys-seq*` and `.sys-run-note` are new.
- **The drift alarm splits in two.** A pipeline section that parses hollow fires as before; a `### The run` that parses hollow fires separately. Both are presence-not-count: writing no subsection is silent.
- `docs/implementation/system-surface.md`: the Method row is rewritten for all of it. It had fallen behind the page it describes, so take the row whole rather than patching it.

**How to adopt.**

1. **The canon first.** In your `docs/CONTRIBUTING.md` → § The phase pipeline, move the run paragraph to the end of the section under a `### The run — <your tagline>` heading and break it at its bold sentences — a lede, then one paragraph per bold lead. Patch the section's parser marker from this entry's commit. If your canon has no run, skip this step: the page renders no run and nothing fires.
2. **Then the parser.** Take this entry's commit as a patch for `lib/system.ts` and `lib/derivation.ts`. If you renamed the kinds, edit `MODE_SEQUENCES` to your own names and sequences — that constant is the one place they are declared now, and `MODE_KINDS` follows.
3. **Then the page and the CSS.** Patch `app/system/method/page.tsx` and `app/system/system.css`. The rename touches both: `.sys-arc-role(s)` → `.sys-arc-kind(s)`. If your method page has diverged, the three parts of the kind layer can be taken one at a time — the strips, the card tags, the run block — and the Concurrency lift is independent of all three.
4. **Check the page.** Your kind cards should wrap rather than shrink, each tagged with the sequences that run it, and a card tagged with nothing means its name is not in `MODE_SEQUENCES` — fix the list, not the canon.

## 5 · Resolves names public issues, and you judge your own outbox

**Class:** convention
**Depends on:** none
**Resolves:** none

**What changed.**

- The **Resolves** line names this repo's GitHub issues, or `none`. It never names an entry in a project's outbox. The header above now says so.
- Entry 3's Resolves line now reads `none`, to match.
- `docs/CONTRIBUTING.md` → The upgrade kind. An entry's parts now include Depends on, and the issues it resolves. Step 1 ports what an entry depends on first. Step 4 clears the outbox entries the new entries fix, judged from each entry's What changed. The outbox paragraph says the same.
- `docs/upstream.md`: the card's sentence on when you clear an outbox entry says the same.

**How to adopt.**

1. Patch The upgrade kind in `docs/CONTRIBUTING.md` from this entry's commit: its opening paragraph, steps 1 and 4, and the outbox paragraph.
2. Change the last sentence of your `docs/upstream.md` card the same way.
3. Judge each entry in your outbox against the entries you have taken, and clear the ones they fix. From here on, that is step 4 of every upgrade.

## 4 · A board shows its upgrade beside its mode

**Class:** parser · convention
**Depends on:** the molds page's body-field parse, `boldFields` (`fca16cf`) · boards declaring status, stage and run, and the stage pill (`fd0ded8`)
**Resolves:** none

**What changed.**

- `lib/system.ts`: every open board gets `crossings`, read from its `**Upgrade:**` and `**Exports:**` lines above the first `##`. Empty, `none` or the mold's `*(placeholder)*` reads as absent.
- `app/system/ui.tsx`: a new `CrossingPills` puts one plain pill per crossing beside the mode pill, on the board page and the walkthrough header. A tile's label adds it too: `Active · System · upgrade`.
- `docs/phases/_system-template.md`: the Project line gains `**Upgrade:**`.
- `docs/CONTRIBUTING.md`: the board-badge bullet and The upgrade kind name the Upgrade line. `docs/implementation/system-surface.md` follows.

**How to adopt.**

1. Take this entry's commit as a patch for `lib/system.ts` and the three `app/system/` files. Where your badge rows differ, add `<CrossingPills board={board} />` after the mode pill by hand.
2. Add the Upgrade field to your system mold's Project line.
3. Patch the two CONTRIBUTING sentences. Your next upgrade board fills the line with the entries it takes, and the pill shows.

## 3 · Two dashboard fixes, and entries name what they build on

**Class:** parser · convention
**Depends on:** the site map and its survey alarm (`4e17f21`)
**Resolves:** none

**What changed.**

- `routeCovered` in `lib/system.ts`: a Survey row naming `/` covers only `/`. Before, it covered every route, so the uncovered-route alarm could never fire again.
- `.sys-id` in `app/system/system.css` moves from the mono face to the body sans, with tabular figures. At 12px the system mono faces drew the letter O and the digit zero alike, so a walkthrough's `O2` read as `02`.
- This file gains the **Depends on** line, stated above. Entries 1 and 2 now carry one.

**How to adopt.**

1. Take this entry's commit as a patch for `lib/system.ts`, `app/system/system.css` and `docs/implementation/system-surface.md`.
2. If your Survey table has a row naming `/`, the alarm may now name routes it silenced. Add rows naming their paths.
3. Nothing to do for the Depends on line. Read it on entries past your marker.

## 2 · Where We Are stops logging

**Class:** convention · parser
**Depends on:** the briefing's no-current-state rule and Where We Are's rules 1 to 3, in `docs/CONTRIBUTING.md` → The ROADMAP and the briefing are not changelogs (`1c5a10d`) · the dangling-ID drift alarm (`6c06eb3`)
**Commits:** `3c5282f`, then `d7ed048`. Take both, never the second alone.
**Resolves:** none

**What changed.**

- The ROADMAP's Where We Are holds the project's stage and what blocks its next step. Nothing else.
- `docs/CONTRIBUTING.md` → The ROADMAP and the briefing are not changelogs gains rule 4. If a derived surface or a tracker already holds it, it does not go in Where We Are.
- Dates beside past-tense verbs are named as rule 1's smell. The rules run at every edit, not only at a close.
- `docs/ROADMAP.md`'s parsed comment states all four rules, where the writer meets them.
- The dashboard counts the section's words and raises a drift alarm past 400.
- The roadmap page opens with the open boards, since the prose no longer lists them.
- Three passages that sent board state into the section are gone. They were the changelog section's opening list, the product phase's opening step 1, and `docs/product-lifecycle.md` closing step 5.

**How to adopt.**

1. Take both commits as a patch.
2. Rewrite Where We Are under the four rules. Move its risks to the trackers. Name each remaining blocker's tracker ID. Delete any current-phase line.
3. Get it under 400 words, whichever setup you run. If your `scripts/verify.mjs` reads the drift alarms back, as this repo's does, `npm run verify` fails until you do. If it does not, nothing fails: the alarm shows only in the drift banner on `/system` while the dev server runs, so check it there.

## 1 · The channel

**Class:** protocol · convention
**Depends on:** the rule *Every close hands off the next opening line*, in `docs/CONTRIBUTING.md` → The Work Model (`b8ed5f5`) · the `## Raised` entry shape the outbox borrows (`805e295`)
**Resolves:** none

**What changed.**

- This changelog. Every change a project may want lands here as a numbered entry.
- `docs/upstream.md` is your project's side. It holds the marker, where the template lives, the entries you adapted or declined and why, and an outbox for what you find that the template should fix.
- `docs/CONTRIBUTING.md` gains the upgrade kind: a system phase that takes entries in. It comes with a Session starters row, the glossary's kind count, a line in the system phase's purpose, and a line in Doc Structure.
- Every close now checks for waiting entries. When there are some, an upgrade is a candidate for the next opening line.
- The kickoff deletes this file along with `KICKOFF.md`. It is the template's, and you read it here.

**How to adopt.**

1. Copy `docs/upstream.md` from this repo. Set `template-entry: 1`. Point `template:` at wherever you read this repo.
2. Take the `docs/CONTRIBUTING.md` changes as a patch, from this entry's own commit. In a clone of this repo, `git log -S "## 1 · " -- CHANGELOG.md` gives the commit, and `git show <commit> -- docs/CONTRIBUTING.md` shows the six changes: the section The upgrade kind, the Session starters row beginning "Template changes past your marker", the sentence added to the rule "Every close hands off the next opening line", the system phase's Purpose line, the glossary's Kind line, and Doc Structure's root row.
3. Move anything you have already written down for the template into the outbox, one entry each.
4. Your kickoff has already closed, so its change needs nothing from you.
5. Nothing older than this entry is tracked. For earlier template work, diff.
