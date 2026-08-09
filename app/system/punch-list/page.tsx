import { getPunchItems, stripMd } from "@/lib/system";
import { EmptyNote, IdTag, MdInline, PageIntro, SourceNote } from "../ui";

/** Lead line: the bold-title convention where present, else the first sentence. */
function leadOf(description: string): string {
  const bold = description.match(/^\*\*(.+?)\*\*/);
  if (bold) return stripMd(bold[1]).replace(/\.$/, "");
  const plain = stripMd(description);
  const dot = plain.indexOf(". ");
  return dot > 0 && dot < 160 ? plain.slice(0, dot) : plain.slice(0, 160);
}

export default function PunchListPage() {
  const items = getPunchItems();

  return (
    <>
      <PageIntro
        title="Punch list"
        count={items.length}
        blurb="Small fixes (≤30 min) that run alongside whatever phase is active. Fixed items are removed from the table — commit history is the record — so this list is always the current open set."
      />
      {items.length === 0 && (
        <EmptyNote>Nothing on the punch list — small fixes land here as they are noticed.</EmptyNote>
      )}
      <div className="flex flex-col">
        {items.map((item) => (
          <details key={item.id} className="sys-details">
            <summary>
              <span className="flex items-baseline gap-sm">
                <span className="sys-caret" aria-hidden>
                  ›
                </span>
                <IdTag id={item.id} />
                <span className="text-sm text-fg-primary flex-1 leading-snug">{leadOf(item.description)}</span>
              </span>
              <span className="block pl-xl pt-xs text-2xs text-fg-tertiary">
                {item.category} · {item.area} · added {item.added}
              </span>
            </summary>
            <div className="flex flex-col gap-sm pb-md pl-xl">
              <p className="text-xs text-fg-secondary leading-snug">
                <MdInline text={item.description} />
              </p>
              {item.refs && (
                <p className="text-2xs text-fg-tertiary leading-snug">
                  Refs: <MdInline text={item.refs} />
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
      <SourceNote
        href="/system/docs/planning/punch-list.md"
        path="planning/punch-list.md"
        note="workflow rules live inside the file"
      />
    </>
  );
}
