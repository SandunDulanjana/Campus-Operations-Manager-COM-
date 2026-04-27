import { BookOpenIcon, PresentationIcon, MonitorIcon } from 'lucide-react'
import lectureImage from '../../assets/home_image/resources/lecture.jpg'
import meetingImage from '../../assets/home_image/resources/meeting.jpg'
import equipmentImage from '../../assets/home_image/resources/equipment.jpg'
import { Badge } from '@/components/ui/badge'

const RESOURCE_ITEMS = [
  {
    id: 'lecture',
    title: 'Lecture Halls & Labs',
    description:
      'Schedule lectures, workshops, and lab sessions with visibility into approved bookings and timetable reservations to avoid clashes.',
    image: lectureImage,
    alt: 'Lecture hall and lab facilities',
    icon: PresentationIcon,
    badge: 'Academic Spaces',
  },
  {
    id: 'meeting',
    title: 'Meeting Rooms',
    description:
      'Reserve focused collaboration spaces for project reviews, team discussions, and staff meetings with clear time-slot control.',
    image: meetingImage,
    alt: 'Meeting room resource',
    icon: BookOpenIcon,
    badge: 'Collaboration',
  },
  {
    id: 'equipment',
    title: 'Equipment',
    description:
      'Book projectors and key equipment with streamlined request tracking, so classes and events stay prepared and on schedule.',
    image: equipmentImage,
    alt: 'Equipment resource',
    icon: MonitorIcon,
    badge: 'Tech Resources',
  },
]

function ResourceShowcase() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-5 md:mx-5 lg:mx-5">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-12 max-w-3xl">
            <Badge variant="outline" className="mb-4 w-fit">
              Campus Resources
            </Badge>
            <h2 className="mb-6 font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Choose the right campus resource for every activity.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Our campus offers a wide range of resources to support your activities, 
              whether it's a meeting, event, or project. Explore our resources and 
              find the perfect fit for your needs.
            </p>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_ITEMS.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <IconComponent className="size-5" />
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                        {item.badge}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-3 font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-border pt-12 text-center md:flex-row md:gap-8">
            <p className="text-muted-foreground">
              Ready to book your first resource?
            </p>
            <span className="hidden text-border md:inline">|</span>
            <p className="text-sm text-muted-foreground">
              Sign in to access the booking system and manage your reservations
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResourceShowcase
