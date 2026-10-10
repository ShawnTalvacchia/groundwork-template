import { fiberOf, fiberTypeName, nodeOf, type Fiber, type LocationReport } from "./resolve";

/**
 * Where a pinned element is written in source, read from what React's dev
 * build already records. No instrumentation is added to product code.
 *
 * Every fiber carries `_debugStack`: the stack at the JSX call that created
 * it. A fiber a server component rendered also carries `_debugInfo`: the
 * server components above it, each with the stack of the call that created
 * its element. So a server component's callsite is on record too, not as a
 * fiber of its own but on the first fiber it renders: a `LinkButton` in a
 * page is on the `next/link` fiber under it, with the page's line.
 *
 * Those stacks give a file and a position in the COMPILED module, which is
 * not a line a reader can open. The dev server answers
 * `/__nextjs_source-map?filename=<module>` with that module's source map,
 * original text included, and the map turns the position into the line and
 * its text. Next's own error overlay reads the same endpoint. Webpack's dev
 * server is what this reads; a frame in another shape reads as no project
 * file, never as a guess.
 *
 * A production build records none of it, and the report says so.
 */

/** A stack frame in project code: its module as the dev server names it,
 *  the repo-relative file, and the compiled position. */
interface Frame {
  fn: string | null;
  module: string;
  file: string;
  line: number;
  col: number;
}

/** `at Home (about://React/Server/webpack-internal:///(rsc)/./app/page.tsx?54:317:104)`
 *  and `at eval (webpack-internal:///(app-pages-browser)/./components/ui/ThemeToggle.tsx:77:95)`.
 *  The `?54` on a server frame is a per-callsite tag, not part of the module. */
const FRAME =
  /^\s*at (?:(.+?) \()?(?:about:\/\/React\/Server\/)?(webpack-internal:\/\/\/(?:\([^)]*\)\/)?\.\/([^?:)]+))(?:\?[^:)]*)?:(\d+):(\d+)\)?\s*$/;

/** A stack prints a URL, so a route folder's brackets arrive as `%5B`; the
 *  dev server names the module, and a reader the file, with the brackets. */
function decoded(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** A frame's function as a reader would name it: `Object.Home` is `Home`,
 *  and a callback with no name of its own (a server component's `.map`)
 *  prints as `eval`, which names nothing a reader can find. */
function cleanFn(fn: string | null): string | null {
  const bare = fn?.replace(/^.*\./, "") ?? null;
  return bare && !/^(eval|anonymous|<anonymous>)$/.test(bare) ? bare : null;
}

function projectFrame(url: string, line: number, col: number, fn: string | null): Frame | null {
  const m = decoded(url).match(/^(?:about:\/\/React\/Server\/)?(webpack-internal:\/\/\/(?:\([^)]*\)\/)?\.\/([^?]+))/);
  if (!m || m[2].startsWith("node_modules/")) return null;
  return { fn: cleanFn(fn), module: m[1], file: m[2], line, col };
}

/** The first project frame of a stack: the JSX call. Its function is named
 *  by the nearest frame in the same file that has a name of its own, since a
 *  callback inside a component prints as `eval`. */
function firstProjectFrame(stack: string | undefined): Frame | null {
  if (!stack) return null;
  const frames: Frame[] = [];
  for (const line of stack.split("\n")) {
    const m = line.match(FRAME);
    if (!m) continue;
    const f = projectFrame(m[2], Number(m[4]), Number(m[5]), m[1] ?? null);
    if (f) frames.push(f);
  }
  const first = frames[0];
  if (!first) return null;
  const named = frames.find((f) => f.file === first.file && f.fn && /^[A-Z]/.test(f.fn));
  return { ...first, fn: named?.fn ?? first.fn };
}

/** A server component's own call, from its `_debugInfo` entry:
 *  `stack: [[fn, url, line, col, …]]`. */
function infoFrame(info: { stack?: unknown[] }): Frame | null {
  const top = info.stack?.[0];
  if (!Array.isArray(top) || typeof top[1] !== "string") return null;
  return projectFrame(top[1], Number(top[2]), Number(top[3]), typeof top[0] === "string" ? top[0] : null);
}

interface Position {
  frame: Frame;
  by: "element" | "component" | "ancestor";
  /** The component the line creates (`component`), or the fiber's own. */
  name: string | null;
  node: Element | null;
}

/** Project positions from the pinned element outward, innermost first,
 *  until one sits in a file other than the first's. */
function positions(el: Element): Position[] {
  const out: Position[] = [];
  const start = fiberOf(el);
  let walked = 0;
  for (let f: Fiber | null = start; f && walked < 80; f = f.return, walked++) {
    // Which fiber the frame came from says what the line writes: the pinned
    // element itself, an element above it, or a component that renders it.
    const isHost = typeof f.type === "string";
    const own = firstProjectFrame(f._debugStack?.stack);
    if (own) {
      out.push({
        frame: own,
        by: f === start ? "element" : isHost ? "ancestor" : "component",
        name: f === start || isHost ? null : fiberTypeName(f),
        node: isHost && f !== start ? (f.stateNode as Element) : null,
      });
    }
    for (const info of [...(f._debugInfo ?? [])].reverse()) {
      const frame = infoFrame(info);
      if (frame) out.push({ frame, by: "component", name: info.name ?? null, node: null });
    }
    if (out.length > 1 && out[out.length - 1].frame.file !== out[0].frame.file) break;
  }
  return out;
}

/* ── The dev server's source map ───────────────────────────────────────── */

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

interface SourceMap {
  sources: string[];
  sourcesContent?: (string | null)[];
  mappings: string;
}

/** The original position of a compiled one: the mapping segment at or
 *  before the column on that line. Every field but the column is relative
 *  to the segment before it across the whole string, so decoding runs from
 *  the top to the line asked for. */
function lookup(map: SourceMap, line: number, col: number): { source: number; line: number } | null {
  let src = 0;
  let srcLine = 0;
  const rows = map.mappings.split(";");
  for (let row = 0; row < rows.length && row < line; row++) {
    let genCol = 0;
    let best: { source: number; line: number } | null = null;
    for (const seg of rows[row] ? rows[row].split(",") : []) {
      const vals: number[] = [];
      let shift = 0;
      let value = 0;
      for (const ch of seg) {
        const d = B64.indexOf(ch);
        value += (d & 31) << shift;
        if (d & 32) shift += 5;
        else {
          vals.push(value & 1 ? -(value >> 1) : value >> 1);
          value = 0;
          shift = 0;
        }
      }
      genCol += vals[0];
      if (vals.length < 4) continue;
      src += vals[1];
      srcLine += vals[2];
      if (row === line - 1 && genCol <= col - 1) best = { source: src, line: srcLine };
    }
    if (row === line - 1) return best;
  }
  return null;
}

async function mapFrame(
  frame: Frame,
  maps: Map<string, Promise<SourceMap | null>>
): Promise<{ line: number; text: string } | null> {
  if (!maps.has(frame.module)) {
    maps.set(
      frame.module,
      fetch(`/__nextjs_source-map?filename=${encodeURIComponent(frame.module)}`)
        .then((r) => (r.status === 200 ? (r.json() as Promise<SourceMap>) : null))
        .catch(() => null)
    );
  }
  const map = await maps.get(frame.module)!;
  if (!map?.mappings) return null;
  const hit = lookup(map, frame.line, frame.col);
  const text = hit ? map.sourcesContent?.[hit.source]?.split("\n")[hit.line] : undefined;
  if (!hit || text === undefined) return null;
  const trimmed = text.trim();
  return { line: hit.line + 1, text: trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed };
}

/**
 * Where `el` is written: the report at once, with its lines pending, and a
 * promise of the report with them read from the dev server's maps.
 * `sharedFiles` are the component inventory's files: a node one of them
 * renders is also reported where that component is used.
 */
export function readLocation(
  el: Element,
  sharedFiles: Set<string>
): { now: LocationReport; mapped: Promise<LocationReport> } {
  if (process.env.NODE_ENV === "production") {
    const now: LocationReport = { status: "unavailable" };
    return { now, mapped: Promise.resolve(now) };
  }
  const found = positions(el);
  const first = found[0];
  if (!first) {
    const now: LocationReport = { status: "unknown" };
    return { now, mapped: Promise.resolve(now) };
  }
  const caller = sharedFiles.has(first.frame.file) ? found.find((p) => p.frame.file !== first.frame.file) ?? null : null;

  const build = (
    rendered: { line: number; text: string } | null,
    called: { line: number; text: string } | null,
    lines: "pending" | "map" | "unmapped"
  ): LocationReport => ({
    status: "found",
    rendered: {
      file: first.frame.file,
      line: rendered?.line ?? null,
      text: rendered?.text ?? null,
      fn: first.frame.fn,
      by: first.by,
      // The tag the line writes (`Link`) over React's name for what it
      // renders (`LinkComponent`): the reader is looking at the line.
      name: (first.by === "component" && rendered?.text.match(/^<([A-Z][\w.]*)/)?.[1]) || first.name,
      node: first.node ? nodeOf(first.node) : null,
    },
    calledFrom: caller
      ? { file: caller.frame.file, line: called?.line ?? null, text: called?.text ?? null, fn: caller.frame.fn, name: caller.name }
      : null,
    lines,
  });

  const maps = new Map<string, Promise<SourceMap | null>>();
  const mapped = Promise.all([mapFrame(first.frame, maps), caller ? mapFrame(caller.frame, maps) : Promise.resolve(null)]).then(
    ([r, c]) => build(r, c, r && (!caller || c) ? "map" : "unmapped")
  );
  return { now: build(null, null, "pending"), mapped };
}
