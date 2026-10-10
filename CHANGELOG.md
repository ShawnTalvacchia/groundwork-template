# Changelog

Every change the template ships that a project built on it may want, from entry 1 on. Numbered, newest first, never renumbered. Work older than entry 1 is not listed here: diff for it, as entry 1's last step says.

**Your project's side is `docs/upstream.md`.** Its `template-entry:` is the last entry you reviewed. The entries above it are waiting. Taking them is the upgrade kind, in `docs/CONTRIBUTING.md` under The upgrade kind.

**Each entry lands in the same commit as the change it describes.** So the commit that added an entry is that change. In a clone of this repo, `git log -S "## 3 · " -- CHANGELOG.md` finds entry 3's. An entry that covers earlier commits names them.

**Every entry carries a class, or several:**

- **protocol:** a shape in `docs/` that something else parses, like a frontmatter field or a section's layout. Tools outside the dashboard may read it, so take these first.
- **parser:** the `/system` dashboard's code.
- **convention:** the rules' prose and the molds.

**Every entry names what it builds on.** Its **Depends on** line lists the rules and code it assumes that are older than this changelog, each with the commit that shipped it. If your project was copied before one of those commits, port that first, or the entry will not apply cleanly. Earlier entries are never listed, because you take entries in order.

**Every entry names the issues it resolves.** Its **Resolves** line lists the GitHub issues on this repo that the entry fixes, or `none`. It never names an entry in your outbox. You judge those yourself, against What changed, at step 4 of an upgrade.

## 20 · The close stops pointing at a section no board has, the O list states its three gates, and five smaller fixes

**Class:** parser · convention
**Depends on:** the run and the Deepening section (`a79bb71`) · `## Raised` (`805e295`) · the walkthrough page and its parse (`8542a40`) · one page per board (`1750461`) · the primary button's `fg-inverse` label (`3a9e01b`) · chats name themselves (`681cc73`)
**Resolves:** none

**Does this affect you?** Every project: the rule and mold patches in steps 1 to 3. Steps 4 to 7 are code, each one file. Step 8 is for a project copied before 2026-09-09.

**What changed.**

- **Closing a Phase step 2 no longer points at a section no board has.** It said to check each propagated decision off "in the phase board's Closing Checklist". The product mold has no such section, on purpose: its Close notes card says not to copy the steps. The line above the steps claimed the opposite, that the mold embeds both checklists. Both now say the board does not copy them, and the closing Enforcement line says each step must be done rather than checked off.
- **The walkthrough mold states the O list's three gates together.** Your own call, on this board's surface, and in a basic layer only the flow- and feature-level ones. The third gate used to sit in the paragraph about V items, where nobody writing an O item would read it. A find about another open board's surface goes to that board's `## Raised`. A detail call in a basic layer goes in the feature doc.
- **A deferred V item has one home.** At the basic layer's close it is written into the board's Deepening section and deleted from the walkthrough. Four places said "moved" and none said delete, so a check could stand in both lists and be walked in neither. The four now say delete: the walkthrough mold, the product mold's Deepening card, the Basic layer kind in `CONTRIBUTING.md`, and Walkthrough in `product-lifecycle.md`. The product phase's During line says it too.
- **A Decisions-log line that names its call is no longer counted as an open call.** The walkthrough parse read `O##` wherever it sat. A line like `**O2 ruled (PO) …**` in the Decisions log counted toward the close gate, so a walkthrough with an empty O list showed open calls. Lines under a heading starting "Decisions" are notes now, whatever they start with. The id stays in the text.
- **The components page ships no duplicate ids.** Every demo renders twice, once per theme pane, and the `Input` demos carried literal ids, so the dark pane's label focused the light pane's field. The demos drop the ids. `Input`'s label wraps its field, which associates the two without one.
- **Three comments describe the one-board page.** `.sys-callout` in `system.css`, and `DocIndex`, `DocProse` and `RunHeader` in `ui.tsx`, still argued from `/system/phase` stacking every board. Comments only.
- **The home page's button is readable in dark.** It painted `text-fg-white` on `bg-brand-main`: **2.98:1** in dark against the 4.5:1 floor. It now uses `text-fg-inverse`, as the primary button and the tab badge already do: **7.43:1** light, **5.54:1** dark. Measured on the shipped ramps. Re-measure if you re-skinned.
- **Skipping builds on doc-only pushes is documented, not shipped.** Most pushes are the record, and each one builds a deployment. A shipped skip would freeze `/system` on every deployment that renders it, the template's default among them. `docs/implementation/shipping.md` → Where the record lives gains a subsection: skip only on a deployment that does not serve the record, set in the host's settings for that deployment, with the command.
- **The changelog says where it starts.** Its first line promised every change the template ships. Entry 1 already said older work is not tracked, but the header did not. It now does.
- **One older rule is named here because it was missed.** `681cc73` (2026-09-09) shipped before this changelog. It corrects a false premise: a session can set its own chat title, so it sets it from the convention and asks only when it cannot. If your copy is older, your opening rituals still ask you to rename every chat.

**How to adopt.**

1. **`docs/product-lifecycle.md`:** three sentences. The **Template:** line above the opening steps, Closing a Phase step 2's first sentence (drop "then check it off in the phase board's Closing Checklist"), and the closing **Enforcement:** line. Then the Walkthrough section's deferred-V-item bullet.
2. **`docs/phases/_walkthrough-template.md`:** the author card's O-list paragraph and its "In a run" paragraph. **`docs/phases/_product-template.md`:** the Deepening card and its second placeholder.
3. **`docs/CONTRIBUTING.md`:** the Basic layer kind's bullet in The phase pipeline, and the product phase's During line.
4. **`lib/system.ts`:** `DECISIONS_LOG_RE` beside `ID_RE`, and the one line in `parseWalkthrough` that tests it. The `notes` count's comment changes with it.
5. **`app/system/styleguide/components/demos.tsx`:** the `Input` entry's four mounts lose their `id`. If your `Input` no longer wraps its field in its label, give each mount an id the pane can make unique instead.
6. **`app/system/system.css` and `app/system/ui.tsx`:** comments only. Take them if you kept these files; skip them if you rewrote the comments.
7. **`app/page.tsx`:** `text-fg-white` becomes `text-fg-inverse` on the dashboard link, with the comment above it. If you replaced the home page, check any brand-filled control of your own the same way.
8. **Only if your copy predates 2026-09-09:** take `681cc73` as a patch to `docs/CONTRIBUTING.md` and the four board molds' session title line. Diff first, since later entries touch the same sections.
9. **Only if you deploy a build that does not serve `/system`:** read the new subsection in `docs/implementation/shipping.md`.

**Check:** run `npm run dev`. On `/system/styleguide/components`, click the dark pane's "Name" label under `Input`: the dark pane's field takes focus. On `/` in dark, the dashboard link's label is dark on the lifted brand.

## 19 · A session asks the inspector for any element, with no click and no reload

**Class:** parser · convention
**Depends on:** the element inspector (`3a9e01b`)
**Resolves:** none

**Does this affect you?** Every project that kept the element inspector (`?inspect`) and has sessions driving a browser on it. If you removed the inspector, take step 3 only if you put it back.

**What changed.**

- **A session can ask for a reading itself.** Until now both routes to a session began with a person pinning in `?inspect` mode: the copied block, or `window.__inspectorPin`. Now a session driving the browser calls `await window.__inspector.pin(target)` in the page. It pins the element through the same path a click takes and resolves with `{ report, block }`, the very object `window.__inspectorPin` then holds. It waits for the location's lines, so the block names a line, not `pending`. A production build has none to wait for and resolves at once.
- **The target is an element, a selector matching exactly one, or `{ selector, text }`.** The last keeps the matches whose text, or `aria-label` for an icon-only control, contains `text`, ignoring case and spacing, for the selectors a picker gives that match many. The text a picker sends matches as it is, across the element's blocks. A target matching none is refused saying so. One matching several is refused with the count and the first three, each by its tag, first class and opening text: the inspector never picks among matches. A refusal loads nothing and leaves the mode off.
- **Asking enters the mode as the flag does.** The URL gains `?inspect`, the panel shows the pin, Esc clears and exits, and clicks pin. No reload, so an open menu or a half-filled field the element depends on survives. An ask replaces whatever is pinned. A newer ask, a click, an Esc or an exit before the lines land rejects the waiting call, saying which.
- **The opt-in holds.** The overlay still downloads only when asked, by the flag or by the call. The gate's one addition to a normal page is the function, which takes the gate from about 0.4 KB to 1.2 KB gzipped.
- **The briefing says when to ask.** `CLAUDE.md` gains Workflow Rule 8: when the user points at an element on a page of this app, read `window.__inspectorPin` if they pinned it, or call `window.__inspector.pin` if they picked it in the preview or named it, passing the picker's text, and reason from the block.
- **A stale comment is corrected.** The gate said Next's router never sees a `history.replaceState` write. It does: the flag the gate writes is read back by `useSearchParams`.

**How to adopt.**

1. **`components/inspector/InspectorGate.tsx`, from this entry's commit.** Take it whole unless you changed it. If you did, the changes are the `window.__inspector` effect, `targetElement` with `squash` and `matchName`, `writeFlag`, the `ask` state passed to the overlay, and the effect that turns away a waiting ask when the mode ends. `IGNORE` and the two window globals' types now live here.
2. **`components/inspector/InspectorOverlay.tsx`.** Take it whole unless you changed it. If you did: it takes an `ask` prop, `pin` takes the ask as a second argument, a new effect pins the ask once the feed has loaded, and the effect that publishes `window.__inspectorPin` resolves the waiting ask with the object it publishes. `IGNORE` is imported from the gate.
3. **`CLAUDE.md`:** add Workflow Rule 8 as written, renumbered to follow your own rules.

**Check:** run `npm run dev` and open `/` without `?inspect`. In the browser console, `await window.__inspector.pin(".theme-toggle-option")` is refused: `".theme-toggle-option" matches 3 elements`, naming each by its label. Then `await window.__inspector.pin({ selector: ".theme-toggle-option", text: "dark" })` resolves. The URL reads `/?inspect`, the panel shows the button pinned, and the block reads `Rendered at: components/ui/ThemeToggle.tsx:61, in ThemeToggle`.

## 18 · A pin names its CSS pattern, reads its tokens as written, and says which line renders it

**Class:** parser
**Depends on:** the element inspector (`3a9e01b`) · `lib/styleguide.ts` and the styleguide's components page (`feb807b`)
**Resolves:** none

**Does this affect you?** Every project that kept the element inspector (`?inspect`). If you removed it, step 1 is still safe to take: the census in `lib/styleguide.ts` reads `globals.css` through the new rule reader and gives the same answers.

**What changed.**

- **A pin names the CSS pattern it wears.** `getStyleInventory` in `lib/styleguide.ts` reads every rule in every `.css` file under the directories the census scans: its selectors, its line, the `@media` it sits in, the comment directly above it, and its declarations as written. A class some rule styles is a pattern, named by the class with any BEM `--x` suffix cut off, so `.sys-wt-item` and `.sys-wt-item--call` are one pattern and the second is its variant. Pin a walkthrough's O card and the panel says `.sys-wt-item`, each variant on or off with how many on the page wear it (`--call on`, `[data-walked] off`), the comment above the `--call` rule, and where it is styled. A pattern is named by the first sentence of the comment directly above its base rule, the first rule written for the class alone, or by its class when no comment touches it. A pattern on an ancestor up to three levels above counts too, and says how many levels up: enough to reach a card from its title, not so far that the page's own column names everything in it. A pattern and a shared component can both apply, and the report carries both. A pin neither covers says so in words.
- **Each token line says where its name came from.** In order: a rule in your stylesheets, as written (`border-left: 3px solid var(--brand-main)`, with its file and line), a utility class the element wears (`bg-brand-main`), its style attribute, inherited from the nearest ancestor that sets it, and last, its computed value matched against every token. A `:hover` rule or a `hover:` class is a line of its own, so a pin taken mid-transition still reads the resting token and the hover one. A property nothing sets, such as the browser's 16px font size, reads as inherited, not as off the design system. Two tokens sharing a value no longer tie: the class the element wears decides, and a text colour prints as `text-*`, never `bg-*`.
- **The rules that style the element are listed,** each with its line, and a declaration a stronger rule overrides says which one.
- **The copied block is a pointer, not a briefing.** About nine lines: the page with its theme, width and state; the element and its text; where it is rendered, and for a shared component where it is called from, with the line that writes its text marked; its patterns with every variant, on or off, each with how many on the page wear it, and its component with how many share it; the rules that style it and any shared UI rule naming it, each by file and line; and the tokens in play, each with the class or the line it comes from. A declaration that is more than its tokens prints as written (`border-left 3px solid var(--brand-main)`). The docblock, When and Not for, the siblings, the rules' text, the ancestor trail and the doc list left it: a session reads them by opening the file the block points to, and the panel still shows them. The whole reading stays on `window.__inspectorPin.report`, which now also records the theme and the width. A picker that already sends the element's HTML and a screenshot pairs with the block rather than repeating it.
- **The pin records the element's state:** hovered, focused or active when it was pinned. The panel and the block say so.
- **Where it lives, in dev.** React's dev build records the JSX call behind every element, a server component's included, and the dev server's source map turns that into a source line. The panel and the block say `Rendered at: components/ui/ThemeToggle.tsx:61, in ThemeToggle` with the line's text, and for a node a shared component renders, where that component is used: `Called from: app/page.tsx:21`. A production build says the location is not available. Locations print as paths, since a source file has no page to link to. This reads webpack's dev server, which `npm run dev` runs.
- **Show all** outlines every element on the page wearing the pinned pattern, or every instance of the pinned component, until the next pin or Esc.
- **`window.__inspectorPin` arrives in two steps.** It is published at once with `location.lines` set to `pending`, then replaced once the dev server's source map has been read. A session reading it right after a click waits for `lines` to leave `pending`.
- **The feed changed shape.** `/system/inspector.json` adds `theme`, the `@theme` layer with the token each name reads, and `styles`, the rules and the patterns. It renames `patterns` to `uiRules` and `patternsDocUrl` to `uiRulesDocUrl`, so "pattern" means one thing. Code of yours that reads the feed follows the rename.

**How to adopt.**

1. **`lib/styleguide.ts`, from this entry's commit.** If you never changed it, take it whole. If you did, the changes are `readCssRules` beside `blockOf`, the census's `globals.css` pass reading through it, the `keepComments` flag on `scanFiles`, and the pattern inventory after `getComponentDetails`.
2. **`components/inspector/`.** Take `resolve.ts` and `InspectorOverlay.tsx` whole unless you changed them. `styles.ts` and `source.ts` are new. If you changed `resolve.ts`: `buildContextBlock` is rewritten to the pointer and reads `TokenLine` rows, each with its `from`, where it read `TokenMatch` rows; `describePin` takes the patterns, the rules, the state and the location in `PinnedContext`, and adds `view` to the report.
3. **`app/system/inspector.json/route.ts`:** the `getStyleInventory` import, `theme`, `styles`, and the renamed `uiRules` and `uiRulesDocUrl`. Your gate paragraph stays as it is.

**Check:** run `npm run dev`, open `/?inspect` and pin the theme toggle's active option. The panel says `Rendered at ThemeToggle.tsx:61` and `Called from page.tsx:21` under the trail, then the `.theme-toggle-option` pattern with `[data-active] on`, then ThemeToggle. Its tokens read `--radius-xxs`, `--surface-top`, `--text-primary` and `--shadow-xs`, each tagged `rule`, and its font size reads `16px · no token`, tagged `inherited`.

## 17 · A pinned component says whose it is, when to reach for it, what sits beside it and where its styleguide entry is

**Class:** parser
**Depends on:** the element inspector (`3a9e01b`) · `lib/styleguide.ts` and the styleguide's components page (`feb807b`)
**Resolves:** none

**Does this affect you?** Every project that kept the element inspector (`?inspect`). Step 2 touches the styleguide too, so take it even if you removed the inspector.

**What changed.**

- **A pinned shared component says whose it is,** with the pill the styleguide prints beside it: product, dashboard, both or unused, from `getCensus`. The words moved to a new `lib/reach.ts` (`REACH_LABEL`), read by the styleguide's `ReachTag` and by the inspector. The inspector is client code, and `lib/styleguide.ts` reads the file system, so the words needed a module of their own.
- **Its `@when` and `@whenNot` show under its summary.** Each is a named absence when the docblock has no such tag, as on the components page. The feed carried both since entry 8, but the inspector's own type never declared them, so nothing rendered them. `InspectorComponent` now extends `ComponentDetail`, so it cannot fall behind the parser again.
- **The callsite line says what it counts:** callsites outside the component's own file and the styleguide's demo registry. It said "outside the styleguide", which stopped being true at entry 16, when the styleguide's own pages started counting.
- **Siblings, each with its reason.** `getComponentDetails` returns `siblings`, groups of shared components that share something checkable. Either they wear the same same-dir style module, one carrying a variant map or a class string both name, or their names share a PascalCase word. Here, `Toggle`, `PillToggle` and `ThemeToggle` share `Toggle`, and `ThemeToggle` and `ThemeWatcher` share `Theme`. A group that adds nobody a stronger group already named is dropped, so a pair sharing a module and a word shows once, by its module. The panel prints `1 of 3 named Toggle, with PillToggle and ThemeToggle`, each name linked to its styleguide entry. The copied block carries the names, their files and the reason.
- **The styleguide entry is one click away.** Each component in the feed carries `url`, its entry on the components page (`/system/styleguide/components#<Name>`). The panel's Docs section links it first, in a new tab so the pin survives, and the copied block lists the route.
- **The panel and the copied block render from one report.** A pin is read once into a `PinReport` (`describePin` in `resolve.ts`): plain data, no DOM node. `buildContextBlock` takes the report and nothing else, and the panel reads the same object, so the two cannot disagree. Both now state a variant per map: `primary of primary/secondary/ghost · md of sm/md`.
- **↑ and ↓ move the pin.** With an element pinned, ↑ pins its parent, as far as `body`, and ↓ goes back the way it came, or else to the first child that draws a box. The panel shows the pinned element a step in under its parent, the way a layers panel nests them, and clicking the parent pins it. The copied block names the four nearest ancestors and counts the rest: `Inside: main.mx-auto > div.flex > div.flex > div.theme-toggle (1 more level above)` for the theme toggle's button on the starter's front page. A click usually lands on the innermost node, and a container its children cover could not be pinned at all. With nothing pinned the arrows still scroll the page, and they never act while a field has focus.
- **A session driving the browser can read the pin.** `window.__inspectorPin` holds `{ report, block }` while something is pinned: the report, and the same block Copy puts on the clipboard. It is `null` while inspect mode is on with nothing pinned, and absent when inspect mode is off. An agent that can run script in the page reads what you pinned without a paste.
- **A length reports its own token family or none.** Font-size, radius, padding and gap no longer borrow a token from another family that shares the value: a container inheriting the browser's 16px reported `--space-lg`. Such a value now reads as not a token. Colors still fall back to other families, since brand text and a status fill are real tokens.
- **When the feed is refused, the fallback reads every `:root` rule, however the CSS nests them.** `tokensFromStylesheets` read top-level `:root` rules only. The compiler's fallback for `color-mix()` is an `@supports` block, and unminified it sits inside `:root`, so every declaration after it lands in a nested rule. In the starter's dev build that is every token after `--brand-faded`, and a refused feed reported spacing, radius and type sizes as off the design system. A minified build splits `:root` around the block instead, which the old reader happened to survive. It now walks nested rules, layers and media blocks, which also brings in the `@theme` variables. The copied block also says when the feed was refused, so a missing component section cannot read as page-local markup.
- **Token names hold at any page zoom.** The inspector measured each token on a hidden box that was still drawn, and at any browser zoom but 100% layout rounds a drawn box's width: a 12px token read back as 11.9965px, while the pinned element's own padding read exactly 12px. So at 90% or 110% every spacing and radius token went unnamed while colors still matched. The box now draws nothing (`display: none`) and reads widths from style, exact at any zoom.
- **Padding goes through `byProperty`, like every other reported property.** It was the one that skipped it. On a deploy whose feed was refused, no utility ranks the tokens, so an 8px pad reported `--radius-sm`, which is declared before `--space-sm`.

**How to adopt.**

1. **`lib/styleguide.ts`, from this entry's commit.** If you never changed it, take it whole. If you did, the changes are `SiblingGroup` and the `siblings` field on `ComponentDetail`, `classy` and `nameWords` at module scope, the `worn` list in `getComponentDetails`'s import loop, and the second pass at its end.
2. **Copy `lib/reach.ts`,** which is new. In `app/system/styleguide/derived-ui.tsx`, import `REACH_LABEL` from it and delete the local one.
3. **`components/inspector/resolve.ts` and `InspectorOverlay.tsx`.** Take both whole unless you changed them. If you did, the changes in `resolve.ts` are `InspectorComponent`, `tokensFromStylesheets`, `byProperty`, the padding line in `resolveElement`, and the report section that replaces the carry-back block. `buildContextBlock` now takes a `PinReport`, so anything else of yours that calls it passes `describePin(data, pinned, { gated, page })` first. In the overlay, the changes are the panel rendering from the report, the ↑ and ↓ handling with the parent row, `window.__inspectorPin`, and the probe's class, now `hidden`.
4. **`app/system/inspector.json/route.ts`:** the `getCensus` import, `COMPONENTS_PAGE`, and `reach` and `url` on each component. Your gate paragraph stays as it is.

**Check:** open `/?inspect` and pin the theme toggle. The panel shows its pill, its When and Not for, the callsite line, two sibling lines (`1 of 3 named Toggle` and `1 of 2 named Theme`), and Docs leads with "ThemeToggle in the styleguide", which lands on its entry. Press ↑, and the pin moves to `div.theme-toggle`, the control's own root, still named ThemeToggle; ↓ brings it back.

## 16 · The styleguide says whose design it shows, and points at your product's where it lives elsewhere

**Class:** parser · convention
**Depends on:** the styleguide pages, `derived-ui.tsx`, `lib/styleguide.ts` and the feature registry's `area:` and `routes:` (`feb807b`) · the element inspector (`3a9e01b`)
**Resolves:** none

**Does this affect you?** Every web project. The census and the header are code you carry, steps 1 to 3. The token prune, step 4, is for a `globals.css` still holding the starter's semantic layer. Step 5 is only for a copy still in its kickoff.

**What changed.**

- **Every token and shared component is labelled by who reaches for it:** product, dashboard, both, or unused. A route file is the dashboard's when it sits in `DASHBOARD` in `lib/styleguide.ts` (`app/system` and `components/inspector`), and the product's otherwise. A component or module belongs to whoever imports it. The root layout and the element rules in `globals.css` (`body`) count for both. A class rule there, such as `.pill`, belongs to whoever writes the class. A file reaches a token through `var()` or through the utility the `@theme` layer exposes for it, and a token reaches whatever its value reads, in both themes.
- **The label is a pill,** the shared `Badge` in its neutral tone, set beside the token's name. On the Colors page the primitive ramps sit two to a row only from the `lg` breakpoint, and a ramp name truncates before its row outgrows the column. The transparent overlays take one column, since their names differ only at the end.
- **A translucent colour prints as its hex and its alpha,** `#92451f 45%`, whether `globals.css` writes it as `rgba()` or as a `color-mix()` toward transparent (`shortValue` in `derived-ui.tsx`). Written out, `--brand-faded` and the transparent ramps wrapped to five lines in a cell sized for a hex. The swatch still paints the value as written, and hovering the value shows it in full.
- **Token health lists the set by that census.** Counts for both, product, dashboard and unused across `:root`, and a fold per bucket grouped by section. The old "unreferenced" list counted a token as used whenever `@theme` mapped it, so it missed every mapped token whose utility nobody writes. The `orphans` field is gone from `getTokenHealth`; `getCensus` replaces it.
- **The header states the project's state.** Shared, when anything outside the dashboard reaches for a token. The dashboard's own, when nothing does. Then where your product's design lives: each feature doc whose frontmatter carries `area: design`, with its `routes:`, as a link, or a named absence.
- **A local `@import` in `globals.css` is followed.** If your product keeps its own token file and `globals.css` imports it (`@import "./tokens.css"`), its `:root` becomes the base the page resolves through. Imported tokens are never sections, never counted, never censused, and never reported as undefined. A token whose chain lands on one is marked `imported` or `from --x`. The page never parses a product's CSS into its own sections: a product's design that renders elsewhere is better shown there, and the page points.
- **The components page carries the census per component,** and its Used by row reads the styleguide's own chrome as a real callsite. Only the demo registry is skipped. `PillToggle` now shows the section switcher that uses it.
- **22 tokens nothing used are gone,** each with its dark value: `--surface-neutral-dark`, `--text-black`, `--border-lightest`, the four `--border-width-*`, the three `--interaction-hover-*` and their banner, `--surface-page`, `--surface-hover`, `--border-default`, `--text-muted`, `--status-error-surface`, `-border`, `-text`, `--status-info-600`, `--weight-extrabold`, `--font-size-tagline`, `--font-size-body-xxl` and `--tracking-wider`. Most only renamed another token. `--interaction-hover-darken` was alive only through `--surface-hover`. The ramps stay as palette.
- **The Colors page's Interaction section and the Layout page's Border widths render only when `globals.css` has those tokens.** The starter now has neither.
- **`styleguide.css` keeps only what renders.** 29 of its 30 `sg-*` classes were left from the styleguide's old layout and matched nothing; one read `--color-brand-dark`, which nothing defines. The file is now the swatch checkerboard, `.sgd-checker`, alone.
- **`KICKOFF.md` step 7's *Whose design it shows*** now describes what the page says itself, and how to give a product's design elsewhere its door.

**How to adopt.**

1. **`lib/styleguide.ts`, from this entry's commit.** If you never changed it, take it whole. If you did, the changes are the `@import` loop and `TokenDef.product` in `getStyleguide`, the `aliasEdges` it records, `DASHBOARD`, `BASE`, `CENSUS_EXCLUDE`, the per-rule reading of `globals.css` in `getCensus`, `getCensus`, `getDesignHomes`, `usageText`, the `orphans` field removed, and `getComponentDetails` scanning with `CENSUS_EXCLUDE`.
2. **The pages, from this entry's commit:** `app/system/styleguide/layout.tsx`, `page.tsx`, `typography/page.tsx`, `layout/page.tsx`, `components/page.tsx` and `derived-ui.tsx` (`ReachTag`, which renders `components/ui/Badge`, and the `reach` and `census` props on `TokenRow` and `Ramp`). Take `styleguide.css` whole unless you style your own pages with its `sg-*` classes; search for them first. Take them whole unless you changed them; if you did, the changes are those props at each row and the census at each page's top.
3. **Tune `DASHBOARD` to your project.** If your root page is the record's own front door rather than a product, add `app/page.tsx`. If your product's design lives elsewhere, give it a feature doc with `area: design` and `routes:`. **`docs/implementation/system-surface.md`:** the Styleguide row's new passage.
4. **The prune.** Search your own code for each token above first. Anything you use, keep. Then delete the rest from `app/globals.css`, light and dark, with the Widths comment and the Interaction banners.
5. **Still in your kickoff:** take `KICKOFF.md` step 7's *Whose design it shows* and the two bullets under *What it shows*.

**Check:** open `/system/styleguide`. The header says shared or the dashboard's own, and a line about `area: design`. Every row carries a label, and Token health's four counts add up to the `:root` total beside them.

## 15 · The kickoff checks where your copy pushes and shows you the styleguide, which stops naming what your project never had

**Class:** parser · convention
**Depends on:** the styleguide pages, `derived-ui.tsx` and the Structure page (`feb807b`) · the kickoff board (`a520f13`)
**Resolves:** none

**Does this affect you?** Two readers. Every project should take the styleguide fix and the spacing change, steps 1 to 4: it is code you carry whether or not your kickoff has closed. Steps 5 and 6 are for a copy still in its kickoff, with `KICKOFF.md` and the template's README in place. Past it, skip them, but run `git remote -v` once: if `origin` is still this template's repo, repoint it.

**What changed.**

- **The styleguide's copy names only what your project has.** Token health no longer cites a "punch-list B5 prune feed" or "CLAUDE.md rule 6", neither of which exists in your project. The type scale's headings name the family `--font-heading` and `--font-body` lead with, where they said Poppins and Open Sans over `system-ui`. The primitive ramps note drops "Figma's collections" and "legacy callsites".
- **Nothing on the pages repeats a value a token edit would leave behind.** A token comment's leading length is dropped where the row prints the value, as a leading hex already was, so a re-sized `--text-2xs` never shows the starter's 12px beside its own. The type scale note's hand list of sizes is gone; each row prints its own.
- **One name per spacing step.** The ten numbered spacing tokens (`--space-1` to `--space-16`) are gone. The dashboard's stylesheet used them 111 times, and every one but `--space-1` repeated a named step at the same value, so `system.css` now reads the named scale and nothing on screen moves. `--space-1`'s 4px joins the scale as `--space-xxs`, with a Tailwind `xxs` step. `--text-md` (the same as `--text-base`), `--success` and `--error` are gone too; nothing used them. The Layout page loses its numbered-aliases fold.
- **Shell constants renders only when `globals.css` has a LAYOUT section.** The starter has none, so the Layout page showed a heading and a note over nothing.
- **The Structure page's Styleguide card** said "Hand-authored today; its derive-from-globals.css refresh is queued." It now says what the page is: derived on every build.
- **Two comments now carry what the tour relies on.** The `globals.css` header: a new `SEMANTIC TOKENS — <Name>` banner in `:root` is a new family on Colors. `lib/styleguide.ts`: a component is shared when its file sits in one of the inventory's directories.
- **The kickoff's first move is where your copy pushes.** Every session ends with a push, and a clone or a copied folder keeps this template as `origin`, so a kickoff that ended early would push toward the template. `KICKOFF.md` now opens with `git remote -v` and three cases: the template's repo (repoint `origin` at a private repo of your own), no git at all from a download (`git init`, then connect one, or stay local), or your own repo (nothing to do). `CLAUDE.md`'s fresh-template note carries the same check, since every session reads it first. The kickoff board gains it as its first item, and README's *First 30 minutes* starts from "Use this template".
- **`KICKOFF.md` gains step 7, *Meet the styleguide*,** after *Make the identity yours*: whose design the page shows (the dashboard's on day one, and your product's only if it is built on the same tokens), what it derives, what is yours to change, and how to check a re-skin. It pre-fills nothing. The old steps 7 to 9 are now 8 to 10. The kickoff board gains the matching item, and README's *First 30 minutes* names it.
- **The onboarding counts four modes.** README lists queue-shaping beside product, system and side, and its new-idea door reads "Shape the queue: …" where it said "Run a system phase, queue-shaping: …". `KICKOFF.md` does the same, and it and the kickoff board say "the mode loop". `KICKOFF.md`'s listing shows all four board molds, the run-picture mold and `component-patterns.md`, and its loop line says product and system phases both run a walkthrough.
- **The Scope & Constraints stub's Hard constraints prompt** says where an estimate you expect to move goes: under Assumptions, where revising it is ordinary work.
- **Two `globals.css` comments** state their rule without the dates and the removed token they carried: the chip's fill and `--transparent-light-24`.
- **The components page no longer reports an `under` on the starter.** TabBar's demo entry declared `--text-white` for the badge count, where `.tab-badge` paints `--text-inverse`, so the page measured a pair nothing paints: 2.98:1 in dark. Entry 14's Check line holds once this is in.

**How to adopt.**

1. **The code, from this entry's commit.** `app/system/styleguide/page.tsx`, `typography/page.tsx`, `layout/page.tsx`, `derived-ui.tsx`, the Styleguide card in `app/system/structure/page.tsx`, and TabBar's badge-count line in `styleguide/components/demos.tsx`. If you never changed them, take them whole. If you did, the changes are the copy, the family labels (`leadFamily`, `familyOf`), the `layoutTokens.length` guard, the Layout page's single `spacing` list, and the regex in `cleanNote`.
2. **`app/globals.css`, comments:** the header's new sentence, the Font Size note, the chip's and `--transparent-light-24`'s. Patch them in; your values stay yours.
3. **The spacing tokens. Search your own code first** for `--space-` followed by a digit, `text-md`, `--success` and `--error`, and repoint what you find: `--space-1` → `--space-xxs`, `-2` → `-sm`, `-3` → `-md`, `-4` → `-lg`, `-5` → `-xl`, `-6` → `-xxl`, `-8` → `-xxxl`, `-10` → `-jumbo-1`, `-16` → `-jumbo-2`, and `--text-md` → `--text-base`. `--space-12` (48px) has no named twin: keep it if you use it. Then take `app/system/system.css` from this entry's commit, or apply the same map to yours. In `app/globals.css`, add `--space-xxs: 4px` after `--space-tiny` and `--spacing-xxs: var(--space-xxs)` in `@theme`, then delete the numbered aliases, `--text-md`, `--success` and `--error`.
4. **`lib/styleguide.ts`:** the comment over `getComponentInventory` and the `orphans` field's. **`docs/implementation/system-surface.md`:** the Styleguide row's new sentence, and its pointer for the word `under`, which named `component-patterns.md` and now names the comment beside the marker.
5. **Still in your kickoff:** run `git remote -v` first. Then take `KICKOFF.md`, `README.md` and `docs/phases/kickoff.md` from this entry's commit, keeping whatever you have already ticked or filled, and the new sentence in `CLAUDE.md`'s opening note.
6. **Your Scope & Constraints stub,** if its prompts are still there: the new sentence under Hard constraints.

**Check:** open `/system/styleguide/typography`. The type scale's two headings name the families your `--font-heading` and `--font-body` lead with. Then `/system/styleguide/layout`: Spacing lists `--space-xxs` and no numbered aliases, and the page ends at Breakpoints & containers unless your `globals.css` has a LAYOUT section.

## 14 · The quiet end of the starter palette clears its floors, and the Colors page measures every rung on every surface

**Class:** parser · convention
**Depends on:** the styleguide's Colors page and `lib/styleguide.ts` (`feb807b`)
**Resolves:** none

**Does this affect you?** Every project should take the method, step 1. The values, step 2, only fit a palette still on the starter neutral and status ramps; a re-skinned one re-solves its own. The table, step 3, is code any project can take whole.

**What changed.**

- **The text ladder is re-spaced so every rung that carries information clears 4.5:1 on every surface, in both themes.** Primary, secondary, tertiary and gray sit about ×1.41 apart in contrast, measured on each theme's **hard surface**: `--surface-inset` in light (the darkest ground under dark text), `--surface-popout` in dark (the lightest ground under light text). A rung that clears the hard one clears every other surface. The surfaces did not move: the room is between primary and the floor, and moving light inset all the way to white buys a rung's worth of contrast and no more.
- **`--text-light` leaves the ladder.** It is disabled and decorative only now, such as a separator glyph. Input's placeholder, the dashboard's disclosure carets and its ritual step numbers moved to `--text-gray`.
- **Borders split by job at `--border-stronger`.** `-light`, `-regular` and `-strong` are dividers with no floor. `-stronger` is the boundary that has to be seen: a control's resting edge, a chip's ring, a checkbox. It clears the 3:1 floor for a component on every surface. `-strongest` sits a step above, at the gray rung's value. On the dashboard, `.sys-pill`, `.sys-button--quiet`, `.sys-callout--done` and `.sys-wt-box` moved from `-strongest` to `-stronger`, so they keep the weight they had while `-strongest` got heavier.
- **Toggle's off state is an outlined switch:** a `-stronger` ring and knob on an inset track. A white knob on the `--surface-gray` track measured 1.65:1, and it is the pair the eye reads.
- **The status `-strong` steps for success, warning and error point at a new 700 rung** and clear 4.5:1 on their own `-light` fills. Info already did.
- **The Colors page has a new table, *The ladder on every surface*:** each text rung and the control boundary, on top, popout, base and inset, in both themes, against its floor. The lowest figure per theme is set heavier, which names that theme's hard surface. Each text rung's name paints in its own colour, so the row doubles as a specimen. The token comments in `globals.css` point at the table rather than quoting figures. `tokenTable()` moved from the components page to `derived-ui.tsx`, so both pages read one resolver.
- **Entry 8 said to expect failures on day one.** On the starter palette the components page now reports none.

**The values, light.** `--neutral-600` `#4c5360`, `-500` `#636977`, `-400` `#7d8694` (each was `#565e6b`, `#6b7280`, `#8892a0`). `--text-secondary` → `--neutral-750`, `--text-gray` → `--neutral-500`, `--border-stronger` → `--neutral-400`, `--border-strongest` → `--neutral-500`. New: `--success-700` `#047857`, `--warning-700` `#b45309`, `--error-700` `#b91c1c`, and the three `--status-*-strong` point at them.

**The values, dark.** `--text-secondary` `#c5ccd6`, `--text-tertiary` `#a4adb9`, `--text-gray` `#88919c`, `--border-stronger` `#6c737d`, `--border-strongest` `#88919c`. The three new 700 primitives repeat their ramp's 600 value, as every dark status rung does.

**How to adopt.**

1. **The method, whatever your palette.** Find each theme's hard surface: the one closest in luminance to your text. Fix primary. Space three rungs evenly in contrast between primary and just over 4.5:1 on that surface, keeping your ramp's hue. Put `--border-stronger` just over 3:1 on the same surface. Then read the table from step 3: every cell should clear its floor.
2. **The values,** if your neutral and status ramps are still the starter's: take the light and dark values above into `app/globals.css`, and the comments over the Text and Border blocks from this entry's commit. Your brand ramp is untouched.
3. **The code, from this entry's commit.** `app/system/styleguide/page.tsx` (`LADDER`, `GROUNDS`, `LadderTable`), `tokenTable` into `derived-ui.tsx` with the components page importing it, the paints in `demos.tsx` for Input and Toggle, and `components/ui/Input.tsx` and `Toggle.tsx`. If you changed those two components, the change is the placeholder class and Toggle's off-state classes.
4. **`app/system/system.css`:** the four ring re-points above, the carets and `.sys-step-num` to `--text-gray`, and the re-measured comments on the pills.
5. **Your own callsites.** Anything you paint in `--text-light` that a reader needs moves to `--text-gray`. A card or panel edge on `--border-stronger` moves to `--border-strong`.
6. **`docs/implementation/system-surface.md`:** the Styleguide row.

**Check:** open `/system/styleguide` and read *The ladder on every surface* in either theme. No cell says `under`. Then `/system/styleguide/components`: no pair says `under` either.

## 13 · Every page that renders the rules links its terms, and the glossary defines seam and mold

**Class:** parser · convention
**Depends on:** `MdInline`'s `§` anchor map and `StarterRows` (`ea479e0`) · `PageIntro` and the trackers and tiers pages (`feb807b`)
**Resolves:** none

**Does this affect you?** Every project gets the links by taking the code, step 1. The glossary additions, step 3, are wording: take them wherever your glossary still carries the shipped entries.

**What changed.**

- **The method, trackers and tiers pages link the glossary's terms,** the way the glossary page already did. A term links at its first use as a noun in each reading unit: a card, a fold's body, or the open text under a heading. So a term you meet in a folded rule links there, even when the page linked it higher up. A fold's summary never carries a link, since a link there takes the click that opens the fold. A page never links its own subject: Tier on the tiers page, Tracker on the trackers page.
- **A bolded term now counts.** `a **seam**` links, where it used to fail the noun test because the `**` sat between the two words. The rules bold a term where they introduce it, so that is the mention most worth linking.
- **Never inside a path into another doc.** `product-lifecycle.md → Closing a Phase` no longer links "Phase": those words are that doc's heading. A bracketed placeholder like `[phase name]` is skipped too.
- **Every `§ Name` on those pages links.** It goes to the section on the page where the page renders it (the method page's starters, modes, pipeline, run, shared rules, parts and adjustments), and to the doc reader otherwise. `§ Doc Tiers` now resolves, to the section whose heading starts with those words. A reference that runs on past its name, like `§ Session starters and the rules…`, is trimmed back until it resolves.
- **Term links are dotted until hovered** on every page, as they were on the glossary page.
- **The glossary.** Two new entries: **Seam**, where a split phase changes chats, and **Mold**, the template a doc is cut from. **Level** now names the Levels line and says what split and collapsed mean. **Walkthrough** names its O and V items. **Trigger** names its second sense, a Future Consideration's trigger, because the trackers page now links that word. The Kind chat row in § Session starters and Kind's `close` say "documents" where they said "paper".

**How to adopt.**

1. **The code, from this entry's commit.** In `lib/system.ts`, the block from `NOUN_CUE` through `sectionRefs`: `glossaryLinker` is new and `linkGlossary` calls it, `sectionAnchors` gained its fallbacks, and `sectionHrefs` is new. In `app/system/ui.tsx`: `glossaryHref`, `termUnits` and `TermUnit`, the `unit` and `anchors` props on `StarterRows`, `PageIntro`'s `blurb` taking a node, and the tie-break in `MdInline`'s `§` matcher. In `app/system/system.css`, the two `a[href*="/glossary#"]` rules under `.sys-main`. **If you never changed** the method, trackers, tiers and glossary pages under `app/system/`, take them whole. **If you did,** the pattern is the same on each: build `anchors` with `sectionHrefs`, build `unit` with `termUnits`, call `unit()` once per card or fold, and hand `MdInline` the linked text.
2. **`docs/implementation/system-surface.md`:** the Method, Trackers, Tiers and Glossary rows, and the new paragraph *Terms link where the canon renders* under the table.
3. **The glossary,** in `docs/CONTRIBUTING.md`: Seam after Session, Mold after Walkthrough, and the new sentences on Level, Walkthrough and Trigger. Patch your own entries. Copying the shipped glossary over yours drops every term you added.
4. **"paper" becomes "documents"** in the Kind chat row and Kind's `close`, wherever yours still says paper.

**Check:** open `/system/method` and open any folded rule. Its terms are dotted links into the glossary, and its `§` references land on their section. No amber band should show.

## 12 · The glossary gets groups, its lists become values, and its cross-references link

**Class:** protocol · parser · convention
**Depends on:** § Glossary and `getGlossary` (`feb807b`) · `MdInline`'s `§` anchor map (`ea479e0`) · `glossaryLede`, and `MdInline` rendering an in-app path as a link (`8542a40`) · the `paused` board status, which the shipped Board entry lists (`1249f34`)
**Resolves:** none

**Does this affect you?** Every project gets the new glossary page by taking the code, step 1. Reshaping your own glossary, steps 2 to 4, is optional: a flat glossary parses exactly as it did.

**What changed.**

- **§ Glossary may carry `### Group — what it holds` headings.** A term belongs to the heading above it, and the page shows the tagline after ` — ` on a line under the group's name. The shipped glossary uses three: **The work** (how it is divided, and who does it), **The documents** (where it is written down) and **The rules** (when steps run, and what may change). A glossary with no headings parses as one unnamed group, and the page renders it with no group heading.
- **A term's values are bullets indented under it:** `  - **value** — what it means`. Seven shipped entries listed a set as running prose: Board's statuses, Mode, Kind, Trigger, Touch bands, Tracker and Tier. Each now ends on a value list. A value is never a term, so the hub's count is unchanged.
- **The glossary page links, and you write no links.** Every term and value gets an anchor (`#board`, `#board-paused`). A term's first mention in another entry links to it, but only where the prose uses it as a noun: right after *a*, *the*, *each*, *its* or a word like them. So "a phase runs one" never links to Run. A `§ Name` reference links to that section in the doc reader. An A–Z strip above the groups lists every term alphabetically.
- **A new drift alarm:** an indented bullet in § Glossary that does not parse as a value. A value's text lives only in its bullet, so a malformed one would render nowhere.
- **`getGlossary` keeps a definition's markdown** now, so the page can render code and bold in it. `glossaryLede` strips it first and returns what it always did.
- **Three wording fixes in the shipped glossary.** **Tier** said "a doc's review cadence", which § Doc Tiers contradicts: a tier says how guarded a doc is, "and nothing else". It now says that. **Kickoff**'s `See "The Kickoff" above` is now `See § The Kickoff`, so it links. **Future Considerations** reads "trigger pending", the trackers section's own phrase, so it does not link to Trigger, which means something else. The lists' counts ("Nine exist", "three editing tiers") went too: the list under each entry is the count now.

**How to adopt.**

1. **The code, from this entry's commit.** In `lib/system.ts`, the glossary block from `GlossaryValue` through `sectionRefs`, plus the `stripMd` line in `glossaryLede`. In `lib/derivation.ts`, the stray-bullet alarm and its import. **If you never changed `app/system/glossary/page.tsx`,** take it whole. **If you did,** the new parts are the `linkGlossary` and `sectionAnchors` calls, the group loop, the A–Z strip and the value list. Your glossary renders grouped or flat, either way with anchors and links.
2. **Groups, if you want them.** Add `### Name — what it holds` headings over your terms. The tagline is optional, and the shipped three are a suggestion. Any headings work, in any order.
3. **Values, if you want them.** Where one of your entries lists a set in prose, move each member to an indented bullet under it and end the definition with a line saying what the list is. Patch your own entries. Copying the shipped glossary over yours would drop every term you added and revert every one you changed.
4. **The parsed-shape comment** at the head of § Glossary: take the new one, so the next person to edit it knows the shape. Do this whenever you take step 2 or 3.
5. **The three wording fixes,** wherever your glossary still carries the shipped text.
6. **`docs/implementation/system-surface.md`:** the Method → Glossary row, and the new bullet under the drift alarms.

**Check:** open `/system/glossary`. Every `§` reference should be a link that lands on its section, and no amber band should show.

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
