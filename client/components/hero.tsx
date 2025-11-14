import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">Now in public beta</span>
          </div>
          
          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Streamline your workflow, amplify your impact
          </h1>
          
          <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The all-in-one platform that helps modern teams collaborate,
            automate, and scale their operations with intelligent tools designed
            for the way you work.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-50 blur-3xl" />
          <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <img
              src="/modern-analytics-dashboard.png"
              alt="StreamLine Dashboard"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
