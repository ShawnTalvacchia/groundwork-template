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
