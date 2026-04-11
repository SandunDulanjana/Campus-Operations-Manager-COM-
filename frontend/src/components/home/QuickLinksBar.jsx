const quickLinks = [
  'Facilities Catalogue',
  'Booking Workflow',
  'Incident Reporting',
  'Notifications',
  'Access Control',
]

function QuickLinksBar() {
  return (
    <div className="quick-links-bar" aria-label="Campus service highlights">
      {quickLinks.map((item) => (
        <span key={item} className="quick-link-pill">
          {item}
        </span>
      ))}
    </div>
  )
}

export default QuickLinksBar
