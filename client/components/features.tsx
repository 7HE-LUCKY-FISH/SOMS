import { Card } from '@/components/ui/card'
import { Zap, Users, BarChart3, Shield } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast Automation',
    description:
      'Automate repetitive tasks and workflows with our intelligent automation engine. Save hours every week and focus on what matters.',
  },
  {
    icon: Users,
    title: 'Seamless Collaboration',
    description:
      'Bring your team together with real-time collaboration tools, shared workspaces, and integrated communication channels.',
  },
  {
    icon: BarChart3,
    title: 'Actionable Analytics',
    description:
      'Make data-driven decisions with powerful analytics and reporting. Track performance metrics and identify growth opportunities.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption, SOC 2 compliance, and advanced security features keep your data safe and your business protected.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border/40 bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to succeed
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to help your team work smarter, not
            harder. Built for modern businesses that demand excellence.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
