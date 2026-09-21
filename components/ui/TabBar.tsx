"use client";

/**
 * TabBar — a segmented pill control for switching between sibling views. The
 * track is `--surface-inset`, the active tab lifts onto `--surface-top`, and
 * an optional per-tab badge count carries an unactioned signal.
 *
 * Switching is the caller's: this is controlled (`activeKey` + `onChange`),
 * so a bar backed by routes navigates and one backed by state sets it.
 *
 * @when Two to five peer views of one thing, where the reader is expected to
 * move between them and no view is a destination in its own right.
 * @whenNot For a filter over a list, which is PillToggle — a tab bar claims
 * the views are exclusive and equal. Not for a settings triad either: an icon
 * row in a track reads as navigation at a smaller size, which is why
 * ThemeToggle is its own component and not a variant of this one.
 */

interface Tab {
  key: string;
  label: string;
  /** Optional badge count — renders a small dot/number next to the label
   *  when > 0. Used for unread/unactioned signals (e.g. History tab on
   *  /schedule with pending review items). */
  badge?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Extra class on the container — e.g. `sys-tab-fill` to stretch the bar. */
  className?: string;
}

export function TabBar({ tabs, activeKey, onChange, className }: TabBarProps) {
  return (
    <div className={`tab-bar-container${className ? ` ${className}` : ""}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const showBadge = tab.badge !== undefined && tab.badge > 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="tab-main"
            data-active={isActive || undefined}
          >
            {tab.label}
            {showBadge && (
              <span className="tab-badge" aria-label={`${tab.badge} pending`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
