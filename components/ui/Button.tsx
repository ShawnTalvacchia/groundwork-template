"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button — the starter action control. Three variants (primary / secondary /
 * ghost) × two sizes. Styled entirely from the semantic design tokens
 * (globals.css), so it re-themes for dark automatically. A basic starting
 * point — extend with icons, loading state, etc. as the project needs.
 *
 * @when An action that happens in place — submitting, toggling a mode,
 * opening a dialog, running something.
 * @whenNot For anything that navigates. A call to action that goes somewhere
 * has to render an anchor, or middle-click, copy-link-address and assistive
 * semantics all break — so that is a separate component wearing this skin,
 * not a prop on this one.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  // The primary label is fg-INVERSE, not fg-white. White on --brand-main
  // measured 2.98:1 in dark, where the brand lifts to stay readable AS text
  // on dark surfaces — so darkening the ramp would break the brand's other
  // job. fg-inverse already flips with the theme: it reads 7.43:1 on the
  // light brand and 5.54:1 on the lifted dark one, hover states included
  // (9.34 / 8.29).
  //
  // Measured on this palette. Re-measure if you re-skin: the RELATIONSHIP
  // survives any brand, the figures do not.
  primary: "bg-brand-main text-fg-inverse hover:bg-brand-strong border border-transparent",
  secondary:
    "bg-surface-top text-fg-primary border border-edge-stronger hover:bg-surface-inset",
  ghost: "bg-transparent text-fg-secondary border border-transparent hover:bg-surface-inset",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "text-xs px-md py-xs gap-xs",
  md: "text-sm px-lg py-sm gap-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-panel font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
