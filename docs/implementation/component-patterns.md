---
category: implementation
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
read-when: "before adding a shared UI component, a variant map, or any styling constant a server component will import"
---

# Component patterns

Cross-cutting UI rules for this app — the one home for decisions about how shared components are built and edited. Feature-specific behaviour lives in `features/`.

**This doc starts empty on purpose.** The rules that belong here are yours, written as your components earn them. It exists from day one so the places that point at it — the element inspector's "Write one" nudge, its DOCS panel, the copied context block — have a real target instead of a 404.

### How this doc is read (keep the shape)

The element inspector (`?inspect` on any page) reads this file. **Each rule is one `## ` section: a short imperative title, then the prose.** A rule whose title or body names a shared component travels with that component when someone pins it, in full, into the copied context block; every other rule travels as a title. Deep links land on the rule's own heading. So the shape is parser API: keep one rule per `## ` section, and name the component the rule constrains. (These explainer sections are `###` on purpose — only `## ` sections are served as rules.)

### What belongs here, and what belongs in a docblock

Two homes, one test:

- **A rule that spans components lands here** — why two components share one skin, where styling constants may live, what an action that navigates must render as. If it constrains the *next* component someone builds, it is cross-cutting.
- **A rule about exactly one component lives in that component's leading doc comment** — the docblock is a component's one-home "why". The inspector and the styleguide surface it automatically; writing it twice is the drift this system exists to prevent. Two tags inside that comment are parsed out and rendered on their own: **`@when`** (when to reach for the component) and **`@whenNot`** (when to reach for something else, named). A tag runs to the next tag or the end of the comment, so either may wrap. The nine components this template ships are worked examples, and the styleguide prints a named absence where one is missing. **The comment has to open at column 0** — that is how the parser tells it from a comment on a field inside the file.

The nudge is built in: pin a component and the inspector reports "No rules recorded" with a link back here, at exactly the moment someone cares. That is the intended way this doc fills up.

A rule reads like this (the fence keeps the example out of the inspector's feed):

```markdown
## Link-shaped actions are anchors, not buttons

`Button` renders a `<button>`. `LinkButton` renders a `next/link` anchor.
They are separate components sharing one skin, because a navigating action
has to be an anchor or middle-click, copy-link-address, and assistive
semantics all break. The shared skin lives in `components/ui/buttonStyles.ts`.
```
