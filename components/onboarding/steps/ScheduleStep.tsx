'use client'

import { useEffect } from 'react'
import { StepQuestion } from '../ui/StepQuestion'
import type { StepProps, SessionDuration, TrainingTime, ScheduleFlexibility } from '@/types/onboarding'

const durations: { id: SessionDuration; label: string }[] = [
  { id: '30min',  label: '30 min' },
  { id: '45min',  label: '45 min' },
  { id: '60min',  label: '60 min' },
  { id: '75min',  label: '75 min' },
  { id: '90min+', label: '90 min+' },
]

const times: { id: TrainingTime; icon: string; label: string }[] = [
  { id: 'early_morning', icon: '🌅', label: 'Early morning (5–7am)' },
  { id: 'morning',       icon: '☀️', label: 'Morning (7–11am)' },
  { id: 'afternoon',     icon: '🕐', label: 'Afternoon (11am–4pm)' },
  { id: 'evening',       icon: '🌆', label: 'Evening (4–8pm)' },
  { id: 'night',         icon: '🌙', label: 'Night (8pm+)' },
  { id: 'flexible',      icon: '🔀', label: 'Flexible — varies daily' },
]

export function ScheduleStep({ data, onChange, onValidChange }: StepProps) {
  const days = data.daysPerWeek ?? 4

  useEffect(() => {
    onValidChange(Boolean(data.daysPerWeek && data.sessionDuration && data.preferredTime))
  }, [data.daysPerWeek, data.sessionDuration, data.preferredTime, onValidChange])

  return (
    <div className="space-y-8">
      <StepQuestion
        question="How does training fit into your week?"
        subtitle="Realistic scheduling is the foundation of a plan you'll actually follow."
        helper="Training frequency and duration directly determine your weekly volume. A 3-day plan and a 5-day plan are entirely different programs — not the same program condensed or expanded."
      />

      {/* Days per week */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-[#CBD5E1]">Days per week <span className="text-[#EF4444]">*</span></p>
          <span className="font-mono text-sm font-bold text-[#3B82F6]">{days} days</span>
        </div>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ daysPerWeek: d })}
              className={`flex-1 rounded-lg border py-3 font-mono text-sm font-semibold transition-all duration-150 ${
                days === d
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        {days >= 5 && (
          <p className="mt-2 text-xs text-[#F59E0B]">⚠️ High frequency requires excellent recovery. Your coach will account for this.</p>
        )}
      </div>

      {/* Session duration */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">Session duration <span className="text-[#EF4444]">*</span></p>
        <div className="flex gap-2">
          {durations.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onChange({ sessionDuration: d.id })}
              className={`flex-1 rounded-lg border py-2.5 text-xs font-medium transition-all duration-150 ${
                data.sessionDuration === d.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred time */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">Preferred training time <span className="text-[#EF4444]">*</span></p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {times.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ preferredTime: t.id })}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                data.preferredTime === t.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15'
                  : 'border-[#1E293B] bg-[#1E293B]/40 hover:border-[#334155]'
              }`}
            >
              <span role="img" aria-hidden="true">{t.icon}</span>
              <span className={`text-xs font-medium ${data.preferredTime === t.id ? 'text-[#93C5FD]' : 'text-[#64748B]'}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flexibility */}
      <div>
        <p className="mb-3 text-sm font-medium text-[#CBD5E1]">Schedule flexibility</p>
        <div className="flex gap-3">
          {([
            { id: 'fixed',    label: 'Fixed — same days each week' },
            { id: 'flexible', label: 'Flexible — days shift around' },
          ] as { id: ScheduleFlexibility; label: string }[]).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onChange({ scheduleFlexibility: f.id })}
              className={`flex-1 rounded-lg border py-2.5 text-xs font-medium transition-all duration-150 ${
                data.scheduleFlexibility === f.id
                  ? 'border-[#3B82F6] bg-[#3B82F6]/15 text-[#93C5FD]'
                  : 'border-[#1E293B] bg-[#1E293B]/40 text-[#64748B] hover:border-[#334155] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
