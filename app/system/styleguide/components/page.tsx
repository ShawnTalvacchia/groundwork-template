import { getComponentInventory } from "@/lib/styleguide";
import { ComponentsDemos } from "./components-demos";

// Components — demos are curated (they render the LIVE components, which is
// the derived principle in component form: the demo can't drift from the
// implementation because it IS the implementation). The inventory below is
// derived from the shared component directories at build time, so it can't
// lie about what exists.

/** Components with a demo section above (curated — update when adding one). */
const DEMOED = new Set(["Button", "Input", "Toggle", "Badge", "PillToggle"]);

export default function ComponentsPage() {
  const inventory = getComponentInventory();
  const total = inventory.reduce((n, g) => n + g.components.length, 0);

  return (
    <>
      <ComponentsDemos />
      <section className="flex flex-col gap-md mt-3xl">
        <div className="flex flex-col gap-xs">
          <h2 className="text-lg font-semibold text-fg-primary">
            Shared inventory <span className="text-sm font-normal text-fg-tertiary">{total}</span>
          </h2>
          <p className="text-xs leading-relaxed text-fg-tertiary max-w-[72ch]">
            Derived from the shared component directories at build time — the reuse-first checklist
            starts here. Feature components live beside their features and aren&apos;t listed.
          </p>
        </div>
        {inventory.map((group) => (
          <div key={group.dir} className="flex flex-col gap-sm">
            <h3 className="text-sm font-semibold text-fg-primary">
              components/{group.dir}{" "}
              <span className="text-2xs font-normal text-fg-tertiary">{group.components.length}</span>
            </h3>
            <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
              {group.components.map((c) => (
                <div
                  key={c.file}
                  className="flex items-baseline justify-between gap-sm rounded-sm border border-edge-strong bg-surface-top px-md py-sm min-w-0"
                >
                  <code className="text-xs font-mono text-fg-secondary truncate">{c.name}</code>
                  {DEMOED.has(c.name) && (
                    <span className="text-2xs text-brand-strong whitespace-nowrap">demo ↑</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-fg-tertiary">
          Source: <code className="sys-code">components/ui · overlays · layout</code>, listed by{" "}
          <code className="sys-code">lib/styleguide.ts</code> at build time.
        </p>
      </section>
    </>
  );
}
