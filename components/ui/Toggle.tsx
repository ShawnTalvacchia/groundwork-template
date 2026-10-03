"use client";

/**
 * Toggle — a starter on/off switch. Controlled: pass `checked` + `onChange`.
 * Styled from the semantic tokens; the track turns brand when on. Off, it is
 * drawn in the control boundary (`--border-stronger`): a ring around a sunken
 * track and a knob in the same colour, so both the switch and its state
 * clear the 3:1 floor for a component on any surface. A light knob on a grey
 * track cannot: the pair the eye needs is the one that measures lowest. A
 * basic starting point.
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
      className={`inline-flex h-[24px] w-[42px] shrink-0 items-center rounded-full border px-[2px] transition-colors disabled:opacity-50 ${
        checked ? "border-transparent bg-brand-main justify-end" : "border-edge-stronger bg-surface-inset justify-start"
      }`}
    >
      <span
        className={`h-[18px] w-[18px] rounded-full ${checked ? "bg-surface-top shadow-sm" : "bg-edge-stronger"}`}
      />
    </button>
  );
}
