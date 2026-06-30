'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, ExperienceLevel } from '@/types/onboarding'

const levels: { id: ExperienceLevel; icon: string; label: string; description: string; details: string[] }[] = [
  {
    id: 'beginner',
    icon: '🌱',
    label: 'Beginner',
    description: 'Fewer than 1 year of consistent training.',
    details: ['Still learning movement patterns', 'Unfamiliar with RPE or periodization', 'Any consistent training is new'],
  },
  {
    id: 'intermediate',
    icon: '🔄',
    label: 'Intermediate',
    description: '1–3 years of consistent, structured training.',
    details: ['Comfortable with core compound lifts', 'Have followed a program before', 'Progress is no longer newbie-fast'],
  },
  {
    id: 'advanced',
    icon: '🏆',
    label: 'Advanced',
    description: '3+ years with structured progression.',
    details: ['Near genetic ceiling on major lifts', 'Understand periodization and peaking', 'Progress measured in months, not weeks'],
  },
]

export function ExperienceStep({ data, onChange, onValidChange }: StepProps) {
  useEffect(() => {
    onValidChange(Boolean(data.experienceLevel))
  }, [data.experienceLevel, onValidChange])

  return (
    <div className="space-y-7">
      <StepQuestion
        question="How long have you been training seriously?"
        subtitle="Be honest — this calibrates your starting volume and intensity."
        helper="Experience level determines your initial weekly set volume, exercise selection complexity, and how aggressively your plan will progress. Overstating experience leads to overtraining. Understating leads to under-stimulation."
      />

      <div className="flex flex-col gap-3">
        {levels.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange({ experienceLevel: l.id })}
            className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-150 ${
              data.experienceLevel === l.id
                ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
            }`}
          >
            <span className="mt-0.5 text-2xl" role="img" aria-hidden="true">{l.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`font-semibold ${data.experienceLevel === l.id ? 'text-white' : 'text-[#CBD5E1]'}`}>{l.label}</p>
                {data.experienceLevel === l.id && (
                  <span className="rounded-full bg-[#3B82F6]/20 px-2 py-0.5 text-[10px] font-semibold text-[#60A5FA]">Selected</span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-[#64748B]">{l.description}</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {l.details.map((d) => (
                  <li key={d} className="flex items-center gap-1 text-xs text-[#475569]">
                    <span className="h-1 w-1 rounded-full bg-[#334155]" aria-hidden="true" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
