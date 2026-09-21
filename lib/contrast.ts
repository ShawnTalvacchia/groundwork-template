/* Contrast ratios for the styleguide's rendered demos.
 *
 * WCAG 2.x relative luminance and the 4.5:1 floor for small text, computed
 * from the token values `lib/styleguide.ts` already parses — so a measurement
 * on the page is the same number the CSS resolves to, in both themes, without
 * anyone re-typing a hex into a comment.
 *
 * Why this exists at all: every ratio the repo records today was measured by
 * hand at one callsite and written into a comment, where it goes stale the
 * moment the ramp moves (`decisions.md` 2026-09-10 — a measured failure is
 * fixed where the token resolves, not at the callsite). A ratio the build
 * computes cannot drift from the value it describes.
 *
 * Nothing here reads a file or a token name; it takes resolved CSS values.
 * That keeps it usable from the demo registry, the token pages and a script
 * alike, and it is why this is its own module rather than more of
 * `styleguide.ts`.
 */

export interface Rgba {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-1
}

/** Parses the value forms this project's tokens actually resolve to: hex in
 *  3/4/6/8 digits, `rgb()` / `rgba()`, and the one `color-mix` form below.
 *  Anything else returns null, and the caller renders the absence rather than
 *  a wrong number — a contrast check that guesses is worse than one that
 *  says it could not read the value. */
export function parseColor(value: string): Rgba | null {
  const v = value.trim();

  const hex = v.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const wide = hex.length <= 4 ? [...hex].map((c) => c + c).join("") : hex;
    const n = (i: number) => parseInt(wide.slice(i * 2, i * 2 + 2), 16);
    return { r: n(0), g: n(1), b: n(2), a: wide.length === 8 ? n(3) / 255 : 1 };
  }

  const fn = v.match(/^rgba?\(([^)]+)\)$/i)?.[1];
  if (fn) {
    const p = fn.split(/[\s,/]+/).filter(Boolean);
    if (p.length >= 3) {
      const c = (s: string) => (s.endsWith("%") ? (parseFloat(s) / 100) * 255 : parseFloat(s));
      const alpha = p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
      const out = { r: c(p[0]), g: c(p[1]), b: c(p[2]), a: alpha };
      if ([out.r, out.g, out.b, out.a].every(Number.isFinite)) return out;
    }
  }

  // `color-mix(in <space>, <color> N%, transparent)` — the fade form the
  // brand's own tokens use (`--brand-faded`). Mixing a colour with
  // `transparent` leaves the colour and scales its alpha to N%, whatever the
  // interpolation space, because the other side contributes no colour. Any
  // other color-mix (two real colours) is NOT handled: the result depends on
  // the space, and guessing it would be the wrong-number failure above.
  const mix = v.match(/^color-mix\(\s*in\s+[\w-]+\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i);
  if (mix) {
    const base = parseColor(mix[1]);
    if (base) return { ...base, a: base.a * (parseFloat(mix[2]) / 100) };
  }

  return null;
}

/** Composites a possibly-translucent colour over an opaque backdrop.
 *  An overlay has no ratio of its own — `--brand-faded` at 45% measures one
 *  thing on `--surface-top` and another on `--surface-inset`, which is why
 *  the registry names what each demo renders against. */
export function over(fg: Rgba, backdrop: Rgba): Rgba {
  const a = fg.a;
  return {
    r: fg.r * a + backdrop.r * (1 - a),
    g: fg.g * a + backdrop.g * (1 - a),
    b: fg.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

/** WCAG 2.x relative luminance. */
function luminance({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** The WCAG contrast ratio between two opaque colours, 1–21. */
export function ratio(a: Rgba, b: Rgba): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** The AA floor for text below 18.66px/bold or 24px/regular. Everything the
 *  demos paint as a label is under it, so this is the bar the page prints. */
export const AA_SMALL_TEXT = 4.5;

/** The AA floor for a graphical object or a UI component boundary — an icon,
 *  a switch track, a border that carries meaning. */
export const AA_NON_TEXT = 3;

export interface Measurement {
  /** Resolved foreground value, composited if it was translucent. */
  fg: string;
  /** Resolved background value. */
  bg: string;
  ratio: number;
  floor: number;
  passes: boolean;
}

/** Measures one foreground/background pair, compositing each over `backdrop`
 *  when it is translucent. Returns null when any value could not be read. */
export function measure(
  fgValue: string,
  bgValue: string,
  floor: number,
  backdropValue?: string
): Measurement | null {
  const fgRaw = parseColor(fgValue);
  const bgRaw = parseColor(bgValue);
  if (!fgRaw || !bgRaw) return null;

  const backdrop = backdropValue ? parseColor(backdropValue) : null;
  if (backdropValue && !backdrop) return null;

  // The background settles first: a translucent foreground then sits on the
  // colour the eye actually sees, not on the overlay's own value.
  const bg = bgRaw.a < 1 ? over(bgRaw, backdrop ?? { r: 255, g: 255, b: 255, a: 1 }) : bgRaw;
  const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;

  const r = ratio(fg, bg);
  return {
    fg: toHex(fg),
    bg: toHex(bg),
    ratio: r,
    floor,
    // Rounded to the figure the page prints, so a pair that displays as
    // "4.50" is never reported as failing.
    passes: Math.round(r * 100) / 100 >= floor,
  };
}

function toHex({ r, g, b }: Rgba): string {
  const h = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
