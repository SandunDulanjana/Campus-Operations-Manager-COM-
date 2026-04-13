function SectionCard({ className = '', children, ...props }) {
  return (
    <article className={`home-section-card ${className}`.trim()} {...props}>
      {children}
    </article>
  )
}

export default SectionCard
