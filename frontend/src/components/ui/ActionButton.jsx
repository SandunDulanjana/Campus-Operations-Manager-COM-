function ActionButton({ kind = 'primary', type = 'button', disabled = false, onClick, className = '', children, ...rest }) {
  const kindClassName =
    kind === 'danger' ? 'danger-btn' : 
    kind === 'approve' ? 'approve-btn' : 
    kind === 'ghost' ? 'ghost-btn' : 
    kind === 'secondary' ? 'secondary-btn' : 
    'primary-btn'

  const buttonClassName = className ? `${kindClassName} ${className}` : kindClassName

  return (
    <button type={type} className={buttonClassName} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}

export default ActionButton
