"use client";

import type { InputHTMLAttributes } from "react";

/**
 * Input — the starter text field, with an optional label + hint. Styled from
 * the semantic tokens. A basic starting point — extend with icons, error
 * state, and validation as the project needs.
 *
 * @when A single-line value the reader types — a name, an email, a search
 * term. Pass `id` and `label` together; the label is wired with `htmlFor`.
 * @whenNot For a choice from a known set, which is PillToggle or a select,
 * and for anything multi-line. There is no error state here yet, so a field
 * that has to report one needs that built first rather than faked with a hint.
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, id, className, ...rest }: InputProps) {
  return (
    <label className="flex flex-col gap-xs" htmlFor={id}>
      {label && <span className="text-xs font-semibold text-fg-secondary">{label}</span>}
      <input
        id={id}
        className={`rounded-sm border border-edge-stronger bg-surface-top px-md py-sm text-sm text-fg-primary placeholder:text-fg-light focus:border-brand-main focus:outline-none${className ? ` ${className}` : ""}`}
        {...rest}
      />
      {hint && <span className="text-2xs text-fg-tertiary">{hint}</span>}
    </label>
  );
}
