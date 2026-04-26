import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const socialLinks = [
  { label: 'Facebook', icon: FacebookIcon },
  { label: 'Instagram', icon: InstagramIcon },
  { label: 'LinkedIn', icon: LinkedinIcon },
  { label: 'YouTube', icon: YoutubeIcon },
]

function Footer() {
  return (
    <footer className="border-t bg-transparent">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:justify-between">
          <div className="flex max-w-md flex-col gap-3">
            <Badge variant="outline" className="w-fit">Campus Support</Badge>
            <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-semibold tracking-tight">Contact Campus Support</h3>
              <p className="text-muted-foreground">
                Get help with bookings, access issues, and campus operations questions.
              </p>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span>support.smartcampus.lk</span>
              <span>+94 11 754 4801</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:gap-12">
            <nav className="flex flex-col gap-3" aria-label="Footer links">
              <span className="text-sm font-medium text-muted-foreground">Explore</span>
              <a href="#" className="text-sm hover:underline">Contact Us</a>
              <a href="#" className="text-sm hover:underline">About Us</a>
              <a href="#" className="text-sm hover:underline">Privacy Policy</a>
            </nav>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-muted-foreground">Follow</span>
              <div className="flex items-center gap-2" aria-label="Social links">
                {socialLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button key={item.label} variant="outline" size="icon-lg" aria-label={item.label}>
                      <Icon />
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          Copyright © {new Date().getFullYear()} Smart Campus - All Rights Reserved
        </p>
      </div>
    </footer>
  )
}

export default Footer
