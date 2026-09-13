import { StyleguideSectionNav } from "./section-nav";
import "./styleguide.css";

// The styleguide lives inside the /system chrome (Structure → Styleguide,
// reached from the Structure overview card; the breadcrumb is the way out).
// Its old sg-layout / sg-nav chrome is gone — the surface's header and tabs
// are the chrome now, and the section switcher sits in the body, the way the
// product's own pages do it.

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
          <h1 className="text-2xl font-semibold text-fg-primary">Styleguide</h1>
          <p className="text-sm leading-relaxed text-fg-secondary max-w-[60ch]">
            The design system&apos;s surface: the colors, type, scale, and components the app is built
            from. Derived from <code className="sys-code">globals.css</code> at build time — a token
            edit updates these pages in the same commit, so they can&apos;t drift. To change a value,
            change the CSS.
          </p>
        </div>
        <StyleguideSectionNav />
      </header>
      {children}
    </>
  );
}
