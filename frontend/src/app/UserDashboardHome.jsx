import { Link } from 'react-router-dom'

const dashboardCards = [
  {
    title: 'Book Facility',
    description: 'Request a room, lab, meeting space, or equipment for your next campus activity.',
    to: '/app/bookings',
    cta: 'Open Booking Form',
  },
  {
    title: 'My Upcoming Bookings',
    description: 'Review pending, approved, and cancelled booking activity in one place.',
    to: '/app/bookings',
    cta: 'View My Bookings',
  },
  {
    title: 'Report an Issue',
    description: 'Log a maintenance or incident ticket when something on campus needs attention.',
    to: '/app/report-issue',
    cta: 'Create Ticket',
  },
  {
    title: 'My Tickets',
    description: 'Track issue status, replies, and follow-up activity for the tickets you submitted.',
    to: '/app/my-tickets',
    cta: 'View My Tickets',
  },
]

function UserDashboardHome() {
  return (
    <section className="user-dashboard">
      <div className="user-dashboard-hero">
        <p className="user-dashboard-kicker">Student Workspace</p>
        <h1>Everything you need for campus requests is here.</h1>
        <p>
          Use this dashboard as your private starting point for bookings, issue reporting, and
          tracking your requests.
        </p>
      </div>

      <div className="user-dashboard-grid">
        {dashboardCards.map((card) => (
          <article key={card.title} className="user-dashboard-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link to={card.to}>{card.cta}</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default UserDashboardHome
