import { useAuth } from '../context/useAuth'
import UserLayout from './UserLayout'
import StaffLayout from './StaffLayout'

function PrivateLayoutRouter() {
  const { user } = useAuth()

  if (user?.role === 'USER') {
    return <UserLayout />
  }

  return <StaffLayout />
}

export default PrivateLayoutRouter
