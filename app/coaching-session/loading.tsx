/**
 * app/coaching-session/loading.tsx
 *
 * Shown while the coaching session page assembles the ZCI output.
 * Keeps the user calm — never "Loading AI..."
 */

export default function CoachingSessionLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A]">
      <div className="flex flex-col items-center gap-5">
        {/* Animated coach mark */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#3B82F6]/20" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg shadow-[#3B82F6]/20">
            <span className="text-lg font-bold text-white">Z</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#E2E8F0]">Preparing your session</p>
          <p className="mt-1 text-[13px] text-[#475569]">Reviewing your profile…</p>
        </div>
      </div>
    </div>
  )
}
