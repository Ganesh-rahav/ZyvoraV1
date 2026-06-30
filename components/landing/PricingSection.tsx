'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { staggerParent, fadeUp, scaleIn } from '@/lib/motion'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Begin your journey. No credit card required.',
    features: [
      'Basic onboarding & profile',
      'One workout plan generation',
      'Basic nutrition targets',
      'Limited AI coach messages (10/month)',
      'Progress logging',
    ],
    cta: 'Create Free Account',
    ctaHref: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 'Coming soon',
    period: '',
    description: 'Full coaching intelligence, unlimited access.',
    features: [
      'AI physique analysis (every upload)',
      'Unlimited AI coach conversations',
      'Adaptive weekly plan updates',
      'Advanced progress analytics',
      'Priority support',
      'Data export & full history',
    ],
    cta: 'Join Waitlist',
    ctaHref: '/register',
    highlighted: true,
  },
]

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="pricing"
      ref={ref}
      className="bg-[#0F172A] py-24 md:py-32"
      aria-labelledby="pricing-heading"
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
            Pricing
          </motion.span>
          <motion.h2
            id="pricing-heading"
            variants={fadeUp}
            className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Start free.{' '}
            <span className="text-[#64748B]">Scale when ready.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base text-[#64748B]">
            Full pricing details coming at launch. For now — start for free, no card needed.
          </motion.p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2"
          variants={staggerParent(0.12, 0.1)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative overflow-hidden rounded-2xl border p-8 transition-colors duration-200 ${
                tier.highlighted
                  ? 'border-[#3B82F6]/40 bg-gradient-to-br from-[#1E3A8A]/30 to-[#1E293B] hover:border-[#3B82F6]/60'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              {tier.highlighted && (
                <motion.div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#3B82F6]/15 blur-2xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
              )}

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                    {tier.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="text-sm text-[#475569]">/ {tier.period}</span>
                    )}
                  </div>
                </div>
                {tier.highlighted && (
                  <span className="rounded-full bg-[#3B82F6]/20 px-2.5 py-1 text-xs font-semibold text-[#60A5FA]">
                    Full coaching
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-[#64748B]">{tier.description}</p>

              <ul className="mt-6 flex flex-col gap-3" role="list">
                {tier.features.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? 'text-[#3B82F6]' : 'text-[#475569]'}`}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-[#94A3B8]">{f}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-8"
              >
                <Link
                  href={tier.ctaHref}
                  className={`flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-[0_0_24px_0_rgba(59,130,246,0.45)]'
                      : 'border border-[#334155] text-[#94A3B8] hover:border-[#475569] hover:text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
