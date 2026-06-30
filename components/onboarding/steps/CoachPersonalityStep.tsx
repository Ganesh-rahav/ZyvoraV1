'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, CoachPersonality } from '@/types/onboarding'

const personalities: {
  id: CoachPersonality
  icon: string
  label: string
  description: string
  example: string
  accent: string
}[] = [
  {
    id: 'high_performance',
    icon: '🔥',
    label: 'High Performance',
    description: 'Direct, competitive, goal-obsessed. Zero tolerance for excuses.',
    example: '"You missed your protein target by 40g. That matters. Here\'s how to close the gap."',
    accent: '#EF4444',
  },
  {
    id: 'encouraging',
    icon: '😊',
    label: 'Encouraging',
    description: 'Warm, motivating, progress-focused. Celebrates every win.',
    example: '"You hit 3 out of 4 workouts this week — that\'s real momentum. Let\'s build on it."',
    accent: '#F59E0B',
  },
  {
    id: 'scientific',
    icon: '📊',
    label: 'Scientific',
    description: 'Evidence-based, data-first, explains the reasoning behind every decision.',
    example: '"Your training frequency is suboptimal for hypertrophy. Here\'s the research-backed rationale for adjusting."',
    accent: '#3B82F6',
  },
  {
    id: 'balanced',
    icon: '⚖️',
    label: 'Balanced',
    description: 'Even-tempered, constructive, blends data with human support.',
    example: '"Good effort this week. Here\'s what the data says we should tweak, and here\'s why it\'ll make a difference."',
    accent: '#10B981',
  },
  {
    id: 'friendly',
    icon: '💬',
    label: 'Friendly',
    description: 'Conversational, casual, like a knowledgeable friend who happens to be a coach.',
    example: '"Hey, not the best week — but honestly? Showing up is still a win. Here\'s a quick tweak for next week."',
    accent: '#8B5CF6',
  },
]

export function CoachPersonalityStep({ data, onChange, onValidChange }: StepProps) {
  useEffect(() => {
    onValidChange(Boolean(data.coachPersonality))
  }, [data.coachPersonality, onValidChange])

  return (
    <div className="space-y-6">
      <StepQuestion
        question="How should your coach speak to you?"
        subtitle="This shapes every message, check-in, and recommendation you receive."
        helper="Your coach's communication style is stored as a system preference and applied to all AI responses going forward. You can update this anytime from your profile settings."
      />

      <div className="flex flex-col gap-3">
        {personalities.map((p) => {
          const selected = data.coachPersonality === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ coachPersonality: p.id })}
              className={`rounded-xl border p-5 text-left transition-all duration-150 ${
                selected
                  ? 'border-current bg-current/10'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
              style={selected ? { borderColor: `${p.accent}60`, backgroundColor: `${p.accent}10` } : {}}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl" role="img" aria-hidden="true">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${selected ? 'text-white' : 'text-[#CBD5E1]'}`}>{p.label}</p>
                    {selected && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: `${p.accent}20`, color: p.accent }}
                      >
                        Your style
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-[#64748B]">{p.description}</p>
                  {/* Example message */}
                  <div className={`mt-3 rounded-lg border p-3 transition-all duration-200 ${
                    selected ? 'opacity-100' : 'opacity-0'
                  }`} style={{ borderColor: `${p.accent}20`, backgroundColor: `${p.accent}08` }}>
                    <p className="text-xs italic leading-relaxed" style={{ color: `${p.accent}CC` }}>
                      &ldquo;{p.example}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs text-[#475569]">You can update your coaching style anytime from Profile → Settings.</p>
    </div>
  )
}
