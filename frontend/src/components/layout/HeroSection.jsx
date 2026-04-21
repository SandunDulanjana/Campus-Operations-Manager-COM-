function HeroSection({ eyebrow, title, description, actions, imageSrc, imageAlt }) {
  return (
    <section className="booking-hero">
      <div className="hero-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p>{description}</p>
        {actions}
      </div>
      <div className="hero-media">
        <img src={imageSrc} alt={imageAlt} />
      </div>
    </section>
  )
}

export default HeroSection
