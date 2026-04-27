import { Link } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react'
import CampusMark from '@/components/icons/CampusMark'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
    <footer className="bg-slate-900 text-slate-100">
      {/* Main Footer Content */}
      <div className="mx-5 md:mx-5 lg:mx-5">
        <div className="mx-auto max-w-7xl py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Campus Support */}
            <div className="space-y-6">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                  <CampusMark className="size-7 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white">
                    Smart Campus
                  </h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Operations Hub
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                    Campus Support
                  </p>
                  <h4 className="mb-3 font-serif text-2xl font-semibold text-white md:text-3xl">
                    Contact Campus Support
                  </h4>
                  <p className="max-w-md leading-relaxed text-slate-400">
                    Get help with bookings, access issues, and campus operations questions. 
                    Our support team is available to assist you with any concerns.
                  </p>
                </div>

                <div className="space-y-3">
                  <a 
                    href="mailto:support.smartcampus.lk" 
                    className="flex items-center gap-3 text-slate-300 transition-colors hover:text-white"
                  >
                    <MailIcon className="size-5 text-slate-400" />
                    <span>support.smartcampus.lk</span>
                  </a>
                  <a 
                    href="tel:+94117544801" 
                    className="flex items-center gap-3 text-slate-300 transition-colors hover:text-white"
                  >
                    <PhoneIcon className="size-5 text-slate-400" />
                    <span>+94 11 754 4801</span>
                  </a>
                  <div className="flex items-start gap-3 text-slate-300">
                    <MapPinIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                    <span>Smart Campus Operations Center,<br />Main Administration Building</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Links */}
            <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
              {/* Explore Links */}
              <div>
                <h5 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  Explore
                </h5>
                <ul className="space-y-3">
                  {exploreLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h5 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  Support
                </h5>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow Us */}
              <div>
                <h5 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
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
                        className="rounded-full border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                        aria-label={item.label}
                        asChild
                      >
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          <Icon className="size-5" />
                        </a>
                      </Button>
                    )
                  })}
                </div>

                {/* Newsletter Signup Hint */}
                <div className="mt-6">
                  <p className="mb-2 text-sm text-slate-400">
                    Stay updated with campus news
                  </p>
                  <p className="text-xs text-slate-500">
                    Follow us on social media for the latest announcements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-5 md:mx-5 lg:mx-5">
          <div className="mx-auto max-w-7xl py-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-slate-400">
                Copyright &copy; {new Date().getFullYear()} Smart Campus - All Rights Reserved
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
                  Terms of Service
                </a>
                <a href="#" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
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
