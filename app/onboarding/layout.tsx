import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started | Zyvora',
  description: 'Build your personalized coaching profile with Zyvora.',
  robots: { index: false, follow: false },
}

// Full-screen layout — no nav, no sidebar
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {children}
    </div>
  )
}
