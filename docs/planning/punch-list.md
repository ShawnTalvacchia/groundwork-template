---
status: active
tier: surface
last-reviewed: YYYY-MM-DD
read-when: "any time — add items as they're noticed, fix them when convenient"
---

# Punch List

<!-- PARSED by lib/system.ts (getPunchItems) -> /system/punch-list. Changing this section's SHAPE
     (the 7-column '| P## | ... |' table rows) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

Running list of small fixes (≤30 min) that live alongside whatever phase is active. One of three planning trackers — see `CONTRIBUTING.md` → "The Planning Trackers."

---

## Workflow

- **Belongs here:** quick fixes — visual nits, small bugs, content tweaks. Description is 1–2 sentences; refs carry the deeper context.
- **Doesn't belong:** anything needing paragraphs of justification, sub-items, or open design calls — that's phase work, promote it.
- **Adding:** next `P##`, a short title, one-sentence description, category, area, refs, today's date.
- **The title is the row's index entry.** Queue-shaping scans punch titles without reading the descriptions (`CONTRIBUTING.md` → § Queue-shaping), so it has to say what the fix *is* — not what area it's near. Under ~10 words.
- **Removing:** delete the row when fixed — the commit is the record. No ✅ banners.

---

## Items

| ID | Title | Description | Category | Area | Refs | Added |
|----|-------|-------------|----------|------|------|-------|
