export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Smooth scrolling for programmatic scrolls, unless the user has asked for reduced motion
 * Global CSS cannot override the `behavior` option passed to scrollIntoView() / scrollTo()
 */
export const getScrollBehavior = (): ScrollBehavior =>
  prefersReducedMotion() ? "auto" : "smooth";
