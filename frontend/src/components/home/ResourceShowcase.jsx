import lectureImage from '../../assets/home_image/resources/lecture.jpg'
import meetingImage from '../../assets/home_image/resources/meeting.jpg'
import equipmentImage from '../../assets/home_image/resources/equipment.jpg'

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
    <section className="resource-showcase-section">
      <div className="resource-showcase-header">
        <h2>Choose the right campus resource for every activity.</h2>
      </div>

      <div className="resource-showcase-list">
        {RESOURCE_ITEMS.map((item) => (
          <article key={item.id} className="resource-row">
            <h3>{item.title}</h3>
            <div className="resource-row-media">
              <img src={item.image} alt={item.alt} />
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ResourceShowcase
