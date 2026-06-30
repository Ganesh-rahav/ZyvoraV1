'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { staggerParent, fadeUp, fadeLeft } from '@/lib/motion'

const steps = [
  {
    number: '01',
    title: 'Create your profile.',
    body: 'Tell Zyvora your goals, experience level, equipment access, schedule, and any constraints. This forms the foundation of everything your coach will build.',
    accent: '#3B82F6',
  },
  {
    number: '02',
    title: 'Upload physique photos.',
    body: 'Front, side, and back views. Our face-blurring tool ensures your identity stays private before anything leaves your device.',
    accent: '#3B82F6',
  },
  {
    number: '03',
    title: 'Receive intelligent analysis.',
    body: 'AI estimates your body composition, posture, and muscle balance — and generates a detailed coaching baseline that informs your entire program.',
    accent: '#10B981',
  },
  {
    number: '04',
    title: 'Train with your AI coach.',
    body: 'Execute your personalized plan. Log workouts and nutrition. Ask your coach questions. It knows your history and adapts in real time.',
    accent: '#10B981',
  },
  {
    number: '05',
    title: 'Track your transformation.',
    body: 'Weekly check-ins drive plan adjustments based on your actual results. The longer you train, the smarter your coach becomes.',
    accent: '#60A5FA',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="bg-[#0F172A] py-24 md:py-32"
      aria-labelledby="hiw-heading"
    >
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
            How It Works
          </motion.span>
          <motion.h2
            id="hiw-heading"
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            From sign-up to your first session{' '}
            <span className="text-[#64748B]">in minutes.</span>
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* Animated vertical connector line — draws down as section enters view */}
          <motion.div
            className="absolute left-[19px] top-8 hidden w-px bg-gradient-to-b from-[#3B82F6]/50 via-[#10B981]/30 to-transparent md:block"
            initial={{ height: 0 }}
            animate={inView ? { height: 'calc(100% - 64px)' } : { height: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0, 0, 0.2, 1] }}
            aria-hidden="true"
          />

          <ol className="flex flex-col gap-10" role="list">
            {steps.map((step, i) => (
              <motion.li
                key={step.number}
                variants={fadeLeft}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                transition={{ delay: 0.15 + i * 0.12 }}
                className="relative flex gap-6 md:gap-8"
              >
                {/* Number badge */}
                <motion.div
                  className="relative z-10 shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border font-mono text-sm font-bold transition-all duration-200"
                    style={{
                      borderColor: `${step.accent}50`,
                      backgroundColor: `${step.accent}12`,
                      color: step.accent,
                    }}
                  >
                    {step.number}
                  </div>
                </motion.div>

                {/* Content */}
                <div className="pb-2 pt-1">
                  <h3 className="text-base font-semibold text-white md:text-lg">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B] md:text-base">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
