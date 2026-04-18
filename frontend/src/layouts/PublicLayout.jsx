import { Outlet } from 'react-router-dom'
import PublicHeader from '../components/public/PublicHeader'
import Footer from '../components/layout/Footer'

function PublicLayout() {
  return (
    <div className="public-shell">
      <PublicHeader />
      <main className="public-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
