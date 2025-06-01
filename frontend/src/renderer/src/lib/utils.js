/**
 * Conditionally join class names together
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
