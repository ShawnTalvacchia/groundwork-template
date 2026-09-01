// Shared nav/IA model for /system — imported by the nav components and the
// server pages so tabs, tiles, and blurbs never drift apart.

export interface SystemPage {
  slug: string; // route segment under /system
  label: string;
  blurb: string; // one-line explainer shown on tiles + group pages
  /** Drill-in page: reachable from its group's overview, not a subtab. */
  hidden?: boolean;
}

export interface SystemGroup {
  slug: string;
  label: string;
  blurb: string;
  pages: SystemPage[];
}

export const GROUPS: SystemGroup[] = [
  {
    slug: "work",
    label: "Work",
    blurb: "What needs to be done — phases, each in one mode and run through its rituals.",
    pages: [
      { slug: "phase", label: "Active board", blurb: "The open board(s) in full.", hidden: true },
      { slug: "roadmap", label: "Roadmap", blurb: "Where we are and what's queued.", hidden: true },
      { slug: "questions", label: "Questions", blurb: "Unresolved strategic questions, §-numbered by topic." },
      { slug: "punch-list", label: "Punch list", blurb: "Small fixes waiting for a sweep. Fixed rows are removed — commits are the record." },
      { slug: "future", label: "Future", blurb: "Known directions parked until a trigger fires, FC-numbered." },
    ],
  },
  {
    slug: "structure",
    label: "Structure",
    blurb: "What the project is made of — the features, the strategy, the docs, the shipped record.",
    pages: [
      { slug: "features", label: "Features", blurb: "One current-state spec per capability, grouped by the areas the docs declare." },
      { slug: "strategy", label: "Strategy", blurb: "What we believe — settled models, drafts, interview kits, research — each with its thesis." },
      { slug: "styleguide", label: "Styleguide", blurb: "The design system's surface — colors, type, tokens, components." },
      { slug: "docs", label: "Docs", blurb: "Every live doc by review tier, with folder and freshness. Doc reading lives here too.", hidden: true },
      { slug: "timeline", label: "Timeline", blurb: "The shipped record — closed phases by month.", hidden: true },
      { slug: "decisions", label: "Decisions", blurb: "Why things are the way they are — dated What/Why/Where entries, newest first.", hidden: true },
    ],
  },
  {
    slug: "method",
    label: "Method",
    blurb: "How we work — the modes and their rituals, the trackers that feed them, and the physics that keep the docs honest.",
    pages: [
      { slug: "trackers", label: "Trackers", blurb: "The three standing lists, what each holds, and how work flows between them." },
      { slug: "tiers", label: "Tiers", blurb: "Review physics — how docs settle, sink, and get reopened." },
      { slug: "glossary", label: "Glossary", blurb: "The system's terms, defined once." },
    ],
  },
];

export function groupForPath(pathname: string): { group: SystemGroup | null; page: SystemPage | null } {
  const seg = pathname.replace(/^\/system\/?/, "").split("/")[0];
  if (!seg) return { group: null, page: null };
  for (const group of GROUPS) {
    if (group.slug === seg) return { group, page: null };
    const page = group.pages.find((p) => p.slug === seg);
    if (page) return { group, page };
  }
  return { group: null, page: null };
}
