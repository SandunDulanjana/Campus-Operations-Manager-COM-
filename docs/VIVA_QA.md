# IT3030 PAF Assignment — Viva Q&A Starter

## How to Use

For each question:

- Give a short answer first (1-2 lines)
- Then give a concept-grounded explanation
- Connect answer to what is implemented in this repository

## Architecture

### Q1. Why did you choose 3-tier architecture?

Short answer: It separates UI, business logic, and data storage for better maintainability and security.

Expanded answer: As taught in Lecture 04, 3-tier architecture enforces separation of concerns. In this project, React is the presentation tier, Spring Boot is the application tier, and PostgreSQL is the data tier.

### Q2. Why modular monolith instead of microservices?

Short answer: It gives clean module separation without microservice overhead.

Expanded answer: Tutorial 04 recommends starting simple for small teams. Microservices add operational complexity (deployment, service communication, debugging) that is unnecessary for this project scope.

### Q3. Why SQL for this system?

Short answer: The system has strongly related data and rule-heavy queries.

Expanded answer: Bookings, resources, tickets, and users are relational. SQL supports foreign keys, joins, and transaction guarantees needed for conflict checks and integrity.

## REST API Design

### Q4. How does your API follow REST constraints?

Short answer: We follow client-server, stateless communication, uniform interface, and layered architecture.

Expanded answer: Endpoints are resource-based, methods are standard HTTP verbs, auth is token-based (stateless), and client/backend/database are cleanly separated.

### Q5. Why did you use specific HTTP status codes?

Short answer: To communicate API outcomes clearly and consistently.

Expanded answer: We use 200 for successful reads/updates, 201 for create, 204 for delete, and 4xx for validation or authorization failures, as taught in REST lectures.

### Q6. Why not use RPC style endpoints?

Short answer: RPC-style endpoints reduce clarity and violate REST uniform interface.

Expanded answer: Resource-oriented paths with standard verbs are easier to test, document, and reason about compared with action-heavy RPC naming.

## Authentication and Authorization

### Q7. Why OAuth 2.0 and JWT?

Short answer: OAuth 2.0 is required by rubric, and JWT supports stateless API requests.

Expanded answer: OAuth handles secure identity delegation, and JWT carries user identity/role claims without server-side session state.

### Q8. Explain authentication vs authorization in your system.

Short answer: Authentication verifies who the user is; authorization controls what they can do.

Expanded answer: Login establishes identity, then role checks (USER/ADMIN/TECHNICIAN) control access to protected endpoints.

## Workflow and Quality

### Q9. Why feature branches and PRs?

Short answer: To isolate work and enforce review before integration.

Expanded answer: Lecture 03 emphasizes branching and PR-driven workflow to reduce conflicts, improve traceability, and keep shared branches stable.

### Q10. Why atomic commits?

Short answer: They make changes easier to review and revert safely.

Expanded answer: Each commit should do one logical thing. This follows Git best practices from lecture materials and improves auditability for viva.

### Q11. Why CI in GitHub Actions?

Short answer: To catch build/test failures early.

Expanded answer: CI operationalizes Shift Left by validating changes on push/PR, reducing late-stage integration failures.

## Module A/B Focus

### Q12. Why are Module A and B tightly coupled in design?

Short answer: Bookings depend on resources.

Expanded answer: Booking creation and conflict logic require resource identity, status, and availability metadata.

### Q13. How do you prevent booking conflicts?

Short answer: Reject overlapping bookings for the same resource and time window.

Expanded answer: We check same resource + same date + overlapping time ranges before approval/creation.

### Q14. Why enforce resource status in booking?

Short answer: OUT_OF_SERVICE resources must not be bookable.

Expanded answer: This aligns business logic across modules and prevents invalid workflows.

## Add More During Development

Append questions as features are implemented:

- endpoint-level justifications
- validation-rule justifications
- state-transition justifications
- error-handling justifications
