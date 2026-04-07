# IT3030 PAF Assignment — Architecture

## Overall System Shape

The project will use a 3-tier structure.

  - Presentation tier: React frontend
  - Application tier: Spring Boot backend
  - Data tier: SQL database

The presentation tier is the part the user sees and uses in the browser.
The application tier handles the rules, validation, and API requests.
The data tier stores the saved records in the database.

This split keeps the user interface, business logic, and data storage separate.
It also makes the project easier to build, test, explain, and change later.

## Backend Style

The backend will be a modular monolith.

That means one Spring Boot application will contain the full backend, but the
code will still be separated by module. Each module will have its own area for
its controllers, services, repositories, and models.

This is a better fit than microservices for this assignment because it is
simpler to set up, easier to debug, and easier to manage with a small team.
Microservices would add extra moving parts that are not needed here.

The backend will still stay clean and organised, so future changes can be made
without everything being mixed together.

## Database Choice

The project will use SQL for data storage.

This project has many linked records, such as users, resources, bookings,
tickets, comments, and notifications. SQL is a better fit for this kind of
structure because the relationships are easier to define and easier to query.

SQL also fits the kind of checks this system needs. Booking overlap checks,
ownership checks, status updates, and reporting are all easier to reason about
when the data has a clear table structure.

NoSQL could also work, but SQL is the safer choice here because the data is not
just loose documents. The system needs more structure than flexibility.

## Frontend Style

The frontend will use React in a component-based style.

The React app will be arranged so that each part has a clear job:

  - pages: full screens
  - components: reusable UI parts
  - api: code that talks to the backend
  - context: shared app state such as login data

This style keeps the UI clean, makes the code easier to reuse, and makes the
app easier to test and change later.

The frontend will be treated as MVVM-style in the sense that the UI stays
separate from the data-fetching and state logic.

## API Style

The frontend and backend will talk through REST APIs over HTTP.

The API will stay stateless. Each request must contain the information needed
to handle it, so the server does not depend on stored session state.

The API will use clear resource names, proper HTTP methods, and normal status
codes. Read actions will use GET, create actions will use POST, update actions
will use PUT or PATCH, and remove actions will use DELETE.

This matches the course focus on REST design and keeps the system simple,
predictable, and easier to test.

## Authentication Style

The system will use OAuth 2.0 for login and access control.

The assignment rubric gives marks for OAuth 2.0 authentication, so this is not
just a nice extra feature. It is part of the required design.

OAuth 2.0 fits the project because it allows login through an external login
provider such as Google without storing user passwords inside the app.
That keeps the system safer and also matches the modern login flow taught in
the course materials.

JWT will be used after login to keep the API stateless. Once a user logs in,
the frontend can send the token in the request header and the backend can read
the token to know who is making the request and what role that user has.

This combination works well for a REST API because the server does not need to
store session data. It also makes role checks easier for protected pages and
protected endpoints.

The authentication design must support at least normal users and admins.
Extra roles such as technician or manager can be added if they help the system
work more clearly.

---

## Viva Defense

This section explains why we made each architectural decision, connected to course materials.

### Why 3-Tier Architecture

**Lecture Reference:** Lecture 04 — Web Architecture

We chose a 3-tier architecture because it provides clear separation of concerns. Each tier has a single responsibility and cannot directly access tiers it should not.

#### System Structure

```
┌─────────────────────────────────┐
│   Presentation Tier (React)     │  ← UI, user interaction, state
├─────────────────────────────────┤
│   Application Tier (Spring)     │  ← Business logic, validation, API
├─────────────────────────────────┤
│   Data Tier (PostgreSQL)       │  ← Persistent storage, queries
└─────────────────────────────────┘
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Security** | Frontend cannot directly query the database |
| **Maintainability** | Change the UI without touching backend logic |
| **Scalability** | Each tier can scale independently |
| **Team Work** | Frontend and backend devs work in parallel |

#### Why Not Other Approaches?

| Architecture | Why Rejected |
|---|---|
| **2-Tier (Client-Server)** | Couples UI with business logic, violates separation of concerns |
| **Microservices** | Tutorial 04: too complex for 4 developers, high overhead |
| **Single Monolith (no tiers)** | Everything mixed together, hard to test and maintain |

**Conclusion:** 3-tier gives us the right balance between structure and simplicity for this project scope.

### Why Modular Monolith

**Lecture Reference:** Lecture 04 — Web Architecture, Tutorial 04 — Architecture Trade-offs

We chose a modular monolith for our backend. This means one Spring Boot application contains all modules, but each module is organized in its own package with clear boundaries (controllers, services, repositories, models).

#### How Our Backend Is Organized

```
com.campusoperationsmanager.backend
├── resource/          ← Module A: Facilities & Assets
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
├── booking/           ← Module B: Booking Management
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
├── ticket/            ← Module C: Maintenance & Incident
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
├── notification/      ← Module D: Notifications
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
└── auth/              ← Module E: Authentication
    ├── controller/
    ├── service/
    ├── repository/
    └── model/
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Simple Setup** | One deployable unit, no service discovery needed |
| **Easy Debugging** | Single process, straightforward stack traces |
| **Team Parallelism** | Each member owns their module package |
| **Clean Boundaries** | Modules stay isolated, no cross-module coupling |
| **Future Migration** | Tutorial 04: can split into microservices later if needed |

#### Why Not Other Approaches?

| Architecture | Why Rejected |
|---|---|
| **Microservices** | Tutorial 04: high complexity, infrastructure cost, debugging difficulty — overkill for 4 developers |
| **Single Monolith (no modules)** | All code in one package, hard to maintain, violates separation of concerns |
| **Multiple Deployable Monoliths** | Unnecessary complexity, each module is not large enough to warrant its own deployment |

**Conclusion:** Modular monolith gives us clean code organization with minimal operational overhead. It follows the course recommendation to start simple and scale only when necessary.
