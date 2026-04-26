import { ArrowRightIcon } from 'lucide-react'
import lectureImage from '../../assets/home_image/resources/lecture.jpg'
import meetingImage from '../../assets/home_image/resources/meeting.jpg'
import equipmentImage from '../../assets/home_image/resources/equipment.jpg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const RESOURCE_ITEMS = [
  {
    id: 'lecture',
    title: 'Lecture Halls & Labs',
    description:
      'Schedule lectures, workshops, and lab sessions with visibility into approved bookings and timetable reservations to avoid clashes.',
    image: lectureImage,
    alt: 'Lecture hall and lab facilities',
  },
  {
    id: 'meeting',
    title: 'Meeting Rooms',
    description:
      'Reserve focused collaboration spaces for project reviews, team discussions, and staff meetings with clear time-slot control.',
    image: meetingImage,
    alt: 'Meeting room resource',
  },
  {
    id: 'equipment',
    title: 'Equipment',
    description:
      'Book projectors and key equipment with streamlined request tracking, so classes and events stay prepared and on schedule.',
    image: equipmentImage,
    alt: 'Equipment resource',
  },
]

function ResourceShowcase() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">Campus Booking System</Badge>
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          Choose the right campus resource for every activity.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Review the spaces and equipment already available in the platform before signing in to request, track, and manage bookings.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {RESOURCE_ITEMS.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-card/90 shadow-sm">
            <img src={item.image} alt={item.alt} className="h-56 w-full object-cover" />
            <CardHeader>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Available in booking workflow</Badge>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-sm text-muted-foreground">Smart scheduling with clear visibility</span>
              <Button asChild variant="ghost">
                <a href="#landing-overview">
                  Explore
                  <ArrowRightIcon data-icon="inline-end" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default ResourceShowcase
