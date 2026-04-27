import { CalendarCheckIcon, TicketIcon, PackageIcon, ArrowRightIcon } from 'lucide-react'

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: 'Smart Booking',
    description: 'Reserve lecture halls, meeting rooms, and campus facilities with our intuitive booking system. Check availability, schedule events, and manage reservations all in one place.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: TicketIcon,
    title: 'Issue Ticketing',
    description: 'Submit and track maintenance requests, report issues, and get real-time updates on ticket status. Streamlined communication ensures quick resolution of campus concerns.',
    color: 'from-amber-500/20 to-amber-600/10',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
  {
    icon: PackageIcon,
    title: 'Resource Management',
    description: 'Access and reserve essential equipment like projectors, AV systems, and lab resources. Ensure your events and classes have everything they need to succeed.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
]

function SloganIntroSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-5 md:mx-5 lg:mx-5">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Platform Overview
            </p>
            <h2 className="mb-6 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Everything you need to manage campus operations
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Our integrated platform connects booking, ticketing, and resource management 
              into a seamless experience. Discover how Smart Campus Operations Hub 
              simplifies your daily workflows.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Background Gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-xl ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent className="size-7" />
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* Learn More Link */}
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      <span>Learn more</span>
                      <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-gradient-to-br from-white/50 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              )
            })}
          </div>

          {/* Bottom Stats/Info */}
          <div className="mt-16 grid gap-8 border-t border-border pt-12 md:grid-cols-3">
            <div className="text-center md:text-left">
              <p className="mb-2 text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Resources Available</p>
            </div>
            <div className="text-center md:text-left">
              <p className="mb-2 text-3xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Support Access</p>
            </div>
            <div className="text-center md:text-left">
              <p className="mb-2 text-3xl font-bold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground">Digital Workflow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SloganIntroSection
