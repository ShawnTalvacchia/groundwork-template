import { areaLabel, getOpenQuestions } from "@/lib/system";
import { MdInline, PageIntro, SourceNote } from "../ui";

// Everything in the log is open — resolved questions are deleted, not marked.
// So this page can't overcount, and a topic's count is just its entries.
//
// Area pills are formatted, never translated: a question's area is whatever
// word the log used, title-cased for display (`areaLabel`). A fixed label map
// here would dress one project's vocabulary as canonical and silently pass
// through every area it did not know.

export default function QuestionsPage() {
  const topics = getOpenQuestions();
  const total = topics.reduce((n, t) => n + t.questions.length, 0);
  const high = topics.reduce((n, t) => n + t.questions.filter((q) => q.priority === "high").length, 0);

  return (
    <>
      <PageIntro
        title="Open questions"
        count={total}
        blurb="Decisions that are pending and would block or shape work — each naming what would resolve it. Nothing else lives here: known answer + small work goes to the punch list, known direction goes to Future Considerations. At phase open you read your area's questions, not all of them."
      />

      <p className="text-xs leading-relaxed text-fg-tertiary">
        {high} high priority · {topics.length} topics
      </p>

      {topics.map((t) => (
        <section key={t.num} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <div className="flex items-baseline gap-sm">
              <span className="sys-id">§{t.num}</span>
              <h2 className="text-lg font-semibold text-fg-primary flex-1">{t.title}</h2>
              <span className="text-xs text-fg-tertiary whitespace-nowrap">
                {t.questions.length} open
              </span>
            </div>
            {t.assumption && (
              <p className="text-xs text-fg-tertiary leading-relaxed max-w-[70ch]">
                <span className="font-semibold">Assumption:</span> {t.assumption}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-md">
            {t.questions.map((q) => (
              <article key={q.question} className="sys-card flex flex-col gap-sm">
                <h3 className="text-sm font-semibold text-fg-primary">{q.question}</h3>
                <div className="flex items-center gap-sm flex-wrap">
                  {q.area && <span className="sys-pill">{areaLabel(q.area)}</span>}
                  {q.priority === "high" && <span className="sys-pill sys-pill-stale">high</span>}
                  {q.priority && q.priority !== "high" && (
                    <span className="text-2xs text-fg-tertiary">{q.priority} priority</span>
                  )}
                  {q.opened && <span className="text-2xs text-fg-tertiary">opened {q.opened}</span>}
                </div>
                {q.thinking && (
                  <p className="text-xs text-fg-secondary leading-relaxed">
                    <span className="font-semibold">Thinking:</span> <MdInline text={q.thinking} />
                  </p>
                )}
                {q.resolvesWhen && (
                  <p className="text-xs text-fg-tertiary leading-relaxed">
                    <span className="font-semibold">Resolves when:</span>{" "}
                    <MdInline text={q.resolvesWhen} />
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <SourceNote
        href="/system/docs/planning/Open Questions & Assumptions Log.md"
        path="planning/Open Questions & Assumptions Log.md"
        note="read your area's questions at phase open"
      />
    </>
  );
}
