/**
 * Mark — your project's logo, for use inside the app.
 *
 * One home for the shape, the way lib/project.ts is the one home for the name.
 * The kickoff sets both. Replacing the starter here changes the `/system`
 * wordmark everywhere it renders, in one edit.
 *
 * The starter is a brand-coloured tile with a diamond cut out of it. It is
 * meant to look like a placeholder, because it is one.
 *
 * The centre is a TRUE cutout: the tile and the diamond are one path with
 * `fill-rule="evenodd"`, so the inner region is unpainted and whatever sits
 * behind the mark shows through. That is why this needs no theme prop, no
 * media query, and no colour for the centre at all — it is correct on a light
 * header, a dark header, and anything you re-skin to. If you replace the shape,
 * keeping that property is worth the trouble: a painted centre has to know what
 * is behind it, and every callsite is a chance to get that backwards.
 *
 * The tile takes `var(--brand-main)`, so re-skinning the tokens in
 * app/globals.css recolours the wordmark with everything else.
 *
 * NOT the only copy of this shape, and deliberately so. `app/icon.svg` is a
 * standalone file because a favicon has no stylesheet to inherit from, and
 * `app/opengraph-image.tsx` re-declares it because Satori renders outside CSS
 * entirely. Three renderers, one set of path data — if the shape changes, it
 * changes in all three. The cutout needs no per-renderer mechanism at all; the
 * colour is delivered differently per file (this one reads a custom property,
 * the other two carry a literal), and the favicon alone carries a hairline edge
 * traced to the starter silhouette, which a new shape has to retrace or drop.
 *
 * No `viewBox` scaling logic: `size` drives width/height and the 32x32 box does
 * the rest.
 */

export function Mark({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 0H25A7 7 0 0 1 32 7V25A7 7 0 0 1 25 32H7A7 7 0 0 1 0 25V7A7 7 0 0 1 7 0Z M16 7.5L24.5 16L16 24.5L7.5 16Z"
        fillRule="evenodd"
        fill="var(--brand-main)"
      />
    </svg>
  );
}
