// Shared helpers for motion-related decisions. One place, so every module agrees.

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** True when the user has asked the OS for less motion. */
export function prefersReducedMotion() {
  return reducedMotion.matches;
}

/** The site's single easing curve, mirrored from --ease in tokens/motion.css. */
export const EASE_OUT = (t) => 1 - Math.pow(1 - t, 4);
