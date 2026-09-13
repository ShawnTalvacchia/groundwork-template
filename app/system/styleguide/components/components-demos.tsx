"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { PillToggle } from "@/components/ui/PillToggle";

/**
 * Live demos of the starter component set. These render the ACTUAL components
 * (from components/ui), which is the derived principle in component form: the
 * demo can't drift from the implementation because it IS the implementation.
 *
 * This is the "basic design system skeleton" — a starting point. As the
 * project grows its own components, add a demo section here and list the name
 * in the DEMOED set in page.tsx.
 *
 * A local Section wrapper (not the server-only SgSection from derived-ui) —
 * this is a client component, and derived-ui reaches into lib/styleguide
 * (node:fs), which must never be pulled into a client bundle.
 */

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <h2 className="text-lg font-semibold text-fg-primary">{title}</h2>
        <p className="max-w-[72ch] text-xs leading-relaxed text-fg-tertiary">{note}</p>
      </div>
      {children}
    </section>
  );
}

export function ComponentsDemos() {
  const [toggleOn, setToggleOn] = useState(true);
  const [pill, setPill] = useState("all");

  return (
    <div className="flex flex-col gap-3xl">
      <Section
        title="Button"
        note="The starter action control — three variants × two sizes, styled entirely from the semantic tokens so it re-themes for dark automatically."
      >
        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap items-center gap-sm">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <Button size="sm" variant="primary">
              Small
            </Button>
            <Button size="sm" variant="secondary">
              Small
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Input" note="The starter text field, with an optional label and hint.">
        <div className="flex max-w-narrow flex-col gap-md">
          <Input id="demo-name" label="Name" placeholder="Ada Lovelace" />
          <Input
            id="demo-email"
            label="Email"
            placeholder="you@example.com"
            hint="We never share it."
          />
        </div>
      </Section>

      <Section title="Toggle" note="A controlled on/off switch — the track turns brand when on.">
        <div className="flex items-center gap-md">
          <Toggle checked={toggleOn} onChange={setToggleOn} label="Notifications" />
          <span className="text-sm text-fg-secondary">Notifications {toggleOn ? "on" : "off"}</span>
        </div>
      </Section>

      <Section
        title="Badge"
        note="A small status pill — five tones mapped to the status token families."
      >
        <div className="flex flex-wrap items-center gap-sm">
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="error">Error</Badge>
        </div>
      </Section>

      <Section
        title="PillToggle"
        note="A wrapping row of selectable pills (single- or multi-select). Uses the .pill class from globals.css."
      >
        <PillToggle
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ]}
          selected={pill}
          onToggle={setPill}
          ariaLabel="Filter"
        />
      </Section>
    </div>
  );
}
