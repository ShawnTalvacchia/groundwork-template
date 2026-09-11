"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Mark } from "@/components/ui/Mark";
import { PROJECT_NAME } from "@/lib/project";
import { GROUPS, groupForPath } from "./nav-model";

// Fixed-size header (title + full-width main pills, the app's segmented
// pattern). The group subtabs render separately in the body via
// <SystemSubtabs/> — a neutral underline bar with its own Overview tab.

export function SystemNav() {
  const pathname = usePathname() ?? "/system";
  const { group } = groupForPath(pathname);
  const isOverview = pathname === "/system";

  return (
    <nav className="sys-nav" aria-label="System sections">
      <div className="sys-nav-inner">
        <div className="sys-header">
          {/* The wordmark is the way out to the app, so it carries the PROJECT's
              name (lib/project.ts) — not "System", which is already the first
              main tab below. Both halves of the identity are the kickoff's:
              the name from lib/project.ts, the mark from components/ui/Mark.tsx. */}
          <Link href="/" className="sys-header-brand" aria-label={`${PROJECT_NAME} home`}>
            <span className="sys-header-logo">
              <Mark size={18} />
              {PROJECT_NAME}
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="tab-bar-container sys-tab-fill">
          <Link href="/system" className="tab-main" data-active={isOverview || undefined}>
            System
          </Link>
          {GROUPS.map((g) => (
            <Link
              key={g.slug}
              href={`/system/${g.slug}`}
              className="tab-main"
              data-active={group?.slug === g.slug || undefined}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * The second row is one of two things, never both:
 *  - on a tabbed page: the group's page tabs
 *  - on a drill-in: a breadcrumb trail at the same size and position
 *
 * The trail *is* the way out (its parent link is the exit), so drill-ins need
 * no separate back button — and a doc page no longer sits under a "Docs" tab
 * that's already active and so reads as un-clickable.
 */
export function SystemSubtabs() {
  const pathname = usePathname() ?? "/system";
  const { group, page } = groupForPath(pathname);
  if (!group) return null;

  const isDocDetail = pathname.startsWith("/system/docs/") && pathname !== "/system/docs";
  // A walkthrough's way out is the BOARD, not the group overview: the board's
  // callout is what sent the reader here, and it is where the two are walked
  // side by side. That is the board's own page, so the exit lands on the board
  // itself rather than on a fragment in a stack of them.
  const isWalkthrough =
    pathname.startsWith("/system/walkthrough/") && pathname !== "/system/walkthrough";
  // A board page's way out is Work's overview, the same parent every other
  // hidden page under Work returns to — NOT `/phase`, which redirects back to
  // this very board whenever it is the only one open. Work's Open boards
  // section is also what "back from a board" should show: the rest of the set.
  // The slug is the board's filename stem, shown verbatim the way a doc page
  // shows its own — a title-cased version would be this component authoring a
  // label, and it cannot read the board's h1 anyway (client component).
  const isBoard = pathname.startsWith("/system/phase/") && pathname !== "/system/phase";
  const slug = decodeURIComponent(pathname.split("/")[3] ?? "");
  const trail = isDocDetail
    ? {
        parent: { href: "/system/docs", label: "Docs" },
        current: decodeURIComponent(pathname.split("/").pop() ?? "").replace(/\.md$/, ""),
      }
    : isWalkthrough
    ? {
        parent: { href: `/system/phase/${slug}`, label: "Active board" },
        current: "Walkthrough",
      }
    : isBoard
    ? {
        parent: { href: `/system/${group.slug}`, label: "Overview" },
        current: slug,
      }
    : page?.hidden
      ? {
          parent: { href: `/system/${group.slug}`, label: "Overview" },
          current: page.label,
        }
      : null;

  if (trail) {
    return (
      <div className="sys-subtabs" role="navigation" aria-label="Breadcrumb">
        <div className="sys-subtabs-inner">
          <Link href={trail.parent.href} className="sys-subtab">
            {trail.parent.label}
          </Link>
          <span className="sys-subtab-sep" aria-hidden>
            ›
          </span>
          <span className="sys-subtab" data-current>
            {trail.current}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-subtabs" role="navigation" aria-label={`${group.label} pages`}>
      <div className="sys-subtabs-inner">
        <Link href={`/system/${group.slug}`} className="sys-subtab" data-active={page === null || undefined}>
          Overview
        </Link>
        {group.pages
          .filter((p) => !p.hidden)
          .map((p) => (
            <Link
              key={p.slug}
              href={`/system/${p.slug}`}
              className="sys-subtab"
              data-active={page?.slug === p.slug || undefined}
            >
              {p.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
