import { CalendarCheckIcon, TicketIcon, PackageIcon } from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: 'Smart Booking',
    description: 'Book lecture halls, meeting rooms, and campus spaces in seconds. Check real-time availability and manage reservations effortlessly.',
    align: 'right',
  },
  {
    icon: TicketIcon,
    title: 'Issue Ticketing',
    description: 'Report maintenance issues and track requests from submission to resolution. Get instant updates on your ticket status.',
    align: 'left',
  },
  {
    icon: PackageIcon,
    title: 'Resource Management',
    description: 'Reserve projectors, AV equipment, and lab resources. Everything your event needs, ready when you need it.',
    align: 'right',
  },
]

function SloganIntroSection() {
  return (
    <section className="bg-background py-14 md:py-16">
      <div className="mx-12 md:mx-16 lg:mx-20">
        {/* Section Header - Title and description on one line, centered, smaller */}
        <div className="mx-auto mb-12 max-w-6xl text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Platform Overview
          </p>
          <h2 className="mb-2 whitespace-nowrap font-serif text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Manage campus operations with ease
          </h2>
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            One platform for all your campus needs — book spaces, track requests, manage resources.
          </p>
        </div>

        {/* Features List - Alternating Layout */}
        <div className="mx-auto flex max-w-5xl flex-col gap-10 md:gap-12">
          {FEATURES.map((feature) => {
            const IconComponent = feature.icon
            const isIconLeft = feature.align === 'left'
            
            return (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-8 ${
                  isIconLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary md:size-14">
                    <IconComponent className="size-6 text-primary-foreground md:size-7" />
                  </div>
                </div>

                {/* Text Content */}
                <div className={`flex-1 ${isIconLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-foreground md:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Stats/Info */}
        <div className="mx-auto mt-12 max-w-5xl border-t border-border pt-8">
          <div className="grid gap-6 text-center md:grid-cols-3">
            <div>
              <p className="mb-1 text-xl font-bold text-foreground md:text-2xl">500+</p>
              <p className="text-sm text-muted-foreground">Resources Available</p>
            </div>
            <div>
              <p className="mb-1 text-xl font-bold text-foreground md:text-2xl">24/7</p>
              <p className="text-sm text-muted-foreground">Support Access</p>
            </div>
            <div>
              <p className="mb-1 text-xl font-bold text-foreground md:text-2xl">100%</p>
              <p className="text-sm text-muted-foreground">Digital Workflow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SloganIntroSection
