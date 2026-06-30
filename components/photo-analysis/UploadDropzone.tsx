'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'
import { Upload, Camera, ImageIcon, X, AlertCircle } from 'lucide-react'
import type { PhotoViewType } from '@/types/photo-analysis'

// Accepted MIME types
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.webp,.heic'
const MAX_SIZE_MB = 10

interface UploadDropzoneProps {
  viewType: PhotoViewType
  onFileSelected: (file: File) => void
}

const VIEW_LABELS: Record<PhotoViewType, { label: string; hint: string; icon: string }> = {
  front: { label: 'Front View', hint: 'Face the camera directly. Arms slightly away from body.', icon: '⬛' },
  side:  { label: 'Side View',  hint: 'Turn 90° to your left. Keep arms naturally at your side.', icon: '▪' },
  back:  { label: 'Back View',  hint: 'Turn around completely. Feet shoulder-width apart.', icon: '⬜' },
}

export function UploadDropzone({ viewType, onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const meta = VIEW_LABELS[viewType]

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED.includes(file.type) && file.type !== '') {
      return `Unsupported format. Please use JPG, PNG, WebP, or HEIC.`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }, [])

  const handleFile = useCallback((file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    onFileSelected(file)
  }, [validate, onFileSelected])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so the same file can be re-selected after removal
    e.target.value = ''
  }, [handleFile])

  return (
    <div className="w-full">
      {/* View label */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#475569]">{meta.label}</p>
      <p className="mb-3 text-xs text-[#64748B]">{meta.hint}</p>

      {/* Drop zone */}
      <motion.div
        animate={isDragOver ? { scale: 1.02, borderColor: '#3B82F6' } : { scale: 1, borderColor: '#1E293B' }}
        transition={{ duration: 0.15 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${meta.label}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-[#1E293B]/30 px-6 py-10 text-center transition-colors hover:bg-[#1E293B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        style={{ borderColor: isDragOver ? '#3B82F6' : '#334155' }}
      >
        <AnimatePresence mode="wait">
          {isDragOver ? (
            <motion.div
              key="drag"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3B82F6]/20"
            >
              <Upload className="h-6 w-6 text-[#3B82F6]" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#334155] bg-[#0F172A]"
            >
              <ImageIcon className="h-6 w-6 text-[#475569]" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <p className="text-sm font-semibold text-white">
            {isDragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}
          </p>
          <p className="mt-0.5 text-xs text-[#475569]">JPG, PNG, WebP, HEIC · Max {MAX_SIZE_MB} MB</p>
        </div>

        {/* Mobile camera button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (inputRef.current) {
              inputRef.current.accept = 'image/*'
              inputRef.current.capture = 'environment'
              inputRef.current.click()
              inputRef.current.capture = ''
              inputRef.current.accept = ACCEPTED_EXT
            }
          }}
          className="flex items-center gap-1.5 rounded-full border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#64748B] hover:border-[#475569] hover:text-white sm:hidden"
          aria-label="Take a photo with camera"
        >
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
          Use Camera
        </button>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-start gap-2 overflow-hidden rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F87171]" aria-hidden="true" />
            <p className="text-xs text-[#FCA5A5]">{error}</p>
            <button type="button" onClick={() => setError(null)} className="ml-auto" aria-label="Dismiss error">
              <X className="h-3.5 w-3.5 text-[#F87171]" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT}
        className="sr-only"
        onChange={onInputChange}
        aria-hidden="true"
      />
    </div>
  )
}
