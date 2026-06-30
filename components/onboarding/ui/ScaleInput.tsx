'use client'

import { motion } from 'framer-motion'

interface ScaleInputProps {
  id: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  lowLabel: string
  highLabel: string
  label: string
}

export function ScaleInput({
  id,
  value,
  onChange,
  min = 1,
  max = 5,
  lowLabel,
  highLabel,
  label,
}: ScaleInputProps) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  return (
    <div className="w-full">
      <p className="mb-4 text-sm font-medium text-[#CBD5E1]">{label}</p>

      {/* Dot scale */}
      <div className="flex items-center gap-2" role="radiogroup" aria-label={label}>
        {steps.map((step) => {
          const isSelected = value === step
          return (
            <motion.button
              key={step}
              type="button"
              id={`${id}-${step}`}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${label}: ${step} of ${max}`}
              onClick={() => onChange(step)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.92 }}
              className="relative flex h-10 w-full items-center justify-center rounded-lg border text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              style={{
                borderColor: isSelected ? '#3B82F6' : '#1E293B',
                backgroundColor: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(30,41,59,0.4)',
                color: isSelected ? '#93C5FD' : '#64748B',
              }}
            >
              {step}
              {isSelected && (
                <motion.div
                  layoutId={`scale-selected-${id}`}
                  className="absolute inset-0 rounded-lg border-2 border-[#3B82F6]"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Labels */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-[#475569]">{lowLabel}</span>
        <span className="text-[11px] text-[#475569]">{highLabel}</span>
      </div>
    </div>
  )
}
