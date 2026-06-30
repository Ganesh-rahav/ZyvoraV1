'use client'

import { useEffect, useMemo } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, InjuryArea } from '@/types/onboarding'

const injuryAreas: { id: InjuryArea; label: string; icon: string }[] = [
  { id: 'lower_back', label: 'Lower Back', icon: '🔻' },
  { id: 'upper_back', label: 'Upper Back / Traps', icon: '🔼' },
  { id: 'shoulder',   label: 'Shoulder', icon: '💪' },
  { id: 'knee',       label: 'Knee', icon: '🦵' },
  { id: 'hip',        label: 'Hip', icon: '🦴' },
  { id: 'ankle',      label: 'Ankle / Foot', icon: '🦶' },
  { id: 'wrist',      label: 'Wrist / Forearm', icon: '✋' },
  { id: 'neck',       label: 'Neck / Cervical', icon: '🧣' },
  { id: 'elbow',      label: 'Elbow', icon: '🦾' },
]

export function HealthStep({ data, onChange, onValidChange }: StepProps) {
  const hasInjuries = data.hasInjuries ?? false
  const selected = useMemo(() => data.injuries ?? [], [data.injuries])

  const toggle = (id: InjuryArea) => {
    onChange({ injuries: selected.includes(id) ? selected.filter((i) => i !== id) : [...selected, id] })
  }

  useEffect(() => {
    // Valid if: no injuries (false) OR has injuries + at least one area selected
    const valid = !hasInjuries || selected.length > 0
    onValidChange(valid)
  }, [hasInjuries, selected, onValidChange])

  return (
    <div className="space-y-7">
      <StepQuestion
        question="Any movement limitations or injuries?"
        subtitle="Your safety comes first. There's no judgment here — only better programming."
        helper="Injury history directly determines which exercises are removed or substituted. Your coach will never program movements that aggravate known injuries. This information stays private and is only used to protect you."
      />

      {/* Injury toggle */}
      <div className="flex gap-3">
        {[
          { value: false, label: 'No — I\'m injury-free' },
          { value: true,  label: 'Yes — I have limitations' },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => { onChange({ hasInjuries: opt.value }); if (!opt.value) onChange({ injuries: [] }) }}
            className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-all duration-150 ${
              hasInjuries === opt.value
                ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Injury area selection */}
      {hasInjuries && (
        <div>
          <p className="mb-3 text-sm font-medium text-[#CBD5E1]">
            Select affected areas <span className="text-[#EF4444]">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {injuryAreas.map((area) => {
              const sel = selected.includes(area.id)
              return (
                <button
                  key={area.id}
                  type="button"
                  aria-pressed={sel}
                  onClick={() => toggle(area.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150 ${
                    sel
                      ? 'border-[#F59E0B]/50 bg-[#F59E0B]/10'
                      : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
                  }`}
                >
                  <span className="text-lg" role="img" aria-hidden="true">{area.icon}</span>
                  <span className={`text-xs font-medium leading-tight ${sel ? 'text-[#FCD34D]' : 'text-[#64748B]'}`}>{area.label}</span>
                </button>
              )
            })}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label htmlFor="injury-notes" className="mb-1.5 block text-sm font-medium text-[#64748B]">
              Additional details <span className="text-[#475569]">(optional but helpful)</span>
            </label>
            <textarea
              id="injury-notes"
              value={data.injuryNotes ?? ''}
              onChange={(e) => onChange({ injuryNotes: e.target.value })}
              placeholder="e.g. 'Herniated L4-L5 disc — no heavy deadlifts or squats below parallel'"
              rows={3}
              className="w-full resize-none rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-3 text-sm text-white placeholder-[#475569] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>
        </div>
      )}

      {/* Medical disclaimer */}
      <div className="rounded-xl border border-[#334155] bg-[#1E293B]/60 p-4">
        <p className="text-xs leading-relaxed text-[#64748B]">
          <strong className="text-[#94A3B8]">Medical disclaimer:</strong> Zyvora provides fitness coaching recommendations, not medical advice. If you have a diagnosed medical condition, chronic pain, or recent surgery, please consult a qualified healthcare provider before starting any exercise program. Your coach will always err on the side of caution with any flagged limitations.
        </p>
      </div>
    </div>
  )
}
