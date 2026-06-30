'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface StepWrapperProps {
  stepKey: string | number
  children: ReactNode
  direction?: 'forward' | 'backward'
}

const EASE_OUT  = [0, 0, 0.2, 1]   as [number, number, number, number]
const EASE_IN   = [0.4, 0, 1, 1]   as [number, number, number, number]

const variants = {
  enter: (dir: 'forward' | 'backward') => ({
    opacity: 0,
    x: dir === 'forward' ? 32 : -32,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  exit: (dir: 'forward' | 'backward') => ({
    opacity: 0,
    x: dir === 'forward' ? -32 : 32,
    transition: { duration: 0.25, ease: EASE_IN },
  }),
}

export function StepWrapper({ stepKey, children, direction = 'forward' }: StepWrapperProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
