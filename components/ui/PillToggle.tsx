"use client";

/**
 * PillToggle — a wrapping row of selectable pills. Single-select by default;
 * pass `multi` to allow multiple selections.
 *
 * Uses the canonical `.pill` / `.pill.active` styles from globals.css. Active
 * state is neutral — a strong neutral border + primary text, no action colour,
 * so selection reads as chrome, not meaning.
 *
 * @when Filtering or narrowing a set in place, where the options are few
 * enough to show at once and the reader benefits from seeing them all.
 * @whenNot For switching between peer views, which is TabBar — pills read as
 * a filter over one view, not as a choice of views. And not for a single
 * on/off, which is Toggle.
 */
export function PillToggle({
  options,
  selected,
  onToggle,
  multi = false,
  ariaLabel,
}: {
  options: { value: string; label: string }[];
  selected: string | string[];
  onToggle: (value: string) => void;
  multi?: boolean;
  /** Optional aria-label for the whole group (recommended when the control has no visible label). */
  ariaLabel?: string;
}) {
  const isSelected = (v: string) =>
    multi ? (selected as string[]).includes(v) : selected === v;

  return (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={ariaLabel}
      className="flex flex-wrap gap-xs"
    >
      {options.map((o) => {
        const active = isSelected(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() => onToggle(o.value)}
            className={`pill text-sm${active ? " active" : ""}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
