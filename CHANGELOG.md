# Changelog

Every change the template ships that a project built on it may want. Numbered, newest first, never renumbered.

**Your project's side is `docs/upstream.md`.** Its `template-entry:` is the last entry you reviewed. The entries above it are waiting. Taking them is the upgrade kind, in `docs/CONTRIBUTING.md` under The upgrade kind.

**Each entry lands in the same commit as the change it describes.** So the commit that added an entry is that change. In a clone of this repo, `git log -S "## 3 · " -- CHANGELOG.md` finds entry 3's. An entry that covers earlier commits names them.

**Every entry carries a class, or several:**

- **protocol:** a shape in `docs/` that something else parses, like a frontmatter field or a section's layout. Tools outside the dashboard may read it, so take these first.
- **parser:** the `/system` dashboard's code.
- **convention:** the rules' prose and the molds.

## 2 · Where We Are stops logging

**Class:** convention · parser
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
