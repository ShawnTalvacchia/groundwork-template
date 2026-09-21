import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Mark } from "@/components/ui/Mark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AA_NON_TEXT, AA_SMALL_TEXT } from "@/lib/contrast";
import { ToggleDemo, PillToggleDemo, TabBarDemo } from "./demos.client";

/* The demo registry — the styleguide's one authored layer about a component,
 * and deliberately the smaller half.
 *
 * What a component's own comment can carry stays in its docblock: what it is,
 * `@when` to reach for it, `@whenNot` (`decisions.md` 2026-09-20, extending
 * 2026-08-07). This file holds only what a comment cannot — a mount is code
 * that imports the component, and a component cannot import its own demo
 * without a cycle:
 *
 *   - `states`  the mounts, one per state worth seeing beside the others
 *   - `container`  the surface the component's layout needs under it
 *   - `noDemoReason`  why a component has no demo, when that is honest
 *   - `paints`  the foreground/background pairs the demo actually renders,
 *     so the page can measure them instead of quoting a stale comment
 *
 * COVERAGE IS DERIVED FROM THIS FILE, not declared beside it. An entry with
 * `states` is demoed, an entry with `noDemoReason` is deliberately not, and a
 * component in the inventory with neither renders on the page as a named gap.
 * There is no hand-kept list of demoed names to forget to update; there was
 * one (`DEMOED`, a literal Set of five commented "update when adding one") and
 * it was wrong about half the set.
 *
 * AN ENTRY FOR A COMPONENT YOU DO NOT HAVE IS DROPPED SILENTLY. The page
 * joins this registry onto the inventory, so an entry naming a component that
 * is not there renders nothing and alarms nothing — delete a component and
 * its entry can wait. The reverse — a component with no entry — is the gap
 * above, which is the case worth seeing. The one thing that does NOT tolerate
 * an absence is the `import` at the top of this file: a module that is not
 * there is a build error, so an entry's import leaves with its component.
 */

/** One measured pair: what the demo paints, in the demo's own words. */
export interface PaintedPair {
  /** What this pair is, on the page — "inactive label", "primary fill". */
  what: string;
  /** Foreground token, resolved per theme by the page. */
  fg: string;
  /** Background token it sits on. */
  bg: string;
  /** The opaque surface under `bg`, where `bg` is translucent — an overlay
   *  has no ratio of its own. */
  under?: string;
  /** 4.5:1 for text, 3:1 for a graphical object. Defaults to text. */
  floor?: number;
}

export interface DemoState {
  /** The state's name, as the page labels it. */
  label: string;
  mount: ReactNode;
}

export interface DemoEntry {
  /** The states worth seeing side by side. Absent = no demo. */
  states?: DemoState[];
  /** The surface the demo mounts on. `top` is the default card; `inset` is a
   *  sunken area; `base` is the page itself. A component whose own styling
   *  assumes one (TabBar's track is `--surface-inset`) names it, so the demo
   *  is not quietly nicer than the real callsite. */
  container?: "top" | "inset" | "base";
  /** Set only where the absence is deliberate, and it has to say why. */
  noDemoReason?: string;
  paints?: PaintedPair[];
}

const TEXT = AA_SMALL_TEXT;
const GRAPHIC = AA_NON_TEXT;

export const DEMOS: Record<string, DemoEntry> = {
  Badge: {
    container: "top",
    states: [
      { label: "neutral", mount: <Badge tone="neutral">Neutral</Badge> },
      { label: "brand", mount: <Badge tone="brand">Brand</Badge> },
      { label: "success", mount: <Badge tone="success">Success</Badge> },
      { label: "warning", mount: <Badge tone="warning">Warning</Badge> },
      { label: "error", mount: <Badge tone="error">Error</Badge> },
    ],
    paints: [
      { what: "neutral label", fg: "--text-secondary", bg: "--surface-inset", floor: TEXT },
      { what: "brand label", fg: "--brand-strong", bg: "--brand-subtle", floor: TEXT },
      { what: "success label", fg: "--status-success-strong", bg: "--status-success-light", floor: TEXT },
      { what: "warning label", fg: "--status-warning-strong", bg: "--status-warning-light", floor: TEXT },
      { what: "error label", fg: "--status-error-strong", bg: "--status-error-light", floor: TEXT },
    ],
  },

  Button: {
    container: "top",
    states: [
      { label: "primary", mount: <Button variant="primary">Primary</Button> },
      { label: "secondary", mount: <Button variant="secondary">Secondary</Button> },
      { label: "ghost", mount: <Button variant="ghost">Ghost</Button> },
      {
        label: "disabled",
        mount: (
          <Button variant="primary" disabled>
            Disabled
          </Button>
        ),
      },
      {
        label: "small",
        mount: (
          <Button size="sm" variant="primary">
            Small
          </Button>
        ),
      },
    ],
    paints: [
      { what: "primary label", fg: "--text-inverse", bg: "--brand-main", floor: TEXT },
      { what: "primary label, hover", fg: "--text-inverse", bg: "--brand-strong", floor: TEXT },
      { what: "secondary label", fg: "--text-primary", bg: "--surface-top", floor: TEXT },
      { what: "secondary border", fg: "--border-stronger", bg: "--surface-top", floor: GRAPHIC },
      { what: "ghost label", fg: "--text-secondary", bg: "--surface-top", floor: TEXT },
      { what: "ghost label, hover", fg: "--text-secondary", bg: "--surface-inset", floor: TEXT },
    ],
  },

  Input: {
    container: "top",
    states: [
      { label: "label + value", mount: <Input id="sg-in-1" label="Name" defaultValue="Ada Lovelace" /> },
      { label: "placeholder", mount: <Input id="sg-in-2" label="Name" placeholder="Ada Lovelace" /> },
      {
        label: "with hint",
        mount: <Input id="sg-in-3" label="Email" placeholder="you@example.com" hint="We never share it." />,
      },
      { label: "disabled", mount: <Input id="sg-in-4" label="Locked" defaultValue="Read only" disabled /> },
    ],
    paints: [
      { what: "field text", fg: "--text-primary", bg: "--surface-top", floor: TEXT },
      { what: "placeholder", fg: "--text-light", bg: "--surface-top", floor: TEXT },
      { what: "label", fg: "--text-secondary", bg: "--surface-top", floor: TEXT },
      { what: "hint", fg: "--text-tertiary", bg: "--surface-top", floor: TEXT },
      { what: "resting border", fg: "--border-stronger", bg: "--surface-top", floor: GRAPHIC },
      { what: "focus border", fg: "--brand-main", bg: "--surface-top", floor: GRAPHIC },
    ],
  },

  Mark: {
    // The centre is a true cutout, so the mark's own demo has to sit on a
    // surface that is NOT the page's, or the hole is invisible and the shape
    // reads as solid.
    container: "inset",
    states: [
      { label: "16px", mount: <Mark size={16} /> },
      { label: "24px", mount: <Mark size={24} /> },
      { label: "40px", mount: <Mark size={40} /> },
      {
        label: "on brand",
        mount: (
          <span className="inline-flex items-center rounded-sm bg-brand-main p-sm">
            <Mark size={24} />
          </span>
        ),
      },
    ],
    paints: [
      { what: "copper on inset", fg: "--brand-main", bg: "--surface-inset", floor: GRAPHIC },
      { what: "copper on the page", fg: "--brand-main", bg: "--surface-base", floor: GRAPHIC },
    ],
  },

  PillToggle: {
    container: "top",
    states: [
      { label: "single-select", mount: <PillToggleDemo /> },
      { label: "multi-select", mount: <PillToggleDemo multi /> },
    ],
    paints: [
      { what: "resting label", fg: "--text-secondary", bg: "--surface-top", floor: TEXT },
      { what: "selected label", fg: "--text-primary", bg: "--surface-top", floor: TEXT },
      { what: "resting border", fg: "--border-stronger", bg: "--surface-top", floor: GRAPHIC },
      { what: "selected border", fg: "--text-primary", bg: "--surface-top", floor: GRAPHIC },
    ],
  },

  TabBar: {
    // The ordinary card: this component brings its own track
    // (`.tab-bar-container`, `--surface-inset`), so its labels sit on the
    // same backing here as at any callsite. That is why the measurement
    // below names `--surface-inset` and not the container.
    container: "top",
    states: [
      { label: "default", mount: <TabBarDemo /> },
      { label: "with a badge", mount: <TabBarDemo withBadge /> },
    ],
    paints: [
      { what: "inactive label", fg: "--text-gray", bg: "--surface-inset", floor: TEXT },
      { what: "active label", fg: "--text-primary", bg: "--surface-top", floor: TEXT },
      { what: "badge count", fg: "--text-white", bg: "--brand-main", floor: TEXT },
    ],
  },

  ThemeToggle: {
    container: "top",
    // The demo is the app's real appearance control, so clicking it changes
    // the theme of the page you are reading — and the two copies re-sync
    // through the `theme-changed` event, which is the component's own
    // documented behaviour demonstrating itself. The panes do not follow:
    // each pins its own values, which is what makes the comparison hold.
    states: [{ label: "live — this is the real control", mount: <ThemeToggle /> }],
    paints: [
      { what: "inactive icon", fg: "--text-gray", bg: "--surface-inset", floor: GRAPHIC },
      { what: "active icon", fg: "--text-primary", bg: "--surface-top", floor: GRAPHIC },
    ],
  },

  ThemeWatcher: {
    noDemoReason:
      "Renders nothing. It is an effect mounted once in the root layout so the `system` preference keeps following the OS; there is no surface to put in a canvas. Its behaviour is visible on the ThemeToggle demo above, which is the control it listens to.",
  },

  Toggle: {
    container: "top",
    states: [
      { label: "on", mount: <ToggleDemo start /> },
      { label: "off", mount: <ToggleDemo start={false} /> },
      { label: "disabled", mount: <ToggleDemo start disabled /> },
    ],
    paints: [
      { what: "knob on the on-track", fg: "--surface-top", bg: "--brand-main", floor: GRAPHIC },
      { what: "knob on the off-track", fg: "--surface-top", bg: "--surface-gray", floor: GRAPHIC },
      { what: "on-track against the card", fg: "--brand-main", bg: "--surface-top", floor: GRAPHIC },
      { what: "off-track against the card", fg: "--surface-gray", bg: "--surface-top", floor: GRAPHIC },
    ],
  },
};
