import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'StreamLine transformed how our team operates. We cut our project delivery time by 40% and improved team satisfaction significantly.',
    author: 'Sarah Chen',
    role: 'VP of Operations',
    company: 'TechCorp',
    avatar: '/professional-woman-headshot.png',
    initials: 'SC',
  },
  {
    quote:
      'The automation features alone have saved us countless hours. Its like having an extra team member who never sleeps.',
    author: 'Michael Rodriguez',
    role: 'Product Manager',
    company: 'InnovateLabs',
    avatar: '/professional-man-headshot.png',
    initials: 'MR',
  },
  {
    quote:
      'Best investment weve made this year. The ROI was clear within the first month, and our team adoption rate was incredibly high.',
    author: 'Emily Watson',
    role: 'CEO',
    company: 'GrowthStudio',
    avatar: '/professional-woman-ceo.png',
    initials: 'EW',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border/40 bg-muted/20 py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by teams worldwide
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            Join thousands of companies that trust StreamLine to power their
            operations and drive growth.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="flex flex-col justify-between border-border bg-card p-8"
            >
              <div>
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <blockquote className="mb-6 text-pretty leading-relaxed">
                  {testimonial.quote}
                </blockquote>
              </div>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
