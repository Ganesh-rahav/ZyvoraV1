'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ScanFace, Dumbbell, Utensils, Bot, TrendingUp } from 'lucide-react'
import { staggerParent, fadeUp, scaleIn } from '@/lib/motion'

const solutions = [
  {
    icon: ScanFace,
    color: '#3B82F6',
    title: 'AI Physique Analysis',
    description:
      'Computer vision estimates your body composition, posture, and muscle balance from photos — giving your coach a precise starting point.',
  },
  {
    icon: Dumbbell,
    color: '#60A5FA',
    title: 'Personalized Workout Engine',
    description:
      'Evidence-based training blocks generated for your goals, equipment, experience, and schedule — not a template with your name on it.',
  },
  {
    icon: Utensils,
    color: '#10B981',
    title: 'Adaptive Nutrition',
    description:
      'Calorie and macro targets calculated from your actual physique data. Adjusted each week based on real-world results — not guesswork.',
  },
  {
    icon: Bot,
    color: '#10B981',
    title: 'AI Coach',
    description:
      "A coaching intelligence that remembers your entire history, asks the right questions, and adapts your plan based on what's actually working.",
    isCoach: true,
  },
  {
    icon: TrendingUp,
    color: '#3B82F6',
    title: 'Progress Intelligence',
    description:
      'Multi-dimensional progress tracking across body composition, strength, adherence, and wellbeing — not just the number on a scale.',
  },
]

export function SolutionSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const shouldReduceMotion = useReducedMotion()

  return (
    <section
      id="features"
      ref={ref}
      className="relative bg-[#080F1F] py-24 md:py-32"
      aria-labelledby="solution-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          variants={staggerParent(0.08)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.span
            variants={fadeUp}
            className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#64748B]"
          >
            The Solution
          </motion.span>
          <motion.h2
            id="solution-heading"
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            One intelligent system.{' '}
            <span className="bg-gradient-to-r from-[#3B82F6] to-[#93C5FD] bg-clip-text text-transparent">
              Everything you need.
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base leading-relaxed text-[#64748B] sm:text-lg"
          >
            Zyvora combines everything a great coach provides into a single platform — with a memory
            that compounds the longer you use it.
          </motion.p>
        </motion.div>

        {/* Solution cards */}
        <motion.div
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerParent(0.08, 0.1)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {solutions.map((s) => {
            const Icon = s.icon
            const isCoach = Boolean(s.isCoach)
            return (
              <motion.div
                key={s.title}
                variants={scaleIn}
                whileHover={shouldReduceMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
                className={`group relative overflow-hidden rounded-xl border p-6 transition-colors duration-200 ${
                  isCoach
                    ? 'border-[#10B981]/25 bg-[#064E3B]/20 hover:border-[#10B981]/40'
                    : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
                }`}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${s.color}18, transparent 70%)` }}
                  aria-hidden="true"
                />

                {/* Left accent bar for coach card */}
                {isCoach && (
                  <div className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-[#10B981]" aria-hidden="true" />
                )}

                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: `${s.color}18` }}
                >
                  <Icon className="h-5 w-5" style={{ color: s.color }} aria-hidden="true" />
                </div>

                <h3 className="font-semibold text-white">
                  {s.title}
                  {isCoach && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-semibold text-[#10B981]">
                      AI
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{s.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
