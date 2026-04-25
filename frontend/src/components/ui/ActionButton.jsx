import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const KIND_VARIANTS = {
  primary: {
    variant: 'default',
    className:
      'primary-btn border border-white/10 bg-[linear-gradient(135deg,var(--brand-600)_0%,var(--accent-700)_100%)] text-white shadow-[0_14px_24px_rgba(20,108,105,0.22)] hover:shadow-[0_18px_30px_rgba(20,108,105,0.28)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] dark:text-white dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
  },
  approve: {
    variant: 'default',
    className:
      'approve-btn border border-white/10 bg-[linear-gradient(135deg,#166534_0%,var(--success-600)_100%)] text-white shadow-[0_12px_22px_rgba(21,128,61,0.18)] hover:shadow-[0_16px_30px_rgba(21,128,61,0.24)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(34,197,94,0.3)_0%,rgba(21,128,61,0.5)_100%)] dark:text-white',
  },
  danger: {
    variant: 'destructive',
    className:
      'danger-btn border border-white/10 bg-[linear-gradient(135deg,#b13527_0%,var(--danger-600)_100%)] text-white shadow-[0_12px_22px_rgba(220,38,38,0.18)] hover:shadow-[0_16px_30px_rgba(220,38,38,0.24)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(239,68,68,0.28)_0%,rgba(185,28,28,0.52)_100%)] dark:text-white',
  },
  secondary: {
    variant: 'secondary',
    className:
      'secondary-btn border border-slate-500/20 bg-[#36454f] text-white hover:bg-[#4b5a6a] dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/16',
  },
  ghost: {
    variant: 'outline',
    className:
      'ghost-btn border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-muted)] shadow-none hover:bg-[var(--bg-subtle)] hover:text-[var(--text-strong)] dark:border-white/10 dark:bg-white/5 dark:text-white/84 dark:hover:bg-white/10 dark:hover:text-white',
  },
}

function ActionButton({
  kind = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const config = KIND_VARIANTS[kind] ?? KIND_VARIANTS.primary

  return (
    <Button
      type={type}
      variant={config.variant}
      className={cn(
        'w-[200px] rounded-[0.7rem] px-4 py-2 font-semibold transition-all duration-150',
        'hover:-translate-y-px',
        'focus-visible:ring-2 focus-visible:ring-[var(--ring)]/40',
        config.className,
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  )
}

export default ActionButton
