function StatusBanner({ type, message }) {
  if (!message) {
    return null
  }

  return <p className={`status-banner ${type}`}>{message}</p>
}

export default StatusBanner
