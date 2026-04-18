import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

function UserLayout() {
  return (
    <div className="app-shell app-shell-private">
      <Navbar />
      <main className="page-content app-main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
