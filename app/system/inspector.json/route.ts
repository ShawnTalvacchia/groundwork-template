import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getComponentDetails, getStyleguide, utilityByRootToken } from "@/lib/styleguide";
import { PROJECT_NAME } from "@/lib/project";
import { headingSlug } from "@/lib/system";

/**
 * The element inspector's data feed: token names with their authored chains
 * and Tailwind utilities (from the same parser the styleguide renders from),
 * the shared component inventory, and the shared UI rules.
 *
 * It lives under /system ON PURPOSE. Everything here beyond the token names
 * derives from the record (component-patterns.md), and /system is where the
 * record's gate already stands: proxy.ts matches /system/:path*, so this
 * route is open in dev, public only under an explicit SYSTEM_GATE=off, and
 * otherwise behind the password. The overlay degrades to stylesheet-derived
 * token names when this route is unreachable.
 */

export const dynamic = "force-static";

interface Pattern {
  title: string;
  body: string;
  /** Deep link to this exact rule on the rendered doc page. */
  url: string;
}

/** Repo-relative path (for a session to open) and its rendered page. */
const PATTERNS_DOC = "implementation/component-patterns.md";

/** True when a doc exists under this project's `docs/`. Load-bearing for the
 *  export: `/system/docs/<path>` is statically generated with dynamicParams
 *  off, so a pointer at an absent file is a hard 404 rather than a graceful
 *  miss. The template ships without `component-patterns.md`, so pointers are
 *  derived from what is actually present instead of hardcoded — the same
 *  derived-never-authored law the rest of the surface follows. */
function docExists(relPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "docs", relPath));
}

/** The H2 rules of component-patterns.md, title + prose (fences dropped). */
function getPatterns(): Pattern[] {
  const p = path.join(process.cwd(), "docs", PATTERNS_DOC);
  if (!fs.existsSync(p)) return [];
  const text = fs
    .readFileSync(p, "utf-8")
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/```[\s\S]*?```/g, "");
  return text
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [rawTitle, ...rest] = chunk.split("\n");
      const heading = rawTitle.trim();
      const body = rest.join(" ").replace(/\s+/g, " ").replace(/\*\*/g, "").trim();
      return {
        // Backticks are markup in the source; the rendered heading has none.
        title: heading.replace(/`/g, ""),
        body: body.replace(/`/g, ""),
        url: `/system/docs/${PATTERNS_DOC}#${headingSlug(heading)}`,
      };
    })
    .filter((s) => s.title && s.body);
}

export async function GET() {
  const styleguide = getStyleguide();
  const utilities = utilityByRootToken();

  const tokens = styleguide.root.flatMap((section) =>
    section.tokens.map((t) => ({
      name: t.name,
      raw: t.raw,
      utility: utilities.get(t.name) ?? null,
    }))
  );

  // Full details, not just the inventory: docblock (the component's one-home
  // "why"), the static class signature that identifies server components,
  // variant maps, and the usage census. All derived from component source.
  const components = getComponentDetails();

  return NextResponse.json({
    project: PROJECT_NAME,
    tokens,
    components,
    patterns: getPatterns(),
    // Where a missing rule would be written. The panel's "none recorded"
    // nudge links here, so the gap is one click from being filled. Empty
    // when the doc is absent, and the panel drops the link rather than
    // offering a 404.
    patternsDocUrl: docExists(PATTERNS_DOC) ? `/system/docs/${PATTERNS_DOC}` : "",
    // Pointers to where you'd go to understand what you PINNED. `path` is
    // repo-relative, for a session that wants to open the file; `url` is the
    // rendered page, for the human reading the panel. A route that is not a
    // doc (the styleguide) carries no path and always exists.
    //
    // Deliberately NOT here: the inspector's own feature doc. The other
    // pointers are about the subject; that one is about the instrument, it
    // answers a question nobody has while pinned on a button, and it rode
    // into every copied context block where a session had no use for it.
    docs: [
      ...(docExists(PATTERNS_DOC)
        ? [
            {
              label: "Shared UI rules",
              path: `docs/${PATTERNS_DOC}`,
              url: `/system/docs/${PATTERNS_DOC}`,
            },
          ]
        : []),
      { label: "The live styleguide", path: null, url: "/system/styleguide/components" },
    ],
  });
}
