"use client";

/**
 * ThemeToggle — three-way appearance control: Light / Dark / System.
 *
 * `System` follows the OS `prefers-color-scheme` and updates live (via
 * `<ThemeWatcher>`); Light / Dark pin an explicit theme. Writes the
 * *preference* to `localStorage['theme-pref']` and applies the resolved
 * `data-theme` to <html> (see `lib/theme.ts`); the pre-paint script in
 * `app/layout.tsx` mirrors the resolution to avoid a flash.
 *
 * Deliberately NOT a `TabBar`: an icon triad reads as a settings control
 * rather than navigation, which a row of text labels in a track never did —
 * it just looked like the /system nav at a smaller size. Labels survive as
 * `title` + `aria-label`. Re-syncs across instances via the `theme-changed`
 * event.
 *
 * @when The one place a surface offers appearance as a setting — a header, a
 * preferences row. It is self-contained: no props are needed beyond an
 * optional class.
 * @whenNot More than once on a screen. Instances do stay in sync, but a
 * second copy states a global setting twice, and this is a control rather
 * than a status.
 */

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "@phosphor-icons/react";
import {
  readThemePref,
  applyThemePref,
  THEME_CHANGED_EVENT,
  type ThemePref,
} from "@/lib/theme";

const OPTIONS: { key: ThemePref; label: string; Icon: typeof Sun }[] = [
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [pref, setPref] = useState<ThemePref>("light");

  useEffect(() => {
    const read = () => setPref(readThemePref());
    read();
    // Sync when the preference changes anywhere (sibling instances / watcher).
    window.addEventListener(THEME_CHANGED_EVENT, read);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, read);
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Appearance"
      className={`theme-toggle${className ? ` ${className}` : ""}`}
    >
      {OPTIONS.map(({ key, label, Icon }) => {
        const active = key === pref;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => {
              applyThemePref(key);
              setPref(key);
            }}
            className="theme-toggle-option"
            data-active={active || undefined}
          >
            <Icon size={16} weight={active ? "fill" : "regular"} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
