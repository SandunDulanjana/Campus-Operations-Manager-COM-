const modules = [
  {
    id: 'A',
    title: 'Facilities & Assets Catalogue',
    description: 'Manage rooms, labs, and equipment with availability and status details.',
  },
  {
    id: 'B',
    title: 'Booking Management',
    description: 'Handle requests, approvals, rejections, cancellations, and conflict checks.',
  },
  {
    id: 'C',
    title: 'Maintenance Ticketing',
    description: 'Report incidents, assign technicians, and track repair progress.',
  },
  {
    id: 'D',
    title: 'Notifications',
    description: 'Deliver booking updates and maintenance alerts to relevant users.',
  },
  {
    id: 'E',
    title: 'Authentication & Authorization',
    description: 'Secure access with role-based permissions for users and administrators.',
  },
]

function ModuleGrid() {
  return (
    <div className="module-grid">
      {modules.map((module) => (
        <article key={module.id} className="module-card">
          <span className="module-badge">Module {module.id}</span>
          <h3>{module.title}</h3>
          <p>{module.description}</p>
        </article>
      ))}
    </div>
  )
}

export default ModuleGrid
