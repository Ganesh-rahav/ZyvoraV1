'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { staggerParent, fadeUp } from '@/lib/motion'

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#080F1F] py-28 md:py-36"
      aria-label="Final call to action"
    >
      {/* Animated background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <motion.div
          className="h-[500px] w-[700px] rounded-full bg-[#3B82F6]/10 blur-[100px]"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.08, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Top edge line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent"
        aria-hidden="true"
      />

      {/* Animated orbital accent rings */}
      {!shouldReduceMotion && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <motion.div
            className="h-[600px] w-[600px] rounded-full border border-[#3B82F6]/8"
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute h-[400px] w-[400px] rounded-full border border-[#3B82F6]/6"
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.div
          variants={staggerParent(0.1)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Your transformation{' '}
            <motion.span
              className="inline-block bg-gradient-to-r from-[#3B82F6] to-[#93C5FD] bg-clip-text text-transparent"
              animate={shouldReduceMotion ? {} : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              style={{ backgroundSize: '200% auto' }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              starts today.
            </motion.span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed text-[#64748B]"
          >
            Join the early access waitlist. No credit card. No commitment. Just the most
            intelligent fitness coaching you&apos;ve ever had.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            >
              <Link
                href="/register"
                id="final-cta-button"
                className="group flex items-center gap-2 rounded-lg bg-[#3B82F6] px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-[#2563EB] hover:shadow-[0_0_40px_0_rgba(59,130,246,0.55)]"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-sm text-[#334155]">
            From Potential to Physique. — Zyvora
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
