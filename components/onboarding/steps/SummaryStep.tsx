'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Edit2 } from 'lucide-react'
import { staggerParent, fadeUp } from '@/lib/motion'
import type { StepProps } from '@/types/onboarding'
import { useEffect } from 'react'

const goalLabels: Record<string, string> = {
  lose_fat: 'Lose Fat', build_muscle: 'Build Muscle', recomposition: 'Body Recomposition',
  build_strength: 'Build Strength', improve_health: 'Improve General Health',
}
const expLabels: Record<string, string> = {
  beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
}
const envLabels: Record<string, string> = { gym: 'Commercial Gym', home: 'Home Gym', hybrid: 'Hybrid' }
const personalityLabels: Record<string, string> = {
  high_performance: '🔥 High Performance', encouraging: '😊 Encouraging',
  scientific: '📊 Scientific', balanced: '⚖️ Balanced', friendly: '💬 Friendly',
}
const dietLabels: Record<string, string> = {
  no_restrictions: 'No restrictions', vegetarian: 'Vegetarian', vegan: 'Vegan',
  keto: 'Keto', paleo: 'Paleo', mediterranean: 'Mediterranean', halal: 'Halal', gluten_free: 'Gluten-free',
}

interface SummaryRowProps { label: string; value: string; onEdit?: () => void }
function SummaryRow({ label, value, onEdit }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[#1E293B] last:border-0">
      <span className="text-xs text-[#64748B]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-right text-sm font-medium text-[#CBD5E1]">{value}</span>
        {onEdit && (
          <button type="button" onClick={onEdit} className="shrink-0 rounded p-0.5 text-[#475569] hover:text-[#60A5FA]" aria-label={`Edit ${label}`}>
            <Edit2 className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

interface SummarySectionProps { title: string; rows: { label: string; value: string }[]; onEdit: () => void }
function SummarySection({ title, rows, onEdit }: SummarySectionProps) {
  return (
    <motion.div variants={fadeUp} className="rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{title}</p>
        <button type="button" onClick={onEdit} className="flex items-center gap-1 rounded-md border border-[#334155] px-2 py-1 text-xs text-[#64748B] hover:border-[#475569] hover:text-white" aria-label={`Edit ${title}`}>
          <Edit2 className="h-3 w-3" aria-hidden="true" /> Edit
        </button>
      </div>
      {rows.filter((r) => r.value).map((r) => (
        <SummaryRow key={r.label} label={r.label} value={r.value} />
      ))}
    </motion.div>
  )
}

interface SummaryStepProps extends StepProps { onEditStep: (step: number) => void }

export function SummaryStep({ data, onValidChange, onEditStep }: SummaryStepProps) {
  useEffect(() => { onValidChange(true) }, [onValidChange])

  const units = data.units === 'imperial' ? 'imperial' : 'metric'
  const height = data.heightCm
    ? units === 'metric' ? `${data.heightCm} cm` : `${Math.round(data.heightCm / 2.54)} in`
    : '—'
  const weight = data.weightKg
    ? units === 'metric' ? `${data.weightKg} kg` : `${Math.round(data.weightKg * 2.2046)} lbs`
    : '—'

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20">
          <CheckCircle2 className="h-5 w-5 text-[#10B981]" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Your coaching profile is ready.</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Review everything below. Edit any section before your coach starts building your plan.
          </p>
        </div>
      </div>

      <motion.div
        className="flex flex-col gap-3"
        variants={staggerParent(0.06)}
        initial="hidden"
        animate="visible"
      >
        <SummarySection title="About You" onEdit={() => onEditStep(1)} rows={[
          { label: 'Name',       value: data.firstName ?? '—' },
          { label: 'Sex',        value: data.biologicalSex ? (data.biologicalSex.charAt(0).toUpperCase() + data.biologicalSex.slice(1)) : '—' },
          { label: 'Height',     value: height },
          { label: 'Weight',     value: weight },
          { label: 'Units',      value: units === 'metric' ? 'Metric' : 'Imperial' },
        ]} />

        <SummarySection title="Goals" onEdit={() => onEditStep(2)} rows={[
          { label: 'Primary goal',    value: goalLabels[data.primaryGoal ?? ''] ?? '—' },
          { label: 'Timeline',        value: data.timeline?.replace('_months', ' months').replace('no_deadline', 'No deadline') ?? '—' },
          { label: 'Motivations',     value: (data.motivations ?? []).map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || '—' },
        ]} />

        <SummarySection title="Training" onEdit={() => onEditStep(4)} rows={[
          { label: 'Experience',  value: expLabels[data.experienceLevel ?? ''] ?? '—' },
          { label: 'Days/week',   value: data.daysPerWeek ? `${data.daysPerWeek} days` : '—' },
          { label: 'Duration',    value: data.sessionDuration?.replace('min', ' min').replace('+', '+') ?? '—' },
          { label: 'Environment', value: envLabels[data.trainingEnvironment ?? ''] ?? '—' },
        ]} />

        <SummarySection title="Lifestyle" onEdit={() => onEditStep(8)} rows={[
          { label: 'Activity level', value: data.activityLevel?.replace(/_/g, ' ') ?? '—' },
          { label: 'Sleep quality',  value: data.sleepQuality ? `${data.sleepQuality} / 5` : '—' },
          { label: 'Stress level',   value: data.stressLevel  ? `${data.stressLevel} / 5`  : '—' },
          { label: 'Energy level',   value: data.energyLevel  ? `${data.energyLevel} / 5`  : '—' },
        ]} />

        <SummarySection title="Nutrition" onEdit={() => onEditStep(9)} rows={[
          { label: 'Diet style',    value: dietLabels[data.dietStyle ?? ''] ?? '—' },
          { label: 'Meals/day',    value: data.mealFrequency ? `${data.mealFrequency} meals` : '—' },
          { label: 'Allergies',    value: (data.allergies ?? []).filter((a) => a !== 'none').join(', ') || 'None' },
        ]} />

        <SummarySection title="Coach Style" onEdit={() => onEditStep(11)} rows={[
          { label: 'Communication style', value: personalityLabels[data.coachPersonality ?? ''] ?? '—' },
        ]} />

        {data.hasInjuries && (
          <SummarySection title="Health Notes" onEdit={() => onEditStep(10)} rows={[
            { label: 'Injuries flagged', value: (data.injuries ?? []).map((i) => i.replace(/_/g, ' ')).join(', ') || '—' },
          ]} />
        )}
      </motion.div>
    </div>
  )
}
