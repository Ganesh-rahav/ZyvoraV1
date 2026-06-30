import { PhotoAnalysisProvider } from '@/contexts/photo-analysis-context'
import { PhotoAnalysisEngine }   from '@/components/photo-analysis/PhotoAnalysisEngine'

export default function PhotoAnalysisPage() {
  return (
    <PhotoAnalysisProvider>
      <PhotoAnalysisEngine />
    </PhotoAnalysisProvider>
  )
}
