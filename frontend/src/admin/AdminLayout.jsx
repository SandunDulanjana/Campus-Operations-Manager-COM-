import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <section className="staff-content-panel admin-content-panel">
      <Outlet />
    </section>
  )
}

export default AdminLayout
