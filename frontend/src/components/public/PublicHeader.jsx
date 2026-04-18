import { Link, useLocation } from 'react-router-dom'

function PublicHeader() {
  const location = useLocation()
  const onLanding = location.pathname === '/'

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link to="/" className="public-brand" aria-label="Go to landing page">
          <span className="public-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6 16.5V8.2c0-.7.36-1.34.96-1.7L12 3.5l5.04 3c.6.36.96 1 .96 1.7v8.3c0 .7-.36 1.34-.96 1.7L12 21l-5.04-2.8A1.97 1.97 0 0 1 6 16.5Z" />
              <path d="M9.2 10.8 12 9l2.8 1.8V14L12 15.8 9.2 14v-3.2Z" />
            </svg>
          </span>
          <div>
            <p className="public-brand-title">Smart Campus</p>
            <p className="public-brand-subtitle">Operations Hub</p>
          </div>
        </Link>

        <nav className="public-nav" aria-label="Public navigation">
          {onLanding && (
            <>
              <a href="#landing-overview">Overview</a>
              <a href="#landing-resources">Resources</a>
            </>
          )}
          <Link to="/login" className="public-login-link">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader
