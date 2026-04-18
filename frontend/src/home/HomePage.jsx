import { useState } from 'react'
import { Link } from 'react-router-dom'
import homeImage1 from '../assets/home_image/1.jpg'
import homeImage2 from '../assets/home_image/2.jpg'
import homeImage3 from '../assets/home_image/3.jpg'
import homeImage4 from '../assets/home_image/4.jpg'
import homeImage5 from '../assets/home_image/5.jpg'
import homeImage6 from '../assets/home_image/6.jpg'
import homeImage7 from '../assets/home_image/7.jpg'
import homeImage8 from '../assets/home_image/8.jpg'
import ResourceShowcase from '../components/home/ResourceShowcase'
import SloganIntroSection from '../components/home/SloganIntroSection'

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

function CarouselArrow({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {direction === 'left' ? <path d="m14.5 6-6 6 6 6" /> : <path d="m9.5 6 6 6-6 6" />}
    </svg>
  )
}

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
        id="landing-overview"
        className="home-hero-card"
        style={{
          backgroundImage: `linear-gradient(110deg, rgba(56, 60, 68, 0.55), rgba(5, 13, 32, 0)), url(${HERO_IMAGES[activeImageIndex]})`,
        }}
      >
        <div className="home-hero-copy">
          <p className="home-hero-kicker">Public Landing</p>
          <h1>Campus operations, bookings, and coordination in one secure hub.</h1>
          <p>
            Explore the platform first. When users sign in, they move into a dedicated dashboard
            instead of looping back to marketing content.
          </p>
          <div className="home-hero-actions">
            <Link to="/login" className="home-hero-primary">Login</Link>
            <a href="#landing-resources" className="home-hero-secondary">Explore Resources</a>
          </div>
        </div>

        <button
          type="button"
          className="carousel-nav-btn prev"
          onClick={showPreviousImage}
          aria-label="Previous image"
        >
          <CarouselArrow direction="left" />
        </button>
        <button
          type="button"
          className="carousel-nav-btn next"
          onClick={showNextImage}
          aria-label="Next image"
        >
          <CarouselArrow direction="right" />
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

      <div id="landing-resources">
        <ResourceShowcase />
      </div>
    </section>
  )
}

export default HomePage
