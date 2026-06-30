'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import { ScaleInput } from '../ui/ScaleInput'
import type { StepProps, OccupationCategory, ActivityLevel, Scale5 } from '@/types/onboarding'

const occupations: { id: OccupationCategory; label: string }[] = [
  { id: 'desk_job',              label: 'Office / Desk job' },
  { id: 'physically_active_job', label: 'Physically active job (tradesperson, warehouse, etc.)' },
  { id: 'student',               label: 'Student' },
  { id: 'healthcare',            label: 'Healthcare / Shift work' },
  { id: 'shift_work',            label: 'Shift work (irregular hours)' },
  { id: 'other',                 label: 'Other' },
]

const activityLevels: { id: ActivityLevel; label: string; detail: string }[] = [
  { id: 'sedentary',         label: 'Sedentary',         detail: 'Little to no activity outside training' },
  { id: 'lightly_active',    label: 'Lightly Active',    detail: '1–3 days light movement per week' },
  { id: 'moderately_active', label: 'Moderately Active', detail: 'Regular daily walking, active lifestyle' },
  { id: 'very_active',       label: 'Very Active',       detail: 'Physical job or high daily step count' },
  { id: 'extremely_active',  label: 'Extremely Active',  detail: 'Physical job + training (rare)' },
]

export function LifestyleStep({ data, onChange, onValidChange }: StepProps) {
  useEffect(() => {
    onValidChange(Boolean(data.occupation && data.activityLevel))
  }, [data.occupation, data.activityLevel, onValidChange])

  return (
    <div className="space-y-8">
      <StepQuestion
        question="Tell me about your daily life."
        subtitle="Outside the gym matters as much as what happens inside it."
        helper="Your TDEE (daily calorie need) isn't just about training — your job, sleep, and stress all affect recovery, hormone levels, and how aggressively your plan can progress. This is why generic calculators fail."
      />

      {/* Occupation */}
      <div>
        <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-[#CBD5E1]">
          Occupation <span className="text-[#EF4444]">*</span>
        </label>
        <select
          id="occupation"
          value={data.occupation ?? ''}
          onChange={(e) => onChange({ occupation: e.target.value as OccupationCategory })}
          className="h-12 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 text-sm text-white focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        >
          <option value="" disabled className="text-[#475569]">Select your occupation type...</option>
          {occupations.map((o) => (
            <option key={o.id} value={o.id} className="bg-[#1E293B]">{o.label}</option>
          ))}
        </select>
      </div>

      {/* Activity level */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">
          Overall activity level <span className="text-[#EF4444]">*</span>
        </p>
        <p className="mb-3 text-xs text-[#475569]">Exclude gym training — this is about your daily life activity.</p>
        <div className="flex flex-col gap-2">
          {activityLevels.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange({ activityLevel: a.id })}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                data.activityLevel === a.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              <div>
                <p className={`text-sm font-medium ${data.activityLevel === a.id ? 'text-white' : 'text-[#CBD5E1]'}`}>{a.label}</p>
                <p className="text-xs text-[#64748B]">{a.detail}</p>
              </div>
              {data.activityLevel === a.id && (
                <span className="h-2 w-2 rounded-full bg-[#3B82F6]" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Wellbeing scales */}
      <div className="flex flex-col gap-6">
        <ScaleInput
          id="sleep"
          value={(data.sleepQuality ?? 3) as Scale5}
          onChange={(v) => onChange({ sleepQuality: v as Scale5 })}
          label="Sleep quality"
          lowLabel="Very poor"
          highLabel="Excellent"
        />
        <ScaleInput
          id="stress"
          value={(data.stressLevel ?? 3) as Scale5}
          onChange={(v) => onChange({ stressLevel: v as Scale5 })}
          label="Stress level"
          lowLabel="Very low"
          highLabel="Very high"
        />
        <ScaleInput
          id="energy"
          value={(data.energyLevel ?? 3) as Scale5}
          onChange={(v) => onChange({ energyLevel: v as Scale5 })}
          label="Daily energy level"
          lowLabel="Depleted"
          highLabel="High energy"
        />
      </div>
    </div>
  )
}
