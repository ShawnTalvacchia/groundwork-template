---
category: meta
status: active
tier: commitments
last-reviewed: YYYY-MM-DD
read-when: "phase close (lift load-bearing walkthrough decisions here), retrospectives"
---

# Decisions log

The long-term institutional memory: dated design + product decisions, newest first. Each entry answers **What** we decided, **Why** it holds, what we chose **Instead of**, and the **Scope** it governs.

**Why there is no file list.** An earlier **Where** field named the files a decision touched, and it was the only field making a claim about the *present* — so the only one that could rot, and nothing checked it. Git already holds the diff, frozen to the change; **Scope** names what the decision governs instead, which does not move when a file does.

How this fits the pipeline: walkthrough docs collect the calls a phase settles ("Decisions surfaced"). At phase close, the **load-bearing** entries get lifted here so they survive the archive. Off-phase decisions (PO calls, system work) land here directly. Don't log every call — only ones that would surprise a reader six months out, or that future-us might reopen.

**One call, one entry, in final form.** Write the decision that survived, not the route to it — rounds of back-and-forth, options tried and dropped, corrections along the way are one entry. A decision reopened later is **amended** as a new dated entry; prior entries are never **silently** rewritten.

**Silently is the word that carries it.** Git holds every prior version of this file, so the rule is not what makes history durable — what it protects is that nobody quietly changes what you decided. Two edits to a prior entry are therefore allowed, because both are dated and leave a trace:

- **Supersession** — a `**Superseded** by "<title>" (YYYY-MM-DD).` line above the entry's **What**, the entry itself kept as written. For a call that was reversed, where the reversal is the information.
- **Merge** — one entry carrying the date of the **latest** call it absorbs, so the file's chronology stays honest, naming in its **Scope** which entries it absorbed and on what date the merge ran. For several entries that record one call.

Any other edit to a prior entry is a silent rewrite, and is what the rule forbids.

**How the call was found is not part of the call.** Who noticed it, what nearly happened instead, how often the pattern has recurred: that is the phase's story, and its home is the archive record, not here. An entry earns its length with reasons a reader can test the call against — never with the account of its own discovery.

## Format

```
## YYYY-MM-DD · Short title

**What:** One sentence stating the decision.
**Why:** At most two sentences — the constraint a reader tests the call against, never how we got there.
**Instead of:**
- One line per rejected alternative: what it was, and why it lost. Omit the field when nothing was weighed.
**Scope:** What the decision governs, in durable terms — a rule, a surface, a band, a ritual step.
```

## Entries

<!-- PARSED by lib/system.ts (getDecisions) -> /system/decisions + the Structure overview. Changing this section's SHAPE
     (the '## YYYY-MM-DD · Title' headings and the bold What/Why/Instead of/Scope fields) breaks that page silently - the /system drift banner will name it.
     Check /system after editing. Spec: docs/implementation/system-surface.md -->

_(No decisions logged yet — the kickoff logs the first ones. Newest first; the count on `/system` is derived from the entries below.)_
