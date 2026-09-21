"use client";

/**
 * Toggle — a starter on/off switch. Controlled: pass `checked` + `onChange`.
 * Styled from the semantic tokens; the track turns brand when on. A basic
 * starting point.
 *
 * @when A single setting that takes effect immediately — the reader flips it
 * and the thing is on.
 * @whenNot For a choice that only applies on submit, which is a checkbox, and
 * for one of several options, which is PillToggle. It carries no label of its
 * own beyond `aria-label`, so a visible one belongs beside it.
 */

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-[24px] w-[42px] shrink-0 items-center rounded-full border border-transparent px-[2px] transition-colors disabled:opacity-50 ${
        checked ? "bg-brand-main justify-end" : "bg-surface-gray justify-start"
      }`}
    >
      <span className="h-[18px] w-[18px] rounded-full bg-surface-top shadow-sm" />
    </button>
  );
}
