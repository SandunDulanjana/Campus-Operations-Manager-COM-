import { CalendarCheckIcon, TicketIcon, PackageIcon } from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: 'Smart Booking',
    description: 'Reserve lecture halls, meeting rooms, and campus facilities with our intuitive booking system. Check availability, schedule events, and manage reservations all in one place.',
    align: 'right',
  },
  {
    icon: TicketIcon,
    title: 'Issue Ticketing',
    description: 'Submit and track maintenance requests, report issues, and get real-time updates on ticket status. Streamlined communication ensures quick resolution of campus concerns.',
    align: 'left',
  },
  {
    icon: PackageIcon,
    title: 'Resource Management',
    description: 'Access and reserve essential equipment like projectors, AV systems, and lab resources. Ensure your events and classes have everything they need to succeed.',
    align: 'right',
  },
]

function SloganIntroSection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-12 md:mx-16 lg:mx-20">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-5xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Platform Overview
          </p>
          <h2 className="mb-6 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            Everything you need to manage campus operations
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Our integrated platform connects booking, ticketing, and resource management 
            into a seamless experience. Discover how Smart Campus Operations Hub 
            simplifies your daily workflows.
          </p>
        </div>

        {/* Features List - Alternating Layout */}
        <div className="mx-auto flex max-w-5xl flex-col gap-12 md:gap-16">
          {FEATURES.map((feature) => {
            const IconComponent = feature.icon
            const isIconLeft = feature.align === 'left'
            
            return (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10 ${
                  isIconLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div className={`flex-1 ${isIconLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="mb-3 font-serif text-xl font-semibold text-foreground md:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {feature.description}
                  </p>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-black md:size-16">
                    <IconComponent className="size-7 text-white md:size-8" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Stats/Info */}
        <div className="mx-auto mt-16 max-w-5xl border-t border-border pt-10">
          <div className="grid gap-6 text-center md:grid-cols-3">
            <div>
              <p className="mb-1 text-2xl font-bold text-foreground md:text-3xl">500+</p>
              <p className="text-sm text-muted-foreground">Resources Available</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-foreground md:text-3xl">24/7</p>
              <p className="text-sm text-muted-foreground">Support Access</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-foreground md:text-3xl">100%</p>
              <p className="text-sm text-muted-foreground">Digital Workflow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SloganIntroSection
