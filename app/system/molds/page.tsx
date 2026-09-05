import Link from "next/link";
import path from "node:path";
import { getMolds, MODE_META, type DocField } from "@/lib/system";
import { EmptyNote, InsetNote, MdInline, PageIntro, SourceNote } from "../ui";

// The molds — the templates a board or seed is created from.
//
// They are the one doc family the rest of the surface cannot show. The doc
// registry skips `_`-prefixed files, so nothing listed them and only the doc
// reader rendered them, at a URL nothing offered.
//
// What a mold OFFERS is the point of the page, because a mold is only ever
// met as a file you are already filling in: a field it does not list is a
// field nobody knows exists. Two lists say it — the frontmatter block, and
// the bold-led lines under the h1, which are most of what a board author
// actually fills in.
//
// Read-only, deliberately. This page renders what the files already say.

/** The two field lists a mold offers, same shape, same rendering. Labelled by
 *  where they sit, because that is the whole difference a reader needs: one
 *  block is above the page and one is on it. */
function FieldList({ label, fields, docDir }: { label: string; fields: DocField[]; docDir: string }) {
  if (fields.length === 0) return null;
  return (
    <div className="flex flex-col gap-xs">
      <h3 className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{label}</h3>
      <dl className="flex flex-col">
        {fields.map((f) => (
          <div
            key={f.key}
            className="flex flex-col gap-tiny border-b border-edge-light py-sm last:border-0 sm:flex-row sm:gap-md"
          >
            <dt className="text-xs font-mono text-fg-primary sm:w-40 sm:shrink-0">{f.key}</dt>
            <dd className="text-xs text-fg-secondary leading-snug max-w-[64ch]">
              <MdInline text={f.value} docDir={docDir} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function MoldsPage() {
  const molds = getMolds();

  return (
    <>
      <PageIntro
        title="Molds"
        count={molds.length}
        blurb="The templates every board, walkthrough and seed is created from. A mold is met as a file you are already filling in, so what it offers is what gets filled in — a field it never lists is a field nobody knows is there."
      />

      {molds.length === 0 ? (
        <EmptyNote>
          No molds here — a project&apos;s templates are the <code className="sys-code">_</code>-prefixed
          files under <code className="sys-code">docs/phases/</code> and{" "}
          <code className="sys-code">docs/planning/queued/</code>, and this project has none. The first one
          added appears here.
        </EmptyNote>
      ) : (
        <div className="flex flex-col gap-lg">
          {molds.map((mold) => {
            // Bound per mold: `**Mode:** … [the rituals this board runs](../CONTRIBUTING.md)`
            // is written relative to the mold's own folder, and this page
            // renders it from somewhere else.
            const docDir = path.dirname(mold.relPath);
            return (
              <article key={mold.relPath} className="sys-card flex flex-col gap-md">
                <header className="flex flex-col gap-xs">
                  <div className="flex flex-wrap items-baseline gap-sm">
                    <h2 className="text-base font-semibold text-fg-primary">{mold.name}</h2>
                    {mold.mode && <span className="sys-pill">{MODE_META[mold.mode].label}</span>}
                  </div>
                  <Link
                    href={`/system/docs/${mold.relPath}`}
                    className="text-2xs font-mono text-fg-tertiary underline underline-offset-2"
                  >
                    docs/{mold.relPath} →
                  </Link>
                </header>

                {/* Both lists read top to bottom the way the file does: the
                    frontmatter block, then the bold-led lines under the h1.
                    Neither label says "frontmatter" on its own — the word
                    names the syntax rather than the job, and this page is read
                    by someone asking what a mold will ask them for, so the
                    labels name WHERE each block sits.

                    The body list is not decoration. Those lines are most of
                    what a board author fills in, and they are where one
                    project's molds differ from another's. */}
                {mold.fields.length === 0 ? (
                  <EmptyNote>No fields — every doc carries frontmatter, so this mold is missing its block.</EmptyNote>
                ) : (
                  <FieldList label="Fields it offers, in the frontmatter" fields={mold.fields} docDir={docDir} />
                )}
                <FieldList label="Fields it offers, on the page" fields={mold.bodyFields} docDir={docDir} />

                {mold.cards.length > 0 && (
                  <InsetNote label="Explains itself in">
                    <p className="text-xs text-fg-secondary leading-snug">
                      {mold.cards.join(" · ")} — the card the mold carries above its first section.
                    </p>
                  </InsetNote>
                )}

                {mold.sections.length > 0 && (
                  <div className="flex flex-col gap-xs">
                    <h3 className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                      Sections it lays out
                    </h3>
                    <ul className="flex flex-col gap-xs">
                      {mold.sections.map((s) => (
                        <li key={s.heading} className="flex flex-wrap items-baseline gap-sm">
                          <span className="text-xs text-fg-secondary">
                            <MdInline text={s.heading} docDir={docDir} />
                          </span>
                          {s.cards.map((c) => (
                            <span key={c} className="sys-pill">
                              {c}
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <SourceNote
        href="/system/docs/CONTRIBUTING.md#a-mold-explains-itself-in-one-card"
        path="CONTRIBUTING.md → A mold explains itself in one card"
        note={molds.length > 0 ? "the convention; each mold above is its own source" : "the convention a mold follows once one exists"}
      />
    </>
  );
}
