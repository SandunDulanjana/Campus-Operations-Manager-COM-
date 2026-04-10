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

### Why SQL

**Lecture Reference:** Lecture 04 — Web Architecture, Tutorial 04 — Architecture Trade-offs

We chose a relational SQL database (PostgreSQL via Neon) because our system has many interconnected entities with clear relationships: users, resources, bookings, tickets, comments, and notifications.

#### How Our Data Is Related

```
User ────< Booking >──── Resource
 │                        │
 │                        ├───< Ticket >──── Comment
 │                        │
 └───< Notification
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Relationships** | Foreign keys enforce data integrity between bookings and resources |
| **Conflict Checks** | SQL queries can detect overlapping time ranges efficiently |
| **Ownership Checks** | JOIN queries verify "who owns what" for access control |
| **Transactions** | ACID guarantees prevent double-bookings and lost updates |
| **Reporting** | Aggregations (bookings per resource, ticket resolution times) are straightforward |

#### Why Not Other Approaches?

| Database Type | Why Rejected |
|---|---|
| **NoSQL (MongoDB)** | Poor relationship support, booking overlap checks become complex application logic |
| **In-Memory Collections** | Data lost on restart, no persistence, violates assignment requirements |
| **File-Based Storage** | No concurrency control, no transactions, not scalable |

**Conclusion:** SQL is the right choice because our data is highly relational and requires integrity guarantees. The assignment explicitly requires persistent database storage, and SQL provides the strongest foundation for our use case.

### Why REST APIs

**Lecture Reference:** Lecture 05 — REST APIs, Tutorial 05 — Analyzing RESTfulness

We chose REST (Representational State Transfer) as our API architectural style because it enforces a uniform interface, stateless communication, and clear resource identification — all of which align with the course focus and the assignment rubric requirements.

#### The 6 REST Constraints and How We Satisfy Them

| Constraint | How Our System Satisfies It |
|---|---|
| **Client-Server** | React frontend and Spring Boot backend are strictly separated |
| **Stateless** | Each request carries its own authentication (JWT token); no server-side session |
| **Cacheable** | GET responses can declare cacheability; POST/PUT/DELETE are never cached |
| **Uniform Interface** | Consistent resource URIs (`/api/resources/{id}`), standard HTTP methods |
| **Layered System** | 3-tier architecture: frontend → backend → database, intermediaries invisible to client |
| **Code on Demand** | *(Optional)* Frontend receives executable JavaScript via React bundles |

#### REST Maturity Level

We target **Level 2** (proper resources + HTTP verbs + status codes) as our baseline, with **Level 3 (HATEOAS)** planned as an innovation feature for creativity marks.

```
Level 0: Single endpoint, all POST          ← Swamp of POX
Level 1: Multiple URIs, still mostly POST   ← Resources identified
Level 2: Proper HTTP methods + status codes ← Our baseline target
Level 3: HATEOAS with hypermedia links      ← Innovation target
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Decoupling** | Frontend can be replaced (e.g., mobile app) without changing the API |
| **Scalability** | Stateless design allows horizontal scaling of backend instances |
| **Testability** | Each endpoint is independently testable with standard HTTP tools |
| **Rubric Alignment** | 10 marks for REST constraints, 5 marks for endpoint naming, 10 marks for HTTP methods/status codes |

#### Why Not Other Approaches?

| API Style | Why Rejected |
|---|---|
| **SOAP** | Overly complex XML-based protocol, heavy WSDL contracts, not aligned with modern web development |
| **GraphQL** | Adds query complexity, harder to cache, overkill for our CRUD-focused use case |
| **RPC-style (single endpoint)** | Violates REST uniform interface, hard to test, poor separation of concerns |

**Conclusion:** REST is the right choice because it aligns with the course curriculum, satisfies the rubric requirements, and provides a clean, testable, scalable API design for our use case.

### Why OAuth 2.0 and JWT

**Lecture Reference:** Lecture 06 — REST APIs Auth, Tutorial 06 — Authentication Deep Dive

We chose Google login using OAuth 2.0 together with OpenID Connect (OIDC) for user authentication, and JWT (JSON Web Tokens) for stateless API authorization after sign-in. This satisfies the rubric requirement for OAuth 2.0-based login while also keeping our REST API truly stateless for protected requests.

#### How Our Authentication Flow Works

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│  User   │────▶│ Google OAuth │────▶│  Our App    │
│         │◀────│  (Provider)  │     │  Backend    │
└─────────┘     └──────────────┘     └─────────────┘
     │                                      │
     │◀────────── JWT Token ────────────────│
     │                                      │
     │─── Request + JWT Header ────────────▶│
     │◀────────── Protected Resource ───────│
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **No Password Storage** | Google handles credentials; we never store sensitive user passwords |
| **Stateless API** | JWT contains all user info (id, role); no server-side session needed |
| **Role-Based Access** | JWT payload includes the application role (USER, MANAGER, ADMIN, TECHNICIAN) for endpoint protection |
| **Scalability** | No session state means backend instances can scale horizontally |
| **Rubric Requirement** | 10 marks for OAuth 2.0 implementation |

#### OAuth 2.0 vs JWT: Clarifying the Roles

| Concept | Role in Our System |
|---|---|
| **OAuth 2.0** | Authorization framework — handles "who can access what" via external provider |
| **JWT** | Token format — carries user identity and role claims in a self-contained, verifiable way |
| **OpenID Connect (OIDC)** | Identity layer on top of OAuth 2.0 — provides user profile information |

#### Why Not Other Approaches?

| Auth Method | Why Rejected |
|---|---|
| **Session-Based Auth** | Requires server-side session storage, breaks statelessness, hard to scale |
| **HTTP Basic Auth** | Sends credentials on every request, insecure without HTTPS, no role support |
| **API Keys** | No expiration, no role granularity, poor security if leaked |
| **Custom Auth** | Reinventing the wheel, security risks, doesn't satisfy rubric requirement |

**Conclusion:** OAuth 2.0 + JWT is the right choice because it satisfies the rubric, keeps our API stateless, provides role-based access control, and follows modern authentication best practices taught in the course.

### Why React and Component-Based Frontend

**Lecture Reference:** Lecture 07 — Frontend Development, Tutorial 07 — React State Management

We chose React for our frontend because it uses a component-based architecture with a Virtual DOM, which makes UI updates efficient and code reusable. This aligns with the MVVM-style pattern where the UI stays separate from data-fetching and state logic.

#### How Our Frontend Is Organized

```
frontend/src/
├── pages/          ← Full screens (Dashboard, Resources, Bookings)
├── components/     ← Reusable UI parts (Navbar, Cards, Forms)
├── api/            ← Backend communication (axios calls)
├── context/        ← Shared state (AuthContext, notifications)
└── App.jsx         ← Root component with routing
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Virtual DOM** | Efficient UI updates when booking status or notifications change |
| **Component Reuse** | Same card, form, and table components across all modules |
| **One-Way Data Flow** | Predictable state management — parent passes props to children |
| **Hooks** | `useState` for local state, `useEffect` for API calls, `useContext` for auth |
| **Vite Build Tool** | Fast dev server, hot reload, optimized production bundles |

#### Why Not Other Approaches?

| Frontend Framework | Why Rejected |
|---|---|
| **Angular** | Steeper learning curve, heavier bundle, overkill for our project scope |
| **Vanilla JS** | Manual DOM manipulation, no component reuse, hard to maintain |
| **Server-Side Rendering (Thymeleaf)** | Tightly couples UI to backend, violates 3-tier separation |

**Conclusion:** React gives us a modern, component-based frontend that aligns with the course focus on JavaScript frameworks and keeps our UI layer clean, reusable, and maintainable.

### Why IoC and Dependency Injection

**Lecture Reference:** Lecture 01 — Software Frameworks, Tutorial 01 — Framework Concepts

We use Inversion of Control (IoC) and Dependency Injection (DI) because they are the core principles of the Spring Framework. They allow us to write decoupled, testable code by letting the framework manage the lifecycle of objects (Beans).

#### How It Works

```
Traditional (Tight Coupling):
[ Controller ] ── creates ──▶ [ Service ] ── creates ──▶ [ Repository ]

Spring IoC (Loose Coupling):
[ Spring Container ]
    │
    ├── Injects ──▶ [ Repository ]
    ├── Injects ──▶ [ Service ]
    └── Injects ──▶ [ Controller ]
```

#### Why This Matters for Our Project

| Concept | How It Applies |
|---|---|
| **Hollywood Principle** | "Don't call us, we'll call you." Spring calls our methods based on annotations. |
| **Loose Coupling** | Controllers don't "new up" services; they receive them via constructor injection. |
| **Testability** | We can easily swap real repositories for mocks during unit testing. |
| **Maintainability** | Changing a service implementation doesn't require changing every class that uses it. |

#### Why Not Other Approaches?

| Method | Why Rejected |
|---|---|
| **Manual New Keywords** | Creates hard dependencies; if a constructor changes, we have to fix it in every usage |
| **Static Utility Classes** | Hard to mock, hard to test, and doesn't follow Object Oriented best practices |
| **Service Locator Pattern** | Hides dependencies; harder to see what a class actually needs to run |

**Conclusion:** IoC and DI are why we use Spring Boot. They move the control of object creation from our code to the framework, allowing us to focus on business logic rather than wiring components together.
