const stats = [
  { label: 'Core Modules', value: '5' },
  { label: 'Primary User Roles', value: '4' },
  { label: 'Architecture Style', value: '3-Tier' },
  { label: 'Workflow Accuracy Goal', value: '100%' },
]

function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="System highlights">
      {stats.map((item) => (
        <div key={item.label} className="stat-tile">
          <p className="stat-value">{item.value}</p>
          <p className="stat-label">{item.label}</p>
        </div>
      ))}
    </section>
  )
}

export default StatsStrip
