"use client";

/**
 * ThemeWatcher — app-global listener that keeps the `system` theme preference
 * live. Mounted once in the root layout so the OS-follow works on every page,
 * not just where a ThemeToggle happens to be rendered.
 *
 * When the preference is `system`, an OS light/dark change re-applies
 * `data-theme` immediately. When the preference is an explicit light/dark, OS
 * changes are ignored. Re-checks on the theme-changed event so switching
 * to/from System takes effect without a reload. Renders nothing.
 *
 * @when Once, in the root layout. Every page needs the OS-follow, and a
 * watcher mounted anywhere narrower stops working the moment the reader
 * navigates away from it.
 * @whenNot Anywhere else, and never more than once: each instance attaches
 * its own listeners to do work that is already being done.
 */

import { useEffect } from "react";
import { readThemePref, resolveTheme, THEME_CHANGED_EVENT } from "@/lib/theme";

export function ThemeWatcher() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    // Only acts while the preference is `system`; a no-op otherwise, so it's
    // safe to leave attached for the app's lifetime.
    const syncIfSystem = () => {
      const pref = readThemePref();
      if (pref === "system") {
        document.documentElement.setAttribute("data-theme", resolveTheme(pref));
      }
    };
    mq.addEventListener("change", syncIfSystem);
    window.addEventListener(THEME_CHANGED_EVENT, syncIfSystem);
    syncIfSystem();
    return () => {
      mq.removeEventListener("change", syncIfSystem);
      window.removeEventListener(THEME_CHANGED_EVENT, syncIfSystem);
    };
  }, []);

  return null;
}
