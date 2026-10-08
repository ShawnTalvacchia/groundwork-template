import type { Reach } from "./styleguide";

/**
 * The word for each answer the census gives (`getCensus` in
 * lib/styleguide.ts), on the styleguide's pages and in the element
 * inspector's panel alike, so the two pills can never disagree.
 *
 * Its own module because the inspector is client code and lib/styleguide.ts
 * reads the file system: a type crosses from there freely, a value would pull
 * `node:fs` into the browser bundle.
 */
export const REACH_LABEL: Record<Reach, string> = {
  product: "product",
  dashboard: "dashboard",
  both: "both",
  none: "unused",
};
