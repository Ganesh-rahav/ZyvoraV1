'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * useCountUp
 * Animates a numeric value from `from` → `to` using requestAnimationFrame
 * when `active` becomes true. Respects prefers-reduced-motion by immediately
 * returning the final value when reduced motion is preferred.
 *
 * @param to        - Target number to count to
 * @param active    - Starts animation when true (use with useInView)
 * @param from      - Starting value (default: 0)
 * @param duration  - Animation duration in seconds (default: 1.2)
 * @param decimals  - Decimal places to display (default: 0)
 */
export function useCountUp({
  to,
  active,
  from = 0,
  duration = 1.2,
  decimals = 0,
}: {
  to: number
  active: boolean
  from?: number
  duration?: number
  decimals?: number
}): string {
  const [value, setValue] = useState(from)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mq.matches) {
        setValue(to)
        return
      }
    }

    if (!active) return

    const animate = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now
      const elapsed = (now - startTimeRef.current) / 1000
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased

      setValue(parseFloat(current.toFixed(decimals)))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setValue(to)
      }
    }

    startTimeRef.current = null
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [active, to, from, duration, decimals])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
}
