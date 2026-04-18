import { Link } from 'react-router-dom'

function UserTicketsPage() {
  return (
    <section className="user-placeholder-page">
      <h1>My Tickets</h1>
      <p>
        Ticket history UI is not wired into the frontend yet. This route is reserved for the
        user ticket tracking view.
      </p>
      <Link to="/app/home">Back to dashboard</Link>
    </section>
  )
}

export default UserTicketsPage
