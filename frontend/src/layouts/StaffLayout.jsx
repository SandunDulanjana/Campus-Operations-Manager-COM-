import { Outlet } from 'react-router-dom'
import StaffSidebar from '../components/staff/StaffSidebar'

function StaffLayout() {
  return (
    <div className="staff-shell">
      <StaffSidebar />
      <main className="staff-main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default StaffLayout
