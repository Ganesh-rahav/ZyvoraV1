import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustBanner } from '@/components/landing/TrustBanner'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { SolutionSection } from '@/components/landing/SolutionSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { PrivacySection } from '@/components/landing/PrivacySection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Zyvora — From Potential to Physique',
  description:
    "The world's most intelligent AI fitness coach. Personalized workout plans, adaptive nutrition, and a coach that learns you over time.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-[#3B82F6] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <LandingNav />

      <main id="main-content">
        <HeroSection />
        <TrustBanner />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeatureShowcase />
        <DashboardPreview />
        <PrivacySection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  )
}
