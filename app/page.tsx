import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getActiveBoards } from "@/lib/system";
import { PROJECT_NAME, PROJECT_DESCRIPTION } from "@/lib/project";

// The template ships with no product yet — the root page is a thin front door
// to the /system dashboard (the derived knowledge surface). Replace this with
// your app's real landing page once the first product phase ships.

export default function Home() {
  // Derived, like the /system welcome band: this line exists only while the
  // kickoff board does, so it can never go stale after the bootstrap closes.
  const kickoffOpen = getActiveBoards().some((b) => b.slug === "kickoff");
  return (
    <main className="mx-auto flex min-h-screen max-w-page flex-col justify-center gap-xl px-xl py-3xl">
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-md">
          <p className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
            Placeholder front door
          </p>
          <ThemeToggle />
        </div>
        {/* Name + line come from lib/project.ts, the one home — so the kickoff's
            "one edit renames everything" promise actually holds here too. */}
        <h1 className="text-4xl font-bold text-fg-primary">{PROJECT_NAME}</h1>
        <p className="max-w-prose text-base text-fg-secondary">{PROJECT_DESCRIPTION}</p>
      </div>
      <div className="flex flex-wrap items-center gap-md">
        {/* fg-inverse, not fg-white, for the primary button's reason
            (components/ui/Button.tsx): white on the lifted dark brand fails
            the small-text floor. Re-measure if you re-skin. */}
        <Link
          href="/system"
          className="inline-flex items-center rounded-panel bg-brand-main px-lg py-md text-sm font-semibold text-fg-inverse transition-colors hover:bg-brand-strong"
        >
          Open the /system dashboard →
        </Link>
      </div>
      {kickoffOpen && (
        <p className="max-w-prose text-xs text-fg-tertiary">
          New here? The kickoff board ships already open. <code className="sys-code">KICKOFF.md</code>{" "}
          walks it: fill the strategy shelf, choose the stack, queue the first product phase.
        </p>
      )}
      <p className="max-w-prose text-xs text-fg-tertiary">
        This page is scaffolding, not your product. Replace{" "}
        <code className="sys-code">app/page.tsx</code> when you have a real landing page.
      </p>
    </main>
  );
}
