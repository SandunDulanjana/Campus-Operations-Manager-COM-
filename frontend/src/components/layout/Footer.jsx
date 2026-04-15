function FooterIcon({ kind }) {
  if (kind === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7h2.6l.4-3h-3v-1.9c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4.1V11H8v3h2.5v7h3Z" />
      </svg>
    )
  }

  if (kind === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="1" />
      </svg>
    )
  }

  if (kind === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 9v8" />
        <path d="M12 17v-4.5a2.5 2.5 0 0 1 5 0V17" />
        <path d="M12 12a3 3 0 0 1 3-3" />
        <circle cx="7" cy="6.5" r="1.2" />
      </svg>
    )
  }

  if (kind === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 8.5a2.5 2.5 0 0 0-1.8-1.8C17.7 6.3 12 6.3 12 6.3s-5.7 0-7.2.4A2.5 2.5 0 0 0 3 8.5 26.4 26.4 0 0 0 2.7 12c0 1.2.1 2.3.3 3.5a2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.2.4 7.2.4s5.7 0 7.2-.4a2.5 2.5 0 0 0 1.8-1.8c.2-1.2.3-2.3.3-3.5s-.1-2.3-.3-3.5Z" />
        <path d="m10 9.5 5 2.5-5 2.5v-5Z" />
      </svg>
    )
  }

  return null
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-support">
          <p className="footer-overline">Need Any Support?</p>
          <h3>Contact Campus Support</h3>
          <p>support.smartcampus.lk</p>
          <p>+94 11 754 4801</p>
        </div>

        <nav className="footer-links" aria-label="Footer links">
          <a href="#">Contact Us</a>
          <a href="#">About Us</a>
          <a href="#">Privacy Policy</a>
        </nav>

        <div className="footer-social" aria-label="Social links">
          <a href="#" aria-label="Facebook">
            <FooterIcon kind="facebook" />
          </a>
          <a href="#" aria-label="Instagram">
            <FooterIcon kind="instagram" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <FooterIcon kind="linkedin" />
          </a>
          <a href="#" aria-label="YouTube">
            <FooterIcon kind="youtube" />
          </a>
        </div>
      </div>
      <p className="footer-copy">Copyright © {new Date().getFullYear()} Smart Campus — All Rights Reserved</p>
    </footer>
  )
}

export default Footer
