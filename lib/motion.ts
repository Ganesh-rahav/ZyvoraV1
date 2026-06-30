/**
 * Zyvora Motion System
 * Centralized, reusable Framer Motion animation variants.
 *
 * Design principles:
 *  - Every animation communicates: intelligence, precision, trust, progress.
 *  - Motion is purposeful — never decorative.
 *  - All variants respect prefers-reduced-motion (consumers use CSS or
 *    motionValue(0) override; see ReducedMotionWrapper below).
 *  - Duration / easing tokens mirror docs/06-design-system.md §18.6.
 */

import type { Variants } from 'framer-motion'

// ─── Duration tokens ─────────────────────────────────────────────────────────
export const duration = {
  fast: 0.1,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.5,
  deliberate: 0.7,
} as const

// ─── Easing tokens (CSS cubic-bezier → Framer array format) ─────────────────
export const ease = {
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 280, damping: 22 },
  bounce: { type: 'spring', stiffness: 400, damping: 16 },
} as const

// ─── Core variants ───────────────────────────────────────────────────────────

/** Fade + rise — the default reveal for text blocks and cards */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.moderate, ease: ease.out },
  },
}

/** Fade in from left — for step lists, left-side content */
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.moderate, ease: ease.out },
  },
}

/** Fade in from right — for right-side panels, slide-ins */
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.moderate, ease: ease.out },
  },
}

/** Scale in — for feature cards, icon containers */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.moderate, ease: ease.out },
  },
}

/** Fade only — zero Y movement, for overlays and panels */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.out },
  },
}

/**
 * Stagger parent — wrap child elements that each use a child variant.
 * Children animate in sequence with `staggerChildren`.
 */
export const staggerParent = (stagger = 0.08, delayStart = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delayStart,
    },
  },
})

/**
 * Section reveal — combines a viewport-aware fade-up for whole sections.
 * Use with `whileInView` + `viewport={{ once: true, margin: '-80px' }}`.
 */
export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
}

// ─── Interactive hover variants ───────────────────────────────────────────────

/** Card hover — subtle lift, no scale (premium feel per design system §9) */
export const cardHover = {
  rest: { y: 0, transition: { duration: duration.normal, ease: ease.out } },
  hover: { y: -4, transition: { duration: duration.normal, ease: ease.out } },
}

/** Button hover — very subtle scale that still communicates responsiveness */
export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: duration.fast, ease: ease.out } },
  tap: { scale: 0.97, transition: { duration: duration.fast, ease: ease.in } },
}

// ─── Continuous / ambient animations ─────────────────────────────────────────

/** Floating — for metric cards in the hero visualization */
export const floatVariant = (yRange = 6, dur = 4) => ({
  animate: {
    y: [-yRange / 2, yRange / 2, -yRange / 2],
    transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
  },
})

/** Orbital pulse — for ring / orbit animations */
export const orbitalPulse = (dur = 3) => ({
  animate: {
    scale: [1, 1.04, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' },
  },
})

/** Spin — for loading rings or animated orbit arcs */
export const spinVariant = (dur = 20, clockwise = true) => ({
  animate: {
    rotate: clockwise ? 360 : -360,
    transition: { duration: dur, repeat: Infinity, ease: 'linear' },
  },
})

/** Gradient shift — for animated gradient backgrounds */
export const gradientShift: Variants = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: { duration: 8, repeat: Infinity, ease: 'linear' },
  },
}

// ─── Number counter ───────────────────────────────────────────────────────────
/**
 * useCountUp — animates a number from `from` to `to` when `active` becomes true.
 * Returns the formatted current value as a string.
 *
 * Usage:
 *   const val = useCountUp({ to: 142, active: inView, duration: 1.2 })
 *   <span>{val}</span>
 */
export type CountUpOptions = {
  from?: number
  to: number
  duration?: number
  active: boolean
  decimals?: number
}
