import { CalendarCheckIcon, TicketIcon, PackageIcon } from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: 'Smart Booking',
    description: 'Reserve lecture halls, meeting rooms, and campus facilities with our intuitive booking system. Check availability, schedule events, and manage reservations all in one place.',
    align: 'right', // Icon on right, text on left
  },
  {
    icon: TicketIcon,
    title: 'Issue Ticketing',
    description: 'Submit and track maintenance requests, report issues, and get real-time updates on ticket status. Streamlined communication ensures quick resolution of campus concerns.',
    align: 'left', // Icon on left, text on right
  },
  {
    icon: PackageIcon,
    title: 'Resource Management',
    description: 'Access and reserve essential equipment like projectors, AV systems, and lab resources. Ensure your events and classes have everything they need to succeed.',
    align: 'right', // Icon on right, text on left
  },
]

function SloganIntroSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-5 md:mx-5 lg:mx-5">
        {/* Section Header - Full Width */}
        <div className="mb-20 max-w-none">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Platform Overview
          </p>
          <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Everything you need to manage campus operations
          </h2>
          <p className="max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Our integrated platform connects booking, ticketing, and resource management 
            into a seamless experience. Discover how Smart Campus Operations Hub 
            simplifies your daily workflows.
          </p>
        </div>

        {/* Features List - Alternating Layout */}
        <div className="flex flex-col gap-16 md:gap-20">
          {FEATURES.map((feature, index) => {
            const IconComponent = feature.icon
            const isIconLeft = feature.align === 'left'
            
            return (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12 ${
                  isIconLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Text Content */}
                <div className={`flex-1 ${isIconLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="mb-4 font-serif text-2xl font-semibold text-foreground md:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground md:text-lg">
                    {feature.description}
                  </p>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-black md:size-24">
                    <IconComponent className="size-10 text-white md:size-12" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Stats/Info */}
        <div className="mt-20 grid gap-8 border-t border-border pt-12 md:grid-cols-3">
          <div className="text-center md:text-left">
            <p className="mb-2 text-3xl font-bold text-foreground md:text-4xl">500+</p>
            <p className="text-sm text-muted-foreground md:text-base">Resources Available</p>
          </div>
          <div className="text-center md:text-left">
            <p className="mb-2 text-3xl font-bold text-foreground md:text-4xl">24/7</p>
            <p className="text-sm text-muted-foreground md:text-base">Support Access</p>
          </div>
          <div className="text-center md:text-left">
            <p className="mb-2 text-3xl font-bold text-foreground md:text-4xl">100%</p>
            <p className="text-sm text-muted-foreground md:text-base">Digital Workflow</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SloganIntroSection
