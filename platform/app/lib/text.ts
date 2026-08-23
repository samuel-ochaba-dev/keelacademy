/**
 * Small text helpers for rendering content-repo identifiers (kebab-case ids)
 * as readable labels. Pure transforms of data, never new words.
 */

export function humanizeId(id: string): string {
  return id
    .split("-")
    .map((word) => (word === "and" || word === "or" || word === "a" || word === "the" ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}
