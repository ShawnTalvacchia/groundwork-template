import { getFutureItems } from "@/lib/system";
import { EmptyNote, IdTag, PageIntro, SourceNote } from "../ui";

export default function FuturePage() {
  const items = getFutureItems();

  return (
    <>
      <PageIntro
        title="Future considerations"
        count={items.length}
        blurb="Known directions parked until a trigger fires. The unit here is the trigger, not the task — items promote out (to the punch list, a phase board, or feature scope) when their trigger fires, and leave when a phase ships them."
      />
      {items.length === 0 && (
        <EmptyNote>
          Nothing parked yet — known directions land here with the trigger that will bring them back.
        </EmptyNote>
      )}
      <div className="flex flex-col gap-md">
        {items.map((item) => (
          <div key={item.id} className="sys-card flex flex-col gap-sm">
            <div className="flex items-baseline gap-sm">
              <IdTag id={item.id} />
              <span className="text-sm font-semibold text-fg-primary flex-1">{item.title}</span>
              <span className="text-2xs text-fg-tertiary whitespace-nowrap">added {item.added}</span>
            </div>
            {item.trigger && (
              <p className="text-xs leading-snug">
                <span className="font-semibold text-fg-secondary">Waiting on:</span>{" "}
                <span className="text-fg-secondary">{item.trigger}</span>
              </p>
            )}
            {item.context && (
              <p className="text-xs text-fg-tertiary leading-snug">
                {item.context.length > 280 ? `${item.context.slice(0, 280)}…` : item.context}
              </p>
            )}
            {item.effort && <p className="text-2xs text-fg-tertiary">Effort: {item.effort}</p>}
          </div>
        ))}
      </div>
      <SourceNote
        href="/system/docs/planning/Future Considerations.md"
        path="planning/Future Considerations.md"
      />
    </>
  );
}
