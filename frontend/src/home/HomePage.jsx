import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.jpg'
import SectionCard from '../components/ui/SectionCard'
import QuickLinksBar from '../components/home/QuickLinksBar'
import ModuleGrid from '../components/home/ModuleGrid'
import StatsStrip from '../components/home/StatsStrip'

function HomePage() {
  return (
    <section className="home-page">
     

      <div className="home-hero-card">
        <div className="home-hero-copy">
          <p className="eyebrow">Smart Campus Operations Hub</p>
          <h1>Welcome to the Smart Campus Operations Platform</h1>
          <p>
            A common digital workspace for all assignment modules to manage campus resources, booking workflows,
            incidents, notifications, and secure user access.
          </p>
          <div className="home-hero-actions">
            <Link to="/bookings" className="primary-link">
              Request a Booking
            </Link>
            <a href="#how-to-use" className="secondary-link">
              How It Works
            </a>
          </div>
        </div>
        <div className="home-hero-media">
          <img src={heroImage} alt="Campus operations and scheduling" />
        </div>
      </div>

      <StatsStrip />

      <div className="home-content-grid">
        <SectionCard className="how-to-use-card" id="how-to-use">
          <h2>How to Use the System</h2>
          <ol>
            <li>Select a resource and submit booking details (date, time range, purpose).</li>
            <li>Booking request enters the workflow as <strong>PENDING</strong>.</li>
            <li>Managers review and update status to <strong>APPROVED</strong> or <strong>REJECTED</strong>.</li>
            <li>Approved bookings can be cancelled when plans change.</li>
          </ol>
        </SectionCard>

        <SectionCard>
          <h2>Available Resources</h2>
          <div className="home-feature-grid">
            <div className="feature-card">
              <h3>Meeting Rooms</h3>
              <p>Plan discussions, project reviews, and small team sessions.</p>
            </div>
            <div className="feature-card">
              <h3>Lecture Halls & Labs</h3>
              <p>Schedule teaching sessions, practicals, and academic events.</p>
            </div>
            <div className="feature-card">
              <h3>Equipment</h3>
              <p>Reserve projectors and key resources with conflict checks enabled.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="module-overview-card">
          <h2>Module Overview</h2>
          <ModuleGrid />
        </SectionCard>

        <SectionCard>
          <h2>Why This Platform Matters</h2>
          <p>
            The assignment scope covers booking management, incident handling, notifications, and secure user
            access. This homepage introduces the booking workflow while fitting the broader Smart Campus vision.
          </p>
          <ul>
            <li>Reduces manual scheduling errors</li>
            <li>Improves visibility for students, staff, and admins</li>
            <li>Supports clean approval workflow and operational accountability</li>
          </ul>
        </SectionCard>

        <SectionCard className="contact-card">
          <h2>Contact Information</h2>
          <p>Need support with bookings or system access? Reach out to the campus operations team.</p>
          <p><strong>Email:</strong> campusops@university.edu</p>
          <p><strong>Phone:</strong> +94 11 234 5678</p>
          <p><strong>Office:</strong> Administration Building, Level 2</p>
        </SectionCard>
      </div>
    </section>
  )
}

export default HomePage
