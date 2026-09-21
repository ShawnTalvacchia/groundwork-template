import type { ReactNode } from "react";

/**
 * Badge — a small status pill. Five tones mapped to the status token families
 * (neutral / brand / success / warning / error). A basic starting point.
 *
 * @when A short, non-interactive status mark beside the thing it describes —
 * a state, a count, a category.
 * @whenNot For anything clickable: this renders a `<span>`, so a badge that
 * filters or navigates is PillToggle or a Button. And never as a second mark
 * for a state the row already states in words — a thing marked twice reads as
 * loud however you tune it (`component-patterns.md`).
 */

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "error";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-inset text-fg-secondary",
  brand: "bg-brand-subtle text-brand-strong",
  success: "bg-success-light text-success-strong",
  warning: "bg-warning-light text-warning-strong",
  error: "bg-error-light text-error-strong",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-sm py-tiny text-2xs font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
