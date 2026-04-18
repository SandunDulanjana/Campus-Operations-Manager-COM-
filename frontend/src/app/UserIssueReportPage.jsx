import { Link } from 'react-router-dom'

function UserIssueReportPage() {
  return (
    <section className="user-placeholder-page">
      <h1>Report an Issue</h1>
      <p>
        Ticket submission UI is not wired into the frontend yet. This route is reserved for the
        user incident-report flow.
      </p>
      <Link to="/app/home">Back to dashboard</Link>
    </section>
  )
}

export default UserIssueReportPage
