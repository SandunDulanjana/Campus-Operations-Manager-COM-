import { BookOpenIcon, PresentationIcon, MonitorIcon } from 'lucide-react'
import lectureImage from '../../assets/home_image/resources/lecture.jpg'
import meetingImage from '../../assets/home_image/resources/meeting.jpg'
import equipmentImage from '../../assets/home_image/resources/equipment.jpg'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const RESOURCE_ITEMS = [
  {
    id: 'lecture',
    title: 'Lecture Halls & Labs',
    description: 'Schedule lectures, workshops, and lab sessions with visibility into approved bookings and timetable reservations to avoid clashes.',
    image: lectureImage,
    alt: 'Lecture hall and lab facilities',
    icon: PresentationIcon,
    badge: 'Academic Spaces',
  },
  {
    id: 'meeting',
    title: 'Meeting Rooms',
    description: 'Reserve focused collaboration spaces for project reviews, team discussions, and staff meetings with clear time-slot control.',
    image: meetingImage,
    alt: 'Meeting room resource',
    icon: BookOpenIcon,
    badge: 'Collaboration',
  },
  {
    id: 'equipment',
    title: 'Equipment',
    description: 'Book projectors and key equipment with streamlined request tracking, so classes and events stay prepared and on schedule.',
    image: equipmentImage,
    alt: 'Equipment resource',
    icon: MonitorIcon,
    badge: 'Tech Resources',
  },
]

function ResourceShowcase() {
  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="mx-12 md:mx-16 lg:mx-20">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              Campus Resources
            </Badge>
            <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Choose the right campus resource
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Our campus offers a wide range of resources to support your activities, 
              whether it's a meeting, event, or project.
            </p>
          </div>

          {/* Resource Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_ITEMS.map((item) => {
              const IconComponent = item.icon
              return (
                <Card key={item.id} className="group overflow-hidden">
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
                      <IconComponent className="size-4" />
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary">{item.badge}</Badge>
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardHeader className="pb-4">
                    <CardTitle className="font-serif text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 flex flex-col items-center justify-center gap-3 border-t pt-10 text-center md:flex-row md:gap-6">
            <p className="text-sm text-muted-foreground">
              Ready to book your first resource?
            </p>
            <p className="text-xs text-muted-foreground/70">
              Sign in to access the booking system and manage your reservations
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ResourceShowcase
