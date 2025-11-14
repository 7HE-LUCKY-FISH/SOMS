import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="border-b border-border/40 bg-gradient-to-b from-muted/20 to-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ready to transform your workflow?
          </h2>
          <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Join thousands of teams already using StreamLine to work smarter.
            Start your free trial today and see the difference in your first
            week.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Talk to Sales
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Set up in minutes • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
