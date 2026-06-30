'use client'

import { useEffect, useMemo } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, MotivationType } from '@/types/onboarding'

const motivationOptions: { id: MotivationType; icon: string; label: string; description: string }[] = [
  { id: 'confidence', icon: '✨', label: 'Confidence',    description: 'Feel more comfortable and confident in your body.' },
  { id: 'health',     icon: '❤️', label: 'Health',        description: 'Reduce disease risk, improve longevity and energy levels.' },
  { id: 'sports',     icon: '🏅', label: 'Sports',        description: 'Perform better in a specific sport or physical activity.' },
  { id: 'lifestyle',  icon: '🌿', label: 'Lifestyle',     description: 'Build sustainable habits that stick long-term.' },
  { id: 'appearance', icon: '🪞', label: 'Appearance',    description: 'Change how you look — honestly, and without shame.' },
  { id: 'performance',icon: '⚡', label: 'Performance',   description: 'Unlock new levels of physical capability and output.' },
]

export function MotivationStep({ data, onChange, onValidChange }: StepProps) {
  const selected = useMemo(() => data.motivations ?? [], [data.motivations])

  const toggle = (id: MotivationType) => {
    const updated = selected.includes(id) ? selected.filter((m) => m !== id) : [...selected, id]
    onChange({ motivations: updated })
  }

  useEffect(() => {
    const hasSelection = selected.length > 0 || (data.motivationCustom?.trim().length ?? 0) > 0
    onValidChange(hasSelection)
  }, [selected, data.motivationCustom, onValidChange])

  return (
    <div className="space-y-7">
      <StepQuestion
        question="What drives this transformation?"
        subtitle="Select everything that resonates. There are no wrong answers."
        helper="Understanding your 'why' allows your coach to frame recommendations in language that connects with what you actually care about — making advice more actionable and sustainable."
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Motivations">
        {motivationOptions.map((m) => {
          const isSelected = selected.includes(m.id)
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(m.id)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 ${
                isSelected
                  ? 'border-[#3B82F6]/60 bg-[#3B82F6]/10'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              <span className="text-xl" role="img" aria-hidden="true">{m.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#CBD5E1]'}`}>{m.label}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">{m.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom motivation */}
      <div>
        <label htmlFor="motivation-custom" className="mb-1.5 block text-sm font-medium text-[#64748B]">
          Anything else? <span className="text-[#475569]">(optional)</span>
        </label>
        <textarea
          id="motivation-custom"
          value={data.motivationCustom ?? ''}
          onChange={(e) => onChange({ motivationCustom: e.target.value })}
          placeholder="Tell your coach what this journey means to you in your own words..."
          rows={3}
          className="w-full resize-none rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-3 text-sm text-white placeholder-[#475569] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        />
      </div>
    </div>
  )
}
