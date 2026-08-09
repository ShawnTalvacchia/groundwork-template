---
category: implementation
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "/system surface changes — new page, IA change, doc-format change"
---

# The System Surface (`/system`)

## What this is

`/system` is the project's knowledge system rendered as a reference layer inside the app — noindexed and absent from the product nav. It exists so the state of the work is legible at a glance while the docs stay the single source of truth.

Because the site deploys from pushes, the surface updates with every commit: push → rebuild → the pages re-read `docs/`.

**Two audiences, one repo.** The product is public and indexed; `/system` is the team's record. That split is enforced in code by the gate below, not left to the adopter.

> **This doc is the spec; the code is in the repo.** The dashboard ships with the template — `lib/system.ts`, `lib/derivation.ts`, `lib/styleguide.ts`, `app/system/*`, and the starter `app/globals.css`. Run it with `npm run dev` and open `/system`. This spec is the contract the parsed docs uphold, and the parser markers in those docs (`<!-- PARSED by … -->`) point back here.

## The gate

`/system` is gated by `proxy.ts` at the edge. Four states:

| Environment | `/system` | Why |
|---|---|---|
| development | open | The gate must never be local setup friction. |
| `SYSTEM_GATE=off` | open | Deliberately public. The choice is explicit and on the record. |
| `SYSTEM_PASSWORD=…` | password, then cookie | The default for a deployed project. |
| production, neither set | **blocked (503)** | Nobody decided; the safe reading of that is "don't publish the record." |

The last row is the design. A deploy that forgets to configure the gate fails closed and names both variables, so **public-by-choice replaces public-by-forgetting**. `robots: noindex` still ships, but it is a search-engine hint, never access control — the gate is what makes the record private.

The cookie value is a hash of the secret, so rotating `SYSTEM_PASSWORD` invalidates every session without a session store. The product is never gated; the matcher covers `/system` only.

**Alternatives, and when to prefer them:**

| Mechanism | Prefer it when | Cost |
|---|---|---|
| Shipped gate (`SYSTEM_PASSWORD`) | Default. Solo or small team, one shared secret, any host. | One env var. No accounts, no audit trail. |
| Host password protection (Vercel, Cloudflare Access) | Your host offers it and you want the gate above the app entirely. | Platform lock-in; often a paid tier. |
| Identity provider (SSO, OAuth) | Real teams, per-person access, revocation, an audit trail. | A dependency and a login flow to maintain. |
| Second private deployment | The record must never share an origin with the product. | Two deploys of one repo to keep in sync. |

Set `SYSTEM_GATE=off` only for a deliberately public dashboard — a demo, a template, or a project whose record is meant to be read.

## The law: derived, never authored

Every page renders from the markdown in `docs/` at build time — frontmatter, statuses, tiers, list items. Nothing on the surface is hand-maintained; **to change a page, change its source doc.** A visual layer that can drift is a second thing to review, which is the exact failure this system exists to prevent. If the surface disagrees with the docs, the docs win — the build is stale.

The parsers adapt to the docs' existing formats. The formats never bend to the parsers — the identifier schemes (`P##`, `§N`, `FC##`, the mode headings) are load-bearing across docs, code comments, and memory.

**The law covers vocabulary, not just values.** A page may not author the project's own words — the set of areas, their labels, their order, or a thesis about how they relate. Rendering a *value* the docs supplied is derivation; supplying the *category* it goes in is authorship, and it is the harder failure to see, because a label reads as chrome rather than as content. The Features page broke this from the beginning: its area set was hardcoded from one product's own thesis, so every project built from this template inherited that vocabulary and any feature outside it rendered nowhere at all. Where a page needs a category, it derives the category (`getFeatureAreas`) or formats the doc's own word (`areaLabel`). Section *headings* name the section, never a project's shape — this is why the roadmap's horizon section is "On the horizon."

## Shape: hub and spoke

A fixed header carries the main tabs — **System** + three groups (Work · Structure · Method) as segmented pills. Each group's pages render as subtabs in the body. The header and subtab row stick as one block; the body scrolls under.

**Tabs vs drill-ins.** A subtab is for a surface worth *exploring*; anything you merely *consult* is a card on the group's overview with the full page one click away. **Cap: four subtabs per group.** A tab never ejects you from the surface — bring content *in* rather than linking out.

## The three groups

- **Work** — *what's being done and what's waiting*: the active board(s) badged by mode at full width, the **queue shelf** beneath it, and the three trackers. The shelf shows the queue rather than counting it — a tile whose only content was a number said less in the same space, and it never named a single phase. It is labelled `ROADMAP`, since that is the page it is a window onto, and carries the **full** queue count beside the label: the cards cap at four, so the count is what stops a capped list from reading as the whole list. A project with an empty queue still gets the shelf, because that is where the roadmap link lives.
- **Structure** — the shape of the project: the feature registry, the strategy shelf, the docs index (by tier + freshness), the shipped timeline, the decisions log, and the styleguide.
- **Method** — *how we work*, rendered rather than linked: the phase arc, the three modes with their full rituals, the trackers model, the tier physics, and the glossary. The rulebook docs (CONTRIBUTING, CLAUDE.md) appear only as source notes at the foot of the page they back.

## Page → source mapping

| Page | Renders from |
|------|--------------|
| Overview | counts from every list + the Glossary + `ROADMAP.md` Where We Are + doc freshness + the **session-starters strip** (`StartersStrip`, inside Work above the active board: a shelf collapsed by default, each row a collapsed card — arrival → shape pill + mode, the same pairing the method page uses — expanding in place to its example prompt and what-happens text; the header's "How we work →" is the only link out) + the **queue shelf**: the next 4 queued rows joined to their seeds, mode-badged, each linking to its seed, under the full queue count (`QueueShelf`, shared with Work → Overview) |
| Active board(s) | `docs/phases/*.md` (templates excluded) — the board in full under a mode badge + progress. Heavy boards derive it from each `## Workstream` section's Status-cell task rows + legacy checkboxes; light boards (no workstreams) count their `## Items` checkboxes directly, excluding the closing checklist |
| Roadmap | `ROADMAP.md` (Where We Are, the queue table — any mode, horizon) + `planning/queued/*.md` seeds (`getQueuedSeeds` — frontmatter + lede feed the cards, `mode:` badges each; the whole card links to its seed; the invariant is bidirectional and mode-agnostic — an orphaned seed or a seedless row trips the drift banner) |
| Questions | `planning/Open Questions & Assumptions Log.md` (`## N. Topic` → `### Question?` with Area/Opened/Priority/Thinking/Resolves-when; everything in the file is open — resolved is deleted) |
| Punch list | `planning/punch-list.md` (the `P##` table). The summary line is the row's own `title` column — the page used to guess it from a bold prefix or a truncated first sentence, which is the surface authoring a label the doc never wrote |
| Future | `planning/Future Considerations.md` (`FC##` sections, Trigger/Context/Effort fields) |
| Docs | `tier:` frontmatter across live docs + per-tier staleness heuristics (working >30d, commitments >90d) |
| Features | `docs/features/*.md` frontmatter (`feature-status`, `feature-kind`, `area`, `routes`). The area **set and labels** derive too (`getFeatureAreas` — alphabetical, title-cased); the page holds no vocabulary of its own |
| Strategy | `docs/strategy/**` frontmatter (`summary` one-liners; grouped by tier + subfolder) |
| Timeline | `docs/archive/phases/*.md` (walkthroughs skipped) — month-grouped, newest first |
| Decisions | `docs/decisions.md` (`## date · title` entries, What/Why/Where) |
| Method → How we work | `CONTRIBUTING.md § The Work Model` — parsed: lede, shared rules, per-mode purpose / touch bands / numbered rituals (the three `### The <product|system|side> phase — tagline` headings), § Session starters (the front-door table: arriving → shape → mode → example prompt → what happens), § The parts (`#### <Part>` blocks with Is / Properties — the concept layer), and § Adjustments (`- **when** → what` bullets). The page teaches terms before uses: the starters *lede* sits up with the phase arc (plus a jump link), and the starter *rows* render after § The parts, whose vocabulary they speak — parts → starters → adjustments → modes → shared rules, regardless of doc order |
| Method → Trackers | `CONTRIBUTING.md § The Planning Trackers` |
| Method → Tiers | `CONTRIBUTING.md § Doc Tiers & Review Physics` |
| Method → Glossary | `CONTRIBUTING.md § Glossary` |
| `/system/docs/<path>` | any single doc rendered whole (archive + `_`-prefixed templates included); relative `.md` links resolve in place, `#fragments` land on GitHub-style heading ids stamped on h2–h4 |
| Styleguide | `app/globals.css`, parsed by `lib/styleguide.ts` — light + dark side by side, token health checks per build |

## Drift alarms

**The doc formats are parser API, and format drift fails silently** — a parser handed an unexpected shape returns empty or partial, and the page renders hollow with no signal. Three defenses:

- **Invariants, not zero-checks** — `lib/derivation.ts` asserts each parser's promised shape (3 modes with all fields, 5 parts with Is/Properties, 5+ session-starter rows with no empty cell, 3+ adjustments, 4 known tiers with live thresholds, every question carrying area + resolves-when, frontmatter coverage …). Non-zero-but-wrong parses are the worst class; zero-checks alone miss them.
- **Unrendered features** — every product feature doc must land in a bucket the Features page renders. `getFeatureAreas` derives the area set, so total coverage holds by construction; the alarm fires if a fixed vocabulary is reintroduced, because a fixed set drops the docs that fall outside it. Its limit is stated in the code — it proves no doc was dropped, not that the labels came from the docs; nothing in `lib/` can see a literal authored into a page under `app/`.
- **Dangling references** — every tracker ID named in the two state docs (`ROADMAP.md` and the project root's `CLAUDE.md`) must still exist in its tracker: `P##` in the punch list, `FC##` in Future Considerations, `§N` in the Open Questions log. Parsed by `getStateReferences`; prose only, one alarm per dangling ID per doc. This is the one invariant that guards *content* rather than format, and it earns the exception by catching the failure format checks cannot see: a doc still describing an item as pending after the item shipped and left its tracker. `§ N` with a space is a section pointer, not an ID, and is not scanned.
- **The surface self-reports** — any failing invariant renders an amber band on every `/system` page, naming the parser, the source doc, and the problem. **Warn, never fail:** a drifted doc format must not block a deploy.
- **Markers at the source** — each parsed section opens with an HTML comment naming its parser, its page, and the shape that must hold.

A firing alarm means the **doc** drifted from spec — fix the doc, or change spec + parser deliberately, never one without the other.

> **Calibration: presence-not-count.** The invariants are tuned so a fresh project — empty trackers, no archive, no decisions, an empty queue — boots with **zero alarms**. What still fires is real drift: a populated list with a malformed row (a question missing its area, an FC missing its trigger, a doc missing its tier), the Work Model / tiers / glossary shape, the seed↔queued-row bidirectional match, a state doc pointing at a tracker ID that no longer exists (a fresh ROADMAP names none, so this fires nothing until the project has both references and trackers), and the styleguide's own completeness (the starter `globals.css` meets its thresholds: ≥200 tokens, the `SEMANTIC TOKENS — Surface` + `Font Size` sections, ≥1 shared component dir). As the project fills in, the surface stays honest without ever nagging an empty list. A mature repo may want count floors (e.g. "≥N archived phases, ≥N decisions") — adding them back is a deliberate re-tightening, logged in `decisions.md`.
