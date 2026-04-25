import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/useAuth'

function RequireAdmin({ children }) {
  const { user } = useAuth()

  if (user.role !== 'ADMIN') {
    return (
      <section className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Admin access is required to view this dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Access denied</AlertTitle>
              <AlertDescription>Sign in with an approved administrator account.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    )
  }

  return children
}

export default RequireAdmin
