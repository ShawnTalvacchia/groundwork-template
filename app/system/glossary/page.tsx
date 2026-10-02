import { getGlossary, linkGlossary, sectionHrefs, type GlossaryGroup, type GlossaryTerm } from "@/lib/system";
import { glossaryHref, MdInline, PageIntro, SourceNote } from "../ui";

export default function GlossaryPage() {
  const canon = "/system/docs/CONTRIBUTING.md";
  const terms = linkGlossary(getGlossary(), glossaryHref);

  // `§ Name` references link to the section they name, in the doc reader —
  // the one place every section of the canon renders, parsed or not. This
  // page renders none of them, so nothing resolves in-page.
  const anchors = sectionHrefs(
    "CONTRIBUTING.md",
    terms.flatMap((t) => [t.def, ...t.values.map((v) => v.def)]),
    (id) => `${canon}#${id}`,
  );

  // The canon's own grouping, in its own order. A glossary with no `###`
  // headings is one unnamed group and renders with no group heading at all.
  const groups: { group: GlossaryGroup | null; terms: GlossaryTerm[] }[] = [];
  for (const t of terms) {
    const last = groups[groups.length - 1];
    if (last && last.group === t.group) last.terms.push(t);
    else groups.push({ group: t.group, terms: [t] });
  }

  // The strip restores lookup by name, which grouping by meaning gives up:
  // every term, alphabetically. No letter headings — at this size the order
  // is the index, and a letter set in the same type as the terms reads as
  // one more word in the row.
  const alphabetical = [...terms].sort((a, b) => a.term.localeCompare(b.term));

  // A value named for a term of its own (Mode's `queue-shaping`, Trigger's
  // `kickoff`) links to that term.
  const termNamed = new Map(terms.map((t) => [t.term.toLowerCase(), t]));

  return (
    <>
      <PageIntro
        title="Glossary"
        blurb="The system's terms, defined once and used consistently everywhere — docs, boards, and these pages."
      />
      <nav aria-label="Terms, A to Z" className="flex flex-col gap-sm border-b border-edge-light pb-md">
        <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">A–Z</span>
        <ul className="flex flex-wrap gap-x-xl gap-y-sm text-xs">
          {alphabetical.map((t) => (
            <li key={t.anchor}>
              <a href={`#${t.anchor}`} className="text-fg-secondary hover:text-brand-main hover:underline">
                {t.term}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {groups.map((g) => (
        <section key={g.group?.name ?? "terms"} className="flex flex-col gap-sm">
          {/* The heading's tagline is the canon's `### Name — tagline` form:
              a group name alone ("The documents") says what it is, the line
              under it says what belongs there. Written mid-heading it starts
              lowercase; set on a line of its own it is a sentence, so its
              first letter is cased, as `glossaryLede` does. */}
          {g.group && (
            <header className="flex flex-col gap-tiny">
              <h2 className="text-lg font-semibold text-fg-primary">{g.group.name}</h2>
              {g.group.tagline && (
                <p className="text-sm leading-relaxed text-fg-secondary">
                  {g.group.tagline.charAt(0).toUpperCase() + g.group.tagline.slice(1)}
                </p>
              )}
            </header>
          )}
          <dl className="flex flex-col">
            {g.terms.map((t) => (
              <div
                key={t.anchor}
                id={t.anchor}
                className="flex flex-col gap-xs border-b border-edge-light py-md sm:flex-row sm:gap-lg"
              >
                {/* Every entry links out to several others, so the underline
                    is dotted until hovered: still marked as a link, in the
                    text's own colour and so its contrast, and no longer the
                    loudest thing in the definition. A border tone was tried
                    and vanished on the light background. */}
                <dt className="text-sm font-semibold text-fg-primary sm:w-32 sm:shrink-0">{t.term}</dt>
                <dd className="flex flex-col gap-sm text-xs text-fg-secondary leading-relaxed max-w-[64ch] [&_a]:decoration-dotted [&_a:hover]:decoration-solid">
                  <span>
                    <MdInline text={t.def} anchors={anchors} />
                  </span>
                  {t.values.length > 0 && (
                    <dl className="flex flex-col gap-xs border-l border-edge-light pl-md">
                      {t.values.map((v) => {
                        const same = termNamed.get(v.name.toLowerCase());
                        return (
                          <div key={v.anchor} id={v.anchor} className="flex flex-col sm:flex-row sm:gap-md">
                            <dt className="font-semibold text-fg-primary sm:w-28 sm:shrink-0">
                              {same && same.anchor !== t.anchor ? (
                                <a href={`#${same.anchor}`} className="underline underline-offset-2">
                                  {v.name}
                                </a>
                              ) : (
                                v.name
                              )}
                            </dt>
                            {v.def && (
                              <dd>
                                <MdInline text={v.def} anchors={anchors} />
                              </dd>
                            )}
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <SourceNote href={`${canon}#glossary`} path="CONTRIBUTING.md → Glossary" />
    </>
  );
}
