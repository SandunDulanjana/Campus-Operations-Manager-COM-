import { AlertCircleIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../context/useAuth'

function RequireRole({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Your account does not have permission to view this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Permission denied</AlertTitle>
              <AlertDescription>Ask an administrator if you need this access.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    )
  }

  return children
}

export default RequireRole
