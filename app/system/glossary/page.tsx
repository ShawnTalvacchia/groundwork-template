import { getGlossary } from "@/lib/system";
import { MdInline, PageIntro, SourceNote } from "../ui";

export default function GlossaryPage() {
  const terms = getGlossary();

  return (
    <>
      <PageIntro
        title="Glossary"
        blurb="The system's terms, defined once and used consistently everywhere — docs, boards, and these pages."
      />
      <dl className="flex flex-col">
        {terms.map((t) => (
          <div key={t.term} className="flex flex-col gap-xs border-b border-edge-light py-md sm:flex-row sm:gap-lg">
            <dt className="text-sm font-semibold text-fg-primary sm:w-32 sm:shrink-0">{t.term}</dt>
            <dd className="text-xs text-fg-secondary leading-relaxed max-w-[64ch]">
              <MdInline text={t.def} />
            </dd>
          </div>
        ))}
      </dl>
      <SourceNote href="/system/docs/CONTRIBUTING.md" path="CONTRIBUTING.md → Glossary" />
    </>
  );
}
