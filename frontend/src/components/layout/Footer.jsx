import { Link } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react'
import CampusMark from '@/components/icons/CampusMark'
import { Button } from '@/components/ui/button'

const socialLinks = [
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'LinkedIn', icon: LinkedinIcon, href: '#' },
  { label: 'YouTube', icon: YoutubeIcon, href: '#' },
]

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Tickets', href: '/tickets/my' },
  { label: 'Profile', href: '/profile' },
]

const supportLinks = [
  { label: 'Contact Us', href: '#' },
  { label: 'About Us', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

function Footer() {
  return (
    <footer className="border-t bg-background">
      {/* Main Footer Content */}
      <div className="mx-12 py-12 md:mx-16 md:py-16 lg:mx-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Campus Support */}
            <div className="space-y-6">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border bg-card text-foreground shadow-sm">
                  <CampusMark className="size-6" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    Smart Campus
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    Operations Hub
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Campus Support
                  </p>
                  <h4 className="mb-3 font-serif text-xl font-semibold text-foreground">
                    Contact Campus Support
                  </h4>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    Get help with bookings, access issues, and campus operations questions.
                    Our support team is available to assist you with any concerns.
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href="mailto:support.smartcampus.lk"
                    className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MailIcon className="size-4 text-muted-foreground" />
                    <span>support.smartcampus.lk</span>
                  </a>
                  <a
                    href="tel:+94117544801"
                    className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span>+94 11 754 4801</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span>Smart Campus Operations Center,<br />Main Administration Building</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Links */}
            <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
              {/* Explore Links */}
              <div>
                <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                  Explore
                </h5>
                <ul className="space-y-3">
                  {exploreLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                  Support
                </h5>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow Us */}
              <div>
                <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                  Follow Us
                </h5>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.label}
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-full"
                        aria-label={item.label}
                        asChild
                      >
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          <Icon className="size-4" />
                        </a>
                      </Button>
                    )
                  })}
                </div>

                {/* Newsletter Signup Hint */}
                <div className="mt-6">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Stay updated with campus news
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    Follow us on social media for the latest announcements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="mx-12 py-6 md:mx-16 lg:mx-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-xs text-muted-foreground">
                Copyright &copy; {new Date().getFullYear()} Smart Campus - All Rights Reserved
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="#" className="text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
