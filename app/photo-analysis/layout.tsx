import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Physique Analysis | Zyvora',
  description: 'Upload your physique photos privately and securely for AI-powered coaching personalisation.',
  robots: { index: false, follow: false },
}

export default function PhotoAnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {children}
    </div>
  )
}
