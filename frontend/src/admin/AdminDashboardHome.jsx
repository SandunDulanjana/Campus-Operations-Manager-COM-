function AdminDashboardHome() {
  const stats = [
    { label: 'Pending bookings', value: '12' },
    { label: 'Approved today', value: '8' },
    { label: 'Active resources', value: '24' },
    { label: 'User accounts', value: '156' },
  ]

  return (
    <section className="admin-home-page">
      <div className="admin-home-header">
        <h1>Dashboard</h1>
        <p>Monitor campus operations and manage requests from one workspace.</p>
      </div>

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="admin-stat-card">
            <p>{stat.label}</p>
            <h2>{stat.value}</h2>
          </article>
        ))}
      </div>

      <div className="admin-section-card">
        <h2>Quick Overview</h2>
        <p>
          Use the sidebar to open Bookings, Users, and Resources management pages. Booking reviews and approval
          actions are available in the Bookings section.
        </p>
      </div>
    </section>
  )
}

export default AdminDashboardHome
