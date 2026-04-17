const ROLE_DISPLAY_NAMES = {
  USER: 'Student',
  ADMIN: 'Administrator',
  TECHNICIAN: 'Technician',
  MAINTENANCEMNG: 'Maintenance Manager',
  RECOURSEMNG: 'Resource Manager',
  BOOKINGMNG: 'Booking Manager',
}

export function formatRoleLabel(role) {
  return ROLE_DISPLAY_NAMES[role] ?? role
}
