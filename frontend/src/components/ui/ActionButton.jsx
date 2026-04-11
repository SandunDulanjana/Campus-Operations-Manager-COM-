function ActionButton({ kind = 'primary', type = 'button', disabled = false, onClick, children }) {
  const className =
    kind === 'danger' ? 'danger-btn' : kind === 'approve' ? 'approve-btn' : kind === 'ghost' ? 'ghost-btn' : 'primary-btn'

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

export default ActionButton
