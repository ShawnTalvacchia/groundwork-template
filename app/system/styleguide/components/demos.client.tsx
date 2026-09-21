"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { PillToggle } from "@/components/ui/PillToggle";
import { TabBar } from "@/components/ui/TabBar";

/**
 * The stateful demo mounts. Only the components that need a `useState` to be
 * worth looking at live here — the rest are plain elements the registry holds
 * directly (`demos.tsx`), which is what keeps that registry readable from a
 * server component.
 *
 * These render the ACTUAL components, so a demo cannot drift from the
 * implementation: it IS the implementation.
 *
 * Each pane is rendered twice, once per theme, so every one of these mounts
 * exists twice on the page and must not own anything the two copies would
 * fight over (a URL, a focus trap, a global). Local state only.
 */

export function ToggleDemo({ start = true, disabled }: { start?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(start);
  return (
    <span className="inline-flex items-center gap-sm">
      <Toggle checked={on} onChange={setOn} label="Notifications" disabled={disabled} />
      <span className="text-2xs text-fg-tertiary">{on ? "on" : "off"}</span>
    </span>
  );
}

export function PillToggleDemo({ multi = false }: { multi?: boolean }) {
  const [single, setSingle] = useState("all");
  const [many, setMany] = useState<string[]>(["active"]);
  const options = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];
  return multi ? (
    <PillToggle
      options={options}
      selected={many}
      multi
      onToggle={(v) => setMany((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))}
      ariaLabel="Filter (multi-select)"
    />
  ) : (
    <PillToggle options={options} selected={single} onToggle={setSingle} ariaLabel="Filter" />
  );
}

export function TabBarDemo({ withBadge = false }: { withBadge?: boolean }) {
  const [tab, setTab] = useState("work");
  return (
    <TabBar
      tabs={[
        { key: "work", label: "Work" },
        { key: "structure", label: "Structure" },
        { key: "method", label: "Method", badge: withBadge ? 3 : undefined },
      ]}
      activeKey={tab}
      onChange={setTab}
    />
  );
}
