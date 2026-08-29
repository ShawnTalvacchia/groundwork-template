import {
  getAllDocs,
  getArchivedPhases,
  getDecisions,
  getFeatureAreas,
  getFutureItems,
  getGlossary,
  getOpenQuestions,
  getPhasePipeline,
  getPunchItems,
  getQueuedSeeds,
  getRoadmap,
  getStateReferences,
  getTierPhysics,
  getTiers,
  getTrackerModel,
  getWorkModel,
  TIER_ORDER,
  type ReferenceKind,
} from "@/lib/system";
import { getComponentInventory, getStyleguide } from "@/lib/styleguide";

// Drift alarms for the /system surface (knowledge-system Workstream M).
//
// The doc formats are parser API, and format drift fails SILENTLY — a parser
// handed an unexpected shape returns empty or partial, and the page renders
// hollow with no signal. These are invariant checks, not just zero-checks:
// the worst real parser bugs were non-zero-but-wrong (an overcount, a bold
// field swallowing its neighbour), so each parser asserts the shape it
// promises — expected counts, required fields, frontmatter coverage.
//
// WARN, never fail: a drifted doc format must not block a product deploy.
// Alarms render as a band on every /system page (layout.tsx) and console.warn
// at build time. A firing alarm means the DOC drifted from spec — fix the doc
// (formats never bend to the parsers), or update spec + parser deliberately.
//
// The honest limit: correct-shape-wrong-content parses are not catchable
// here. Human review of the surface stays the defense for those.
//
// CALIBRATION (template): these invariants are tuned PRESENCE-NOT-COUNT so a
// fresh project with empty trackers, no archive, and no decisions boots with
// ZERO alarms. What still fires is real drift: a malformed WHERE a list DOES
// have items (a question missing its area, an FC missing its trigger, a doc
// missing its tier), the Work Model / tiers / glossary shape, and the
// styleguide's own completeness. As the project fills in, the surface stays
// honest without ever nagging an empty list. A mature repo may want count
// floors back (e.g. "≥N archived phases"); that's a deliberate re-tightening,
// logged in decisions.md.

export interface DriftAlarm {
  parser: string; // "getWorkModel"
  source: string; // "CONTRIBUTING.md § The Work Model"
  problem: string;
}

let cache: DriftAlarm[] | null = null;

export function getDriftAlarms(): DriftAlarm[] {
  // Memoized for the static build (one parse per worker, warn once). In dev
  // the docs change under a live process, so recompute per request — a stale
  // "all clear" while someone edits a parsed section defeats the point.
  if (cache && process.env.NODE_ENV !== "development") return cache;
  const alarms: DriftAlarm[] = [];
  const alarm = (parser: string, source: string, problem: string) =>
    alarms.push({ parser, source, problem });

  /* ── CONTRIBUTING.md ─────────────────────────────────────────────── */

  const wm = getWorkModel();
  if (wm.modes.length !== 3) {
    alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `parsed ${wm.modes.length} modes, expected 3`);
  }
  for (const m of wm.modes) {
    const missing = [
      !m.purpose && "Purpose",
      !m.reads && "Reads first",
      !m.homeGround && "Home ground",
      !m.careful && "Careful",
      !m.gated && "Gated",
      !m.during && "During",
      m.open.length < 2 && "Opening ritual steps",
      m.close.length < 2 && "Closing ritual steps",
    ].filter(Boolean);
    if (missing.length) {
      alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `mode "${m.label}" missing: ${missing.join(", ")}`);
    }
  }
  if (!wm.lede || wm.sharedRules.length < 3) {
    alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", "lede or shared rules parsed empty");
  }
  // § The parts — the concept layer ships with the template (five parts:
  // Phase, Mode, Ritual, Trigger, Band), so a fresh project boots clean and
  // a missing or malformed block is real drift.
  if (wm.parts.length !== 5) {
    alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `parsed ${wm.parts.length} parts, expected 5`);
  }
  for (const p of wm.parts) {
    const missing = [!p.is && "Is", !p.properties && "Properties"].filter(Boolean);
    if (missing.length) {
      alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `part "${p.name}" missing: ${missing.join(", ")}`);
    }
  }
  // § Session starters + § Adjustments ship with the template too — the front
  // door and the reshaping map. Floors, not exact counts: adopters add rows.
  if (wm.starters.length < 5) {
    alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `parsed ${wm.starters.length} session starters, expected 5+`);
  }
  for (const st of wm.starters) {
    if (!st.arriving || !st.shape || !st.mode || !st.prompt || !st.openBy) {
      alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `starter row "${st.arriving || "?"}" has an empty cell`);
    }
  }
  if (wm.adjustments.length < 3) {
    alarm("getWorkModel", "CONTRIBUTING.md § The Work Model", `parsed ${wm.adjustments.length} adjustments, expected 3+`);
  }

  // § The phase pipeline — presence, not count. A project that reshapes the
  // model may delete the section (silent), but a section that exists and
  // parses hollow is drift: the method page would render its heading over
  // nothing. No role-count assertion — the roles are the project's own words.
  const pipeline = getPhasePipeline();
  if (pipeline && (!pipeline.lede || pipeline.roles.length === 0)) {
    alarm(
      "getPhasePipeline",
      "CONTRIBUTING.md § The phase pipeline",
      "section present but its lede or role bullets parsed empty",
    );
  }

  const tm = getTrackerModel();
  if (tm.trackers.length < 2 || tm.flow.length < 2 || !tm.sharedRule) {
    alarm(
      "getTrackerModel",
      "CONTRIBUTING.md § The Planning Trackers",
      `parsed ${tm.trackers.length} trackers, ${tm.flow.length} flow rules — expected 2+ each and a shared rule`,
    );
  }

  const tiers = getTiers();
  const tierKeys = new Set(tiers.map((t) => t.key));
  if (tiers.length !== 4 || !TIER_ORDER.every((k) => tierKeys.has(k))) {
    alarm("getTiers", "CONTRIBUTING.md § Doc Tiers & Review Physics", `parsed ${tiers.length} tier rows, expected the 4 known tiers`);
  }
  for (const key of ["commitments", "working"] as const) {
    if ((tiers.find((t) => t.key === key)?.staleAfterDays ?? null) === null) {
      alarm("getTiers", "CONTRIBUTING.md § Doc Tiers & Review Physics", `"${key}" has no Stale-after threshold — staleness flags are dead`);
    }
  }
  const physics = getTierPhysics();
  const emptyPhysics = Object.entries(physics)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (emptyPhysics.length) {
    alarm("getTierPhysics", "CONTRIBUTING.md § Doc Tiers & Review Physics", `empty fields: ${emptyPhysics.join(", ")}`);
  }

  if (getGlossary().length < 5) {
    alarm("getGlossary", "CONTRIBUTING.md § Glossary", `parsed ${getGlossary().length} terms, expected 5+`);
  }

  /* ── The trackers ────────────────────────────────────────────────── */

  // Empty trackers are the fresh-project norm, not drift — a populated list
  // with a malformed row IS drift. So: no zero-checks here, only shape checks
  // that run over whatever items exist.
  const topics = getOpenQuestions();
  const questions = topics.flatMap((t) => t.questions);
  const missingMeta = questions.filter((q) => !q.area || !q.resolvesWhen).length;
  if (missingMeta) {
    alarm("getOpenQuestions", "planning/Open Questions & Assumptions Log.md", `${missingMeta} question(s) missing area or resolves-when`);
  }

  const fcs = getFutureItems();
  const fcNoTrigger = fcs.filter((f) => !f.trigger).length;
  if (fcNoTrigger) {
    alarm("getFutureItems", "planning/Future Considerations.md", `${fcNoTrigger} FC item(s) missing a Trigger field`);
  }

  /* ── The record ──────────────────────────────────────────────────── */

  const decisions = getDecisions();
  const decNoWhat = decisions.filter((d) => !d.what).length;
  if (decNoWhat) {
    alarm("getDecisions", "decisions.md", `${decNoWhat} entrie(s) missing a What field`);
  }
  // Scope replaced Where. An entry still carrying the retired field parses
  // with an empty scope and renders without it, which is a silent failure —
  // so it is named here. Presence-not-count, like every invariant: a project
  // with no decisions fires nothing.
  const decNoScope = decisions.filter((d) => d.what && !d.scope).length;
  if (decNoScope) {
    alarm("getDecisions", "decisions.md", `${decNoScope} entrie(s) missing a Scope field (retired Where?)`);
  }

  const roadmap = getRoadmap();
  // An empty queue is valid (a fresh project has queued nothing yet), so the
  // phase table isn't required — but goal + Where We Are always render.
  if (!roadmap.goal || roadmap.whereWeAre.length === 0) {
    alarm("getRoadmap", "ROADMAP.md", "goal or Where We Are parsed empty");
  }
  // Key Considerations: bullets that don't parse. Presence-not-count - a fresh
  // ROADMAP carries the section with a placeholder and no bullets, which is
  // silent. It fires when the section HAS `- ` items and none reached
  // `keyConsiderations`: the lenses are written and the page shows none.
  if (roadmap.keyConsiderationsWritten > 0 && roadmap.keyConsiderations.length === 0) {
    alarm(
      "getRoadmap",
      "ROADMAP.md § Key Considerations",
      `${roadmap.keyConsiderationsWritten} bullet(s) written, 0 parsed — each lens is \`- **Title:** text\`, and the page renders nothing without the bold title`,
    );
  }

  // The seed ↔ queued-row match is bidirectional and mode-agnostic (2026-07-20:
  // the queue holds upcoming work of any mode; every queued row carries a seed,
  // and the roadmap card IS the link to it). A rename on either side silently
  // unlinks the card from its accumulating plan; a seedless row renders an
  // inert card.
  const seeds = getQueuedSeeds();
  const phaseNames = new Set(roadmap.phases.map((p) => p.name));
  const seedPhases = new Set(seeds.map((s) => s.phase));
  for (const seed of seeds) {
    if (!phaseNames.has(seed.phase)) {
      alarm(
        "getQueuedSeeds",
        seed.relPath,
        `phase "${seed.phase}" matches no queued ROADMAP row — the seed is orphaned`,
      );
    }
  }
  for (const p of roadmap.phases) {
    // Every What's-Next row owes a seed: an opening phase removes its row from
    // the ROADMAP in the same step that deletes its seed (Mode 1 ritual step 1
    // — the roadmap is future-only; the active board is the open-phase pointer).
    if (!seedPhases.has(p.name)) {
      alarm(
        "getQueuedSeeds",
        "planning/queued/",
        `queued ROADMAP row "${p.name}" has no seed — its card has nothing to link to`,
      );
    }
  }

  // Dangling references: every tracker ID named in the two state docs must
  // still exist in its tracker. The failure this catches is a doc claiming
  // something is pending after the item shipped and left the tracker — a
  // ROADMAP that names a punch item by ID three paragraphs above a line
  // saying it is done, which no format check can see because both lines
  // parse perfectly.
  //
  // Presence-not-count, like everything else here: a fresh project whose
  // ROADMAP names no IDs produces no references and fires nothing.
  const punchIds = new Set(getPunchItems().map((p) => p.id));
  const fcIds = new Set(getFutureItems().map((f) => f.id));
  const questionIds = new Set(topics.map((t) => `§${t.num}`));
  const trackerOf: Record<ReferenceKind, { ids: Set<string>; doc: string }> = {
    punch: { ids: punchIds, doc: "planning/punch-list.md" },
    future: { ids: fcIds, doc: "planning/Future Considerations.md" },
    question: { ids: questionIds, doc: "planning/Open Questions & Assumptions Log.md" },
  };
  for (const ref of getStateReferences()) {
    const tracker = trackerOf[ref.kind];
    if (!tracker.ids.has(ref.id)) {
      alarm(
        "getStateReferences",
        ref.source,
        `names ${ref.id}, which is not in ${tracker.doc} — the item was resolved and removed, or the ID is wrong`,
      );
    }
  }

  // No archive-count floor: a fresh project has closed no phases yet. The
  // timeline simply renders empty until the first phase archives.

  /* ── Frontmatter coverage (the registry contracts) ───────────────── */

  const docs = getAllDocs();
  // A low floor catches a broken walk (0 docs) without demanding a mature
  // tree; the real check is the per-doc frontmatter coverage below.
  if (docs.length < 3) {
    alarm("getAllDocs", "docs/ (live tree)", `parsed ${docs.length} docs — the doc walk looks broken`);
  }
  const bad = (label: string, paths: string[]) => {
    if (paths.length) alarm("getAllDocs", "doc frontmatter", `${label}: ${paths.join(", ")}`);
  };
  bad("missing tier", docs.filter((d) => !d.tier).map((d) => d.relPath));
  bad("missing read-when", docs.filter((d) => !d.readWhen).map((d) => d.relPath));
  bad("missing last-reviewed", docs.filter((d) => !d.lastReviewed).map((d) => d.relPath));
  bad(
    "feature doc missing feature-status",
    docs.filter((d) => d.dir === "features" && !d.featureStatus).map((d) => d.relPath),
  );
  bad(
    "strategy doc missing summary",
    docs.filter((d) => d.dir === "strategy" && !d.summary).map((d) => d.relPath),
  );

  /* ── The surface speaks the project's language ───────────────────── */

  // Every product feature must land in a bucket the Features page renders.
  // A content invariant rather than a format one, and it earns that the same
  // way dangling references do: the failure is a page that parses perfectly
  // and shows the wrong thing — a doc that exists, counts toward the header,
  // and appears nowhere on the page under it.
  //
  // That is not hypothetical. The area SET was once hardcoded to one
  // product's own vocabulary, so any feature outside that list rendered
  // nowhere, invisible from inside the project that shipped it. The set now
  // derives (`getFeatureAreas`), which makes total coverage true by
  // construction — so this fires only if someone reintroduces a fixed
  // vocabulary. That is exactly the recurrence it is here to catch.
  //
  // The honest limit, stated because the file states its others: this checks
  // that no doc is dropped, not that the labels came from the docs. Nothing
  // in lib/ can see a literal authored into a page under app/. What it does
  // guarantee is that a hardcoded set cannot stay silent — it drops docs, and
  // dropped docs alarm here.
  const areaKeys = new Set(getFeatureAreas().map((a) => a.key));
  const dropped = docs
    .filter((d) => d.dir === "features" && d.featureKind !== "demo")
    .filter((d) => d.area && !areaKeys.has(d.area))
    .map((d) => `${d.relPath} (area: ${d.area})`);
  if (dropped.length) {
    alarm(
      "getFeatureAreas",
      "docs/features/ frontmatter",
      `${dropped.length} feature doc(s) render in no area bucket — the page's vocabulary is not the docs': ${dropped.join(", ")}`,
    );
  }

  /* ── globals.css (the styleguide's source) ───────────────────────── */

  const sg = getStyleguide();
  if (sg.root.length < 12 || sg.theme.length < 8) {
    alarm(
      "getStyleguide",
      "app/globals.css (banner comments)",
      `parsed ${sg.root.length} :root sections + ${sg.theme.length} @theme sections, expected 12+/8+ — a banner-comment reformat regroups or drops tokens`,
    );
  }
  if (sg.definedCount < 200) {
    alarm("getStyleguide", "app/globals.css", `parsed ${sg.definedCount} token definitions, expected 200+`);
  }
  if (!sg.root.some((s) => s.title.includes("SEMANTIC TOKENS — Surface"))) {
    alarm("getStyleguide", "app/globals.css", "the SEMANTIC TOKENS — Surface section didn't parse");
  }
  const typeScale = sg.theme.find((s) => s.title === "Font Size");
  if (!typeScale || typeScale.tokens.length < 8) {
    alarm("getStyleguide", "app/globals.css (@theme ── Font Size ──)", "the canonical --text-* scale didn't parse");
  }
  // Presence-not-count: the starter ships components/ui; overlays and layout
  // are grown by the adopter. Alarm only if NO shared components exist at all
  // (the reuse-first inventory would be empty).
  const inventory = getComponentInventory();
  if (inventory.every((g) => g.components.length === 0)) {
    alarm("getComponentInventory", "components/ui · overlays · layout", "no shared components found in any dir");
  }

  for (const a of alarms) {
    // "DRIFT" leads so the line is greppable in a build log. The build still
    // passes (see WARN, never fail above) - `npm run verify` is the gate that
    // reads these back and exits non-zero.
    console.warn(`DRIFT [system-surface] ${a.parser} (${a.source}): ${a.problem}`);
  }
  cache = alarms;
  return alarms;
}
