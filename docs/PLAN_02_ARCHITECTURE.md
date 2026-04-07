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
