import Link from "next/link";
import { getAllDocs } from "@/lib/system";
import { getCensus, getDesignHomes, getStyleguide } from "@/lib/styleguide";
import { StyleguideSectionNav } from "./section-nav";
import "./styleguide.css";

// The styleguide lives inside the /system chrome (Structure → Styleguide,
// reached from the Structure overview card; the breadcrumb is the way out).
// Its old sg-layout / sg-nav chrome is gone — the surface's header and tabs
// are the chrome now, and the section switcher sits in the body, the way the
// product's own pages do it.
//
// The header says whose design this is, and every clause of it derives: who
// reaches for the set comes from the census, what the set imports from the
// parse, and where the product's design lives from the feature doc carrying
// `area: design`.

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  const census = getCensus();
  const data = getStyleguide();
  const homes = getDesignHomes(getAllDocs());

  return (
    <>
      <header className="flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
          <h1 className="text-2xl font-semibold text-fg-primary">Styleguide</h1>
          <p className="text-sm leading-relaxed text-fg-secondary max-w-[72ch]">
            {census.product ? (
              <>
                The design this app is built on, shared by the product and this dashboard. Every
                token and component says who reaches for it.
              </>
            ) : (
              <>
                The design this dashboard is built on. Nothing outside the dashboard reaches for
                these tokens, so none of them is the product&apos;s.
              </>
            )}{" "}
            Derived from <code className="sys-code">globals.css</code> at build time. To change a
            value, change the CSS.
          </p>
          {data.imported.length > 0 && (
            <p className="text-xs leading-relaxed text-fg-tertiary max-w-[72ch]">
              {data.imported.length} tokens come from{" "}
              {data.importedFrom.map((f, i) => (
                <span key={f}>
                  {i > 0 && ", "}
                  <code className="sys-code">{f}</code>
                </span>
              ))}
              , the product&apos;s own. They are the base under this set and are not listed. A
              token that resolves to one says so.
            </p>
          )}
          <p className="text-xs leading-relaxed text-fg-tertiary max-w-[72ch]">
            {homes.length > 0 ? (
              <>
                The product&apos;s design:{" "}
                {homes.map((h, i) => (
                  <span key={h.relPath}>
                    {i > 0 && " · "}
                    <Link
                      href={`/system/docs/${h.relPath}`}
                      className="font-semibold text-fg-secondary underline underline-offset-2"
                    >
                      {h.title}
                    </Link>
                    {h.routes.length > 0 && (
                      <>
                        {" "}
                        at{" "}
                        {h.routes.map((r, j) => (
                          <span key={r}>
                            {j > 0 && ", "}
                            <code className="sys-code">{r}</code>
                          </span>
                        ))}
                      </>
                    )}
                  </span>
                ))}
                .
              </>
            ) : (
              <span className="italic text-fg-gray">
                No feature doc carries <code className="sys-code not-italic">area: design</code>, so{" "}
                {census.product
                  ? "these pages are the only home the product's design has."
                  : "no home for the product's design is named."}
              </span>
            )}
          </p>
        </div>
        <StyleguideSectionNav />
      </header>
      {children}
    </>
  );
}
