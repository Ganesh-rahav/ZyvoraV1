'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Lock, Trash2, Eye, ShieldCheck } from 'lucide-react'

const privacyPoints = [
  {
    icon: Lock,
    title: 'End-to-end encryption',
    body: 'All data — including physique photos — is encrypted at rest (AES-256) and in transit (TLS 1.3). Your files are stored in private, isolated storage buckets.',
    color: '#3B82F6',
  },
  {
    icon: Eye,
    title: 'Only you see your photos',
    body: 'Physique photos are never accessible via public links. Temporary access URLs expire within 10 minutes of generation. No one at Zyvora can view your uploads.',
    color: '#3B82F6',
  },
  {
    icon: Trash2,
    title: 'Delete everything, anytime',
    body: 'One-click account deletion removes all your data — photos, logs, plans, and history — within 72 hours. No dark patterns, no retention. Your data, your decision.',
    color: '#EF4444',
  },
  {
    icon: ShieldCheck,
    title: 'AI used responsibly',
    body: 'Your health data is used exclusively to improve your coaching experience. It is never sold, shared with advertisers, or used to train external AI models.',
    color: '#10B981',
  },
]

export function PrivacySection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="privacy"
      ref={ref}
      className="relative bg-[#080F1F] py-24 md:py-32"
      aria-labelledby="privacy-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/20 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 md:grid-cols-2 md:items-center md:gap-24">
          {/* Left: text */}
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              className="inline-block font-mono text-xs font-semibold uppercase tracking-widest text-[#10B981]"
            >
              Privacy & Security
            </motion.span>
            <motion.h2
              id="privacy-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 }}
              className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Your body data belongs to{' '}
              <span className="text-[#10B981]">you.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.12 }}
              className="mt-4 text-base leading-relaxed text-[#64748B]"
            >
              Zyvora handles physique photos, health metrics, and personal goals. We treat this data
              with the seriousness it deserves — maximum security, minimum collection, zero
              commercial use.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.18 }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#10B981]/25 bg-[#064E3B]/25 px-4 py-2.5"
            >
              <ShieldCheck className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
              <span className="text-sm font-medium text-[#10B981]">GDPR &amp; CCPA Compliant</span>
            </motion.div>
          </div>

          {/* Right: cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {privacyPoints.map((pt, i) => {
              const Icon = pt.icon
              return (
                <motion.div
                  key={pt.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-5"
                >
                  <div
                    className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${pt.color}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: pt.color }} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{pt.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{pt.body}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
