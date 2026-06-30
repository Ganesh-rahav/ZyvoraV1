import { OnboardingProvider } from '@/contexts/onboarding-context'
import { OnboardingEngine } from '@/components/onboarding/OnboardingEngine'

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingEngine />
    </OnboardingProvider>
  )
}
