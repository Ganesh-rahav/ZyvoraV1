'use client'

import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface UploadProgressProps {
  /** 0–100 */
  progress: number
  fileName: string
  isComplete?: boolean
}

export function UploadProgress({ progress, fileName, isComplete }: UploadProgressProps) {
  return (
    <div className="w-full rounded-xl border border-[#1E293B] bg-[#1E293B]/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="max-w-[70%] truncate text-sm font-medium text-white">{fileName}</p>
        {isComplete ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          >
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" aria-hidden="true" />
          </motion.span>
        ) : (
          <span className="font-mono text-xs text-[#64748B]">{Math.round(progress)}%</span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0F172A]">
        <motion.div
          className={`h-full rounded-full ${isComplete ? 'bg-[#10B981]' : 'bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]'}`}
          initial={{ width: 0 }}
          animate={{ width: `${isComplete ? 100 : progress}%` }}
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        />
      </div>

      {isComplete && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-[#10B981]"
        >
          Uploaded successfully
        </motion.p>
      )}
    </div>
  )
}
