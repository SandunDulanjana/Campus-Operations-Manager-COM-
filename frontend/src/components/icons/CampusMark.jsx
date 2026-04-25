export default function CampusMark(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      <rect x="8" y="7" width="32" height="34" rx="12" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 18 24 14 32 18 24 22 16 18Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M19 21.5V31M24 24V31M29 21.5V31" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 34H34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 8.5V12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
