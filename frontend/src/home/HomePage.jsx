import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
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
import { Button } from '@/components/ui/button'

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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % HERO_IMAGES.length)
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  function showPreviousImage() {
    setActiveImageIndex((current) => (current - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)
  }

  function showNextImage() {
    setActiveImageIndex((current) => (current + 1) % HERO_IMAGES.length)
  }

  return (
    <section className="flex w-full flex-col">
      <section
        id="landing-overview"
        className="landing-anchor-target relative isolate min-h-[82svh] overflow-hidden border-b border-black/10"
        style={{
          backgroundImage: `linear-gradient(92deg, rgba(17, 22, 20, 0.78) 0%, rgba(17, 22, 20, 0.48) 34%, rgba(17, 22, 20, 0.1) 62%), linear-gradient(180deg, rgba(17, 22, 20, 0.06) 0%, rgba(17, 22, 20, 0.36) 100%), url(${HERO_IMAGES[activeImageIndex]})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_72%,rgba(245,242,235,0.92)_100%)]" />

        <div className="relative mx-auto flex min-h-[82svh] w-full max-w-screen-2xl items-end px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16 lg:px-12">
          <div className="flex max-w-3xl flex-col gap-7 text-white">
            <div className="flex flex-col gap-3">
              <p className="landing-hero-brand text-sm uppercase tracking-[0.32em] text-white/72">
                Smart Campus
              </p>
              <h1 className="landing-hero-mark max-w-2xl text-5xl leading-[0.95] font-semibold md:text-7xl lg:text-[5.6rem]">
                Smart Campus Operations Hub
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/82 md:text-lg">
                Book spaces, route requests, and keep campus activity coordinated through one public entry point and one operational system.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#landing-resources">Explore Resources</a>
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={showPreviousImage}
                aria-label="Previous image"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/18 hover:text-white"
              >
                <ArrowLeftIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={showNextImage}
                aria-label="Next image"
                className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/18 hover:text-white"
              >
                <ArrowRightIcon />
              </Button>
              <div className="flex items-center gap-2 pl-2" aria-hidden="true">
                {HERO_IMAGES.map((_, index) => (
                  <span
                    key={index}
                    className={`rounded-full transition-all duration-500 ${index === activeImageIndex ? 'h-2 w-10 bg-white' : 'h-2 w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-10 md:px-6 md:py-14">
        <SloganIntroSection />

        <div id="landing-resources" className="landing-anchor-target">
          <ResourceShowcase />
        </div>
      </div>
    </section>
  )
}

export default HomePage
