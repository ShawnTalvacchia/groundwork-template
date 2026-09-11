/** The param that stands in for "this project has none of these yet."
 *
 *  A project on day one has no walkthroughs — the first one is written when
 *  the first build commits — and it is between boards whenever a phase has
 *  closed and the next has not opened. `generateStaticParams` returning `[]`
 *  prerenders the route for nothing at all, so it does not exist until a
 *  rebuild. One entry keeps the route real from the start; the page
 *  `notFound()`s it like any unknown slug.
 *
 *  It matters more than it looks wherever a route sits under another dynamic
 *  segment: Next composes a nested `generateStaticParams` across its parent's
 *  params, and a child returning `[]` for **any one** parent prerenders the
 *  route for **none** of them. `dynamicParams = true` does not rescue that — a
 *  statically enumerated parent has no fallback shell, so the request dies as
 *  `NoFallbackError`. A floor entry is what does.
 *
 *  It is a real path, so it must be one no board can claim: a board slug is a
 *  filename stem, and `__` is not a character `phases/*.md` ever starts with.
 *  Any future route keyed on something the record may legitimately have none
 *  of inherits this. */
export const NO_SLUGS = "__none";

/** The slugs a route offers, or the sentinel when there are none. */
export function slugParams(slugs: string[]): { slug: string }[] {
  return (slugs.length > 0 ? slugs : [NO_SLUGS]).map((slug) => ({ slug }));
}
