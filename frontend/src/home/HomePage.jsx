import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="home-page">
      <div className="home-card">
        <p className="eyebrow">Smart Campus Operations Hub</p>
        <h1>Welcome to Booking Management</h1>
        <p>
          Reserve rooms, labs, and equipment with a clear approval workflow. Track your request status,
          avoid schedule conflicts, and manage bookings in one place.
        </p>
        <Link to="/bookings" className="primary-link">
          Go to Booking Page
        </Link>
      </div>
    </section>
  )
}

export default HomePage
