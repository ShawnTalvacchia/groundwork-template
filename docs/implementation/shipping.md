---
category: implementation
status: active
tier: working
last-reviewed: YYYY-MM-DD
read-when: "naming the project, deciding where the record lives, first deploy, or renaming anything later"
---

# Shipping: identity, hosting, and the record

Two things every project settles that live outside the app's code: what it **looks like as an identity** — the name and the mark — and where its **record** lives. The kickoff decides both. This doc is the reference they point at, and it outlives the kickoff because renames and re-skins happen later.

## Where your project's name lives

The kickoff sets these together. Setting only the first is the common mistake: the app says one name while the repo, folder, and deploy URL say another.

| Surface | Where | What it drives |
|---|---|---|
| **Display name** | `lib/project.ts` (`PROJECT_NAME`) | Browser tab, `/system` wordmark, front door at `/`, link-preview image |
| **Package name** | `package.json` (`"name"`) | Tooling output. Not user-facing, but it looks wrong in logs forever |
| **Repo name** | your git host | The clone URL and the public link people see |
| **Folder name** | local disk | Your paths. Also how coding agents key their per-project memory |
| **Deploy project** | your host's dashboard | The deployed URL |

One edit to `lib/project.ts` covers every in-app surface. The other four rows are each their own place. That is the whole trick: the app boundary is not the identity boundary.

## Where your project's mark lives

The other half of the identity, set in the same kickoff session (`KICKOFF.md` → "Make the identity yours"). Three files, one shape.

| Surface | Where | Why it's its own file |
|---|---|---|
| **The mark** | `components/ui/Mark.tsx` | The one home. Everything inside the app renders this |
| **Favicon** | `app/icon.svg` | Served outside the CSS pipeline, so it inherits no stylesheet |
| **Link preview** | `app/opengraph-image.tsx` | Rendered through Satori, which has no CSS at all |

Change the shape in one, change it in all three. The **colour** is the one thing delivered differently per file: `Mark.tsx` reads `var(--brand-main)` and follows your re-skin automatically, while the other two carry the value as a literal.

The favicon's literal is a **lighter** step on the ramp than the other two, on purpose. It is the one renderer whose backdrop you do not control — browser chrome is dark for a lot of people — and the starter's brand colour measures 2.04:1 against a dark tab strip, under the 3:1 non-text minimum. A step lighter clears 3:1 in both directions (3.60:1 dark, 3.41:1 light). Worth re-checking against your own palette when you swap the mark in.

**Fix the edge with colour, not with an outline.** A stroke traced inside the mark's silhouette paints the outermost ring of it, so it does not reinforce the edge — it becomes the edge. The starter carried one briefly and measured *worse* for it: 2.27:1 on a light tab strip, against 3.41:1 for the plain fill. If your own brand is dark rather than light, the trade can run the other way, so measure both backdrops before adding one.

The starter's centre is a real cutout — one path with `fill-rule="evenodd"`, so nothing paints the middle and whatever sits behind the mark shows through. Worth keeping in your own shape: a painted centre has to know what is behind it, and every new callsite is a chance to get that backwards.

**No mark on day one is a fine answer.** Defer it as a Future Consideration with a trigger you choose, so it stays owned instead of forgotten.

## Renaming later

Projects get renamed. It is not hard, but the deploy step has a trap.

1. `lib/project.ts` and `package.json`.
2. **Repo.** `gh repo rename <new-name>` updates your local remote for you. Otherwise rename on the host, then `git remote set-url origin <new-url>`.
3. **Folder.** A plain `mv`. Two things follow it: any agent memory keyed to the old path stays behind (copy it across), and any doc in another project that points at this folder now points at nothing.
4. **Deploy.** Renaming the project does **not** move its public URL. You must also register the new domain, or the new URL answers with your host's login wall while the old one keeps serving.

   On Vercel that is two commands, and the second is the one people miss:

   ```
   vercel project rename <old> <new>
   vercel domains add <new>.vercel.app <new>
   ```

   The old URL keeps resolving, so links you already shared do not break.
5. Sweep for the old name: `git grep -in "<old-name>"`, plus any README links to the deployed URL.

Expect the good short names to be taken on shared hosts like `*.vercel.app`. Check before committing to one.

## Where the record lives

Your product is public. `/system` is your strategy, decisions, open questions, and active boards. Three ways to arrange that, and no default is right for everyone.

### A. One deployment, `/system` gated

What the template ships. Your product and your record deploy together; `proxy.ts` gates `/system`.

- **Good:** one deploy, one pipeline, nothing to keep in sync. The record is reachable from a phone or a collaborator's browser with one password.
- **Cost:** the record shares an origin with the product, so the gate is the only thing between them. Your product's build also carries the dashboard.
- **Pick it when:** you want the record reachable and you are fine with a shared secret.

### B. Two deployments of one repo

Deploy the same repo twice. The public one leaves `SYSTEM_GATE` unset so `/system` blocks itself; the private one sets `SYSTEM_PASSWORD` or is access-controlled at the platform.

- **Good:** the record never shares an origin with the product. Platform-level access control means real accounts and revocation, not a shared password.
- **Cost:** two deploys to configure and keep in sync. More moving parts than most projects need.
- **Pick it when:** the record must not sit behind app code, or you need per-person access.

**`DOCS_ROOT` — pointing a deployment at a different record.** By default `/system` renders this project's `docs/`. Set `DOCS_ROOT` on a deployment to render a different tree instead:

```
DOCS_ROOT=meta-docs
```

Pair it with `PROJECT_NAME_OVERRIDE` when the second deployment should also be *labelled* differently:

```
DOCS_ROOT=meta-docs
PROJECT_NAME_OVERRIDE=My Project (internal)
```

Two uses. A public deploy can render a **deliberately empty or curated** tree while the private deploy renders the real one. And a repo that is itself a template can keep its shipped `docs/` pristine for adopters while tracking its own work in a second tree on a non-default branch — the branch the private deployment builds from. Keep that second tree **additive** (a new directory, never edits to `docs/`) and merging the main branch into it stays conflict-free.

### C. Local only, for now

Do not deploy the dashboard at all. Run it with `npm run dev` while you work.

- **Good:** zero configuration, zero exposure. Perfect while you are still shaping the system and have no real pages to show.
- **Cost:** no access from another device, and nothing to link a collaborator to.
- **Pick it when:** the product is not deployed yet, or the record is genuinely for one person on one machine.

**Deferring is a decision.** Choosing C at kickoff is fine, as long as it is recorded in `decisions.md` with what would change your mind. What is not fine is deploying without having chosen, which is why the gate fails closed in production.

## Configuring the gate

Set on the deployment, not in code:

| Variable | Effect |
|---|---|
| `SYSTEM_PASSWORD=<secret>` | `/system` sits behind a password |
| `SYSTEM_GATE=off` | `/system` is deliberately public |
| neither, in production | `/system` blocks itself and names both variables |

Local development is always open. Full behavior, plus the alternatives table for host-level protection and identity providers: `implementation/system-surface.md` → The gate.
