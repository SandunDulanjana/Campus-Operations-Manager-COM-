import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import BookingPage from './booking/BookingPage'
import AdminBookingsPage from './booking/AdminBookingsPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/bookings" replace />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
