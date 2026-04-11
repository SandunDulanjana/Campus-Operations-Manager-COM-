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
            f
          </a>
          <a href="#" aria-label="Instagram">
            ◎
          </a>
          <a href="#" aria-label="LinkedIn">
            in
          </a>
          <a href="#" aria-label="YouTube">
            ▶
          </a>
        </div>
      </div>
      <p className="footer-copy">Copyright © {new Date().getFullYear()} Smart Campus — All Rights Reserved</p>
    </footer>
  )
}

export default Footer
