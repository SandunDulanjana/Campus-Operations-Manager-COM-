import { useState } from 'react'
import homeImage1 from '../assets/home_image/1.jpg'
import homeImage2 from '../assets/home_image/2.jpg'
import homeImage3 from '../assets/home_image/3.jpg'
import homeImage4 from '../assets/home_image/4.jpg'
import homeImage5 from '../assets/home_image/5.jpg'
import homeImage6 from '../assets/home_image/6.jpg'
import homeImage7 from '../assets/home_image/7.jpg'
import homeImage8 from '../assets/home_image/8.jpg'
import SectionCard from '../components/ui/SectionCard'
import ResourceShowcase from '../components/home/ResourceShowcase'
import SloganIntroSection from '../components/home/SloganIntroSection'
import ModuleGrid from '../components/home/ModuleGrid'
import StatsStrip from '../components/home/StatsStrip'

const HERO_IMAGES = [
  homeImage1,
  homeImage2,
  homeImage3,
  homeImage4,
  homeImage5,
  homeImage6,
  homeImage7,
  homeImage8,
]

function HomePage() {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  function showPreviousImage() {
    setActiveImageIndex((current) => (current - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current + 1) % HERO_IMAGES.length)
  }

  return (
    <section className="home-page">
      <div
        className="home-hero-card"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(56, 60, 68, 0.55), rgba(5, 13, 32, 0)), url(${HERO_IMAGES[activeImageIndex]})`,
        }}
      >
        <div className="home-hero-copy">
          <h1>Welcome to the Smart Campus</h1>
        </div>

        <button
          type="button"
          className="carousel-nav-btn prev"
          onClick={showPreviousImage}
          aria-label="Previous image"
        >
          &#8592;
        </button>
        <button
          type="button"
          className="carousel-nav-btn next"
          onClick={showNextImage}
          aria-label="Next image"
        >
          &#8594;
        </button>
        <div className="carousel-progress" aria-hidden="true">
          {HERO_IMAGES.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot${index === activeImageIndex ? ' active' : ''}`}
            />
          ))}
        </div>
      </div>

      <SloganIntroSection />

      <ResourceShowcase />

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
