export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated brand mark */}
        <div className="h-12 w-12 animate-pulse-glow rounded-full bg-primary/20 ring-2 ring-primary/40" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
