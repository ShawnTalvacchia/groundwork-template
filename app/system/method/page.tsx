import { BookOpen, Check, Eye, Lock } from "@phosphor-icons/react/dist/ssr";
import { getWorkModel } from "@/lib/system";
import { MdInline, SourceNote } from "../ui";

// Method = how we work. The modes and their rituals ARE this page, rendered
// from CONTRIBUTING § The Work Model — not a link to a wall of text.
//
// Card shape: identity → what it is + its touch bands → the ritual, folded
// away. The ritual is reference you consult when opening a phase; the top
// half is what you read to tell the modes apart.

const MODE_ACCENT: Record<string, string> = {
  product: "sys-mode--product",
  system: "sys-mode--system",
  side: "sys-mode--side",
};

// The three touch bands — they gate pens, not eyes (reading is never gated).
// "Gated" renders a lock, not a prohibit sign: another mode holds the key.
const BAND_META = {
  home: { label: "Home ground", Icon: Check },
  careful: { label: "Careful", Icon: Eye },
  gated: { label: "Gated", Icon: Lock },
  // Not a band: the orient set — what the mode reads before it edits
  // anything. It renders in the left column with the purpose, never beside
  // the three bands, because bands gate pens and this one is about eyes.
  reads: { label: "Reads first", Icon: BookOpen },
} as const;

function Scope({ kind, text }: { kind: keyof typeof BAND_META; text: string }) {
  const { label, Icon } = BAND_META[kind];
  return (
    <div className="sys-scope">
      <span className="sys-scope-head">
        <Icon size={14} weight="bold" />
        {label}
      </span>
      <span className="text-xs text-fg-secondary leading-snug">
        <MdInline text={text} />
      </span>
    </div>
  );
}

function Steps({ label, steps }: { label: string; steps: string[] }) {
  return (
    <div className="flex flex-col gap-sm">
      <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">{label}</span>
      <ol className="flex flex-col gap-sm">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-md text-sm text-fg-secondary leading-snug">
            <span className="sys-step-num">{i + 1}</span>
            <span>
              <MdInline text={step} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function MethodPage() {
  const { lede, sharedRules, modes, startersLede, starters, partsLede, parts, adjustmentsLede, adjustments } =
    getWorkModel();

  return (
    <>
      <header className="flex flex-col gap-sm">
        <h1 className="text-2xl font-semibold text-fg-primary">How we work</h1>
        <p className="text-sm text-fg-secondary max-w-[64ch]">
          <MdInline text={lede} />
        </p>
      </header>

      {/* The phase arc — the shape every phase takes */}
      <section className="sys-arc" aria-label="The phase arc">
        {[
          { step: "Open", text: "Declare the mode. Open its board. Orient — read, then align or challenge." },
          { step: "Work", text: "Stay in scope — the touch bands gate pens, not eyes." },
          { step: "Close", text: "Run the closing ritual: distill, propagate, delete the board." },
        ].map((s) => (
          <div key={s.step} className="sys-arc-step">
            <span className="text-sm font-semibold text-fg-primary">{s.step}</span>
            <span className="text-xs text-fg-tertiary leading-snug">{s.text}</span>
          </div>
        ))}
      </section>

      {/* How a session begins, in a sentence. The rows it introduces sit
          further down: terms first, then how those terms get used. */}
      {startersLede && (
        <section className="flex flex-col gap-sm">
          <p className="text-sm text-fg-secondary max-w-[64ch]">
            <MdInline text={startersLede} />
          </p>
          <a
            href="#session-starters"
            className="self-start text-xs text-fg-secondary underline underline-offset-2"
          >
            Session starters ↓
          </a>
        </section>
      )}

      {/* The parts — the concept layer: the model presented as a kit the
          adopter can reshape, rendered where a stranger reads the method. */}
      {parts.length > 0 && (
        <section className="flex flex-col gap-md">
          <h2 className="text-lg font-semibold text-fg-primary">The parts</h2>
          <p className="text-sm text-fg-secondary max-w-[64ch]">
            <MdInline text={partsLede} />
          </p>
          <div className="grid gap-md md:grid-cols-2">
            {parts.map((p) => (
              <article key={p.name} className="sys-part">
                <h3 className="text-base font-semibold text-fg-primary">{p.name}</h3>
                <p className="text-sm text-fg-secondary leading-snug">
                  <MdInline text={p.is} />
                </p>
                <div className="sys-scope">
                  <span className="sys-scope-head">Properties</span>
                  <span className="text-xs text-fg-secondary leading-snug">
                    <MdInline text={p.properties} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Session starters — the front door, sitting after the parts because
          it uses their vocabulary: shape, mode, kind. Each row carries the
          prompt you'd actually type. */}
      {starters.length > 0 && (
        <section id="session-starters" className="flex flex-col gap-md scroll-mt-2xl">
          <h2 className="text-lg font-semibold text-fg-primary">Session starters</h2>
          <div className="flex flex-col gap-sm">
            {starters.map((s) => (
              <div key={s.arriving} className="sys-part grid gap-sm md:grid-cols-[1.1fr_auto_1.6fr] md:items-baseline">
                <span className="text-sm font-semibold text-fg-primary leading-snug">
                  <MdInline text={s.arriving} />
                </span>
                <span className="flex items-baseline gap-sm md:justify-self-start">
                  <span className="sys-pill">{s.shape}</span>
                  <span className="text-2xs uppercase tracking-wide text-fg-tertiary">
                    <MdInline text={s.mode} />
                  </span>
                </span>
                <span className="flex flex-col gap-xs">
                  <span className="text-xs italic text-fg-primary leading-snug">
                    <MdInline text={s.prompt} />
                  </span>
                  <span className="text-xs text-fg-secondary leading-snug">
                    <MdInline text={s.openBy} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Adjustments — allowed, never required: one consolidated map instead
          of per-part "change it" blocks, which read as prescription. */}
      {adjustments.length > 0 && (
        <section className="flex flex-col gap-md">
          <h2 className="text-lg font-semibold text-fg-primary">Adjustments</h2>
          <p className="text-sm text-fg-secondary max-w-[64ch]">
            <MdInline text={adjustmentsLede} />
          </p>
          <ul className="flex flex-col gap-sm">
            {adjustments.map((a) => (
              <li key={a.when} className="sys-scope">
                <span className="text-sm font-semibold text-fg-primary leading-snug">
                  <MdInline text={a.when} />
                </span>
                <span className="text-xs text-fg-secondary leading-snug">
                  <MdInline text={a.what} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The three modes */}
      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">The three modes</h2>
        <div className="flex flex-col gap-lg">
          {modes.map((m) => (
            <article key={m.key} className={`sys-mode ${MODE_ACCENT[m.key] ?? ""}`}>
              <div className="flex items-baseline gap-sm flex-wrap">
                <h3 className="text-lg font-semibold text-fg-primary">{m.label}</h3>
                <span className="text-sm text-fg-tertiary">{m.tagline}</span>
              </div>

              {/* What it is (left) · what it may touch (right) */}
              <div className="grid gap-lg lg:grid-cols-[1.4fr_1fr]">
                <div className="flex flex-col gap-md">
                  <p className="text-sm text-fg-secondary leading-normal">
                    <MdInline text={m.purpose} />
                  </p>
                  <Scope kind="reads" text={m.reads} />
                </div>
                <div className="flex flex-col gap-sm">
                  <Scope kind="home" text={m.homeGround} />
                  <Scope kind="careful" text={m.careful} />
                  <Scope kind="gated" text={m.gated} />
                </div>
              </div>

              {/* The ritual — folded away; you open it when you open a phase */}
              <details className="sys-ritual">
                <summary>
                  <span className="sys-caret" aria-hidden>
                    ›
                  </span>
                  <span className="text-sm font-semibold text-fg-primary">The ritual</span>
                  <span className="text-xs text-fg-tertiary">
                    {m.open.length} steps to open · {m.close.length} to close
                  </span>
                </summary>
                <div className="flex flex-col gap-lg pt-lg">
                  <Steps label="Opening ritual" steps={m.open} />
                  <div className="flex flex-col gap-sm">
                    <span className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">
                      During
                    </span>
                    <p className="text-sm text-fg-secondary leading-snug">
                      <MdInline text={m.during} />
                    </p>
                  </div>
                  <Steps label="Closing ritual" steps={m.close} />
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>

      {/* Shared rules */}
      <section className="flex flex-col gap-md">
        <h2 className="text-lg font-semibold text-fg-primary">Rules shared by all modes</h2>
        <ul className="flex flex-col gap-sm">
          {sharedRules.map((r, i) => (
            <li key={i} className="text-sm text-fg-secondary leading-snug flex gap-sm">
              <span className="text-fg-light" aria-hidden>
                ·
              </span>
              <span>
                <MdInline text={r} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SourceNote
        href="/system/docs/CONTRIBUTING.md"
        path="CONTRIBUTING.md → The Work Model"
        note="the canonical rules; this page renders them"
      />
    </>
  );
}
