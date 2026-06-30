'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ShieldCheck, Brain, Dumbbell, FlaskConical } from 'lucide-react'

const pillars = [
  { icon: Brain, label: 'Personalized AI coaching', color: '#3B82F6' },
  { icon: ShieldCheck, label: 'Privacy-first photo handling', color: '#10B981' },
  { icon: Dumbbell, label: 'Adaptive training plans', color: '#3B82F6' },
  { icon: FlaskConical, label: 'Evidence-informed guidance', color: '#10B981' },
]

export function TrustBanner() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="border-y border-[#1E293B] bg-[#0F172A]"
      aria-label="Platform trust signals"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-6 md:grid-cols-4"
        >
          {pillars.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <span className="text-sm font-medium text-[#CBD5E1]">{item.label}</span>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
