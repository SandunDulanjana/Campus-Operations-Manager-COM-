import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const HERO_SLIDES = [
  {
    image: homeImage1,
    title: 'Welcome to Smart Campus',
    description: 'Experience a seamless, connected campus environment where technology enhances every aspect of your academic journey.',
  },
  {
    image: homeImage2,
    title: 'Sports & Recreation',
    description: 'World-class athletic facilities available for booking. From rugby fields to fitness centers, stay active and healthy.',
  },
  {
    image: homeImage3,
    title: 'Modern Learning Spaces',
    description: 'State-of-the-art lecture halls and classrooms designed for collaborative learning and innovative teaching.',
  },
  {
    image: homeImage4,
    title: 'Research Laboratories',
    description: 'Advanced labs equipped with cutting-edge technology to support groundbreaking research and experiments.',
  },
  {
    image: homeImage5,
    title: 'Collaboration Zones',
    description: 'Flexible meeting rooms and breakout spaces designed for team projects, discussions, and creative brainstorming.',
  },
  {
    image: homeImage6,
    title: 'Event Venues',
    description: 'Elegant spaces for conferences, seminars, and campus events. Create memorable experiences for your audience.',
  },
  {
    image: homeImage7,
    title: 'Tech Equipment Hub',
    description: 'Reserve projectors, AV equipment, and technology resources to power your presentations and events.',
  },
  {
    image: homeImage8,
    title: 'Campus Community',
    description: 'A vibrant community where ideas flourish, connections grow, and excellence is nurtured every day.',
  },
]

function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  const goToSlide = useCallback((index) => {
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(nextSlide, 10000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide])

  const currentSlide = HERO_SLIDES[activeIndex]

  return (
    <div className="min-h-screen">
      {/* Hero Carousel - True Full Screen without side margins */}
      <section
        className="relative isolate h-screen w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images with Fade Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentSlide.image})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          />
        </AnimatePresence>

        {/* Lighter Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

        {/* Content - Full width without side margins */}
        <div className="relative z-10 flex h-full flex-col justify-end pb-16 pt-32">
          <div className="w-full px-8 md:px-10 lg:px-12">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <motion.p
                key={`eyebrow-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/70"
              >
                Smart Campus
              </motion.p>

              {/* Title */}
              <motion.h1
                key={`title-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 font-serif text-4xl font-semibold leading-[1.1] text-white md:text-5xl lg:text-6xl"
              >
                {currentSlide.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                key={`desc-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8 max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl"
              >
                {currentSlide.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                key={`cta-${activeIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Button size="lg" className="rounded-full px-10 py-6 text-lg bg-white text-black hover:bg-white/90" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 bg-white/10 px-10 py-6 text-lg text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <a href="#intro">Explore Resources</a>
                </Button>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-12 flex items-center gap-4">
              {/* Arrow Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="h-12 w-12 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeftIcon className="size-6" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="h-12 w-12 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <ArrowRightIcon className="size-6" />
                </Button>
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center gap-2" aria-hidden="true">
                {HERO_SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      index === activeIndex
                        ? 'w-10 bg-white'
                        : 'w-2.5 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Slide Counter */}
              <span className="ml-auto text-sm font-medium text-white/80">
                {String(activeIndex + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Positioned at the very bottom */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ 
            opacity: { delay: 1, duration: 0.5 },
            y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <a
            href="#intro"
            className="flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-white"
          >
            <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
            <ChevronDownIcon className="size-5" />
          </a>
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section id="intro">
        <SloganIntroSection />
      </section>

      {/* Resources Section */}
      <section id="resources">
        <ResourceShowcase />
      </section>
    </div>
  )
}

export default HomePage
