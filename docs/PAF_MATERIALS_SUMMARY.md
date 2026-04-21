# PAF Materials Summary

This file is for pasting a summary of the PAF lecture, tutorial, and lab materials.

## Files

### Slides
- Lecture 07 _ Frontend development overview  File.pdf
- Lecture_01_Software_Frameworks.pdf
- Lecture_02_Git_Part1.pdf
- Lecture_03_Git_Part2.pdf
- Lecture_04_Web_Architecture.pdf
- Lecture_05_REST_APIs.pdf
- Lecture_06_REST_APIs_Auth.pdf

### Tutorials
- 1 - Tutorial.pdf
- Tutorial 06 _ REST APIs - Authentication and Authorization - Guide  File.pdf
- Tutorial 07 _  Frontend development  File.pdf
- Tutorial 1 - Guide.pdf
- Tutorial_01.pdf
- Tutorial_01_Guide.pdf
- Tutorial_01_Guide_v2.pdf
- Tutorial_02.pdf
- Tutorial_02_Guide_v3.pdf
- Tutorial_02_v2.pdf
- Tutorial_03_Guide_v2.pdf
- Tutorial_03_v2.pdf
- Tutorial_04_Guide_v2.pdf
- Tutorial_04_v2.pdf
- Tutorial_05_v2.pdf
- Tutorial_06_v2.pdf

### Labs
- 2023-S1-IT3030-LabSheet-02-Version Controlling with Git - II.pdf
- 2026-S1-IT3030-LabSheet-03-Introduction to Spring Framework.pdf
- 2026-S1-IT3030-LabSheet-04-Creating and consuming a simple API.pdf
- 2026-S1-IT3030-LabSheet-03-Introduction to Spring Framework.pdf
- SimpleExersice_PAF-Prac4.pdf
- LabSheet_00_Module_Outline_2026.pdf
- Practical 05 _ REST APIs with Spring  File.pdf
- Practical 06 _ Javascript Basics  File.pdf
- Practical Sheet 1 - Version Controlling with Git - I.pdf
- Practical_01_Git.pdf
- SimpleExersice_PAF-Prac4.pdf


Here is an extremely comprehensive, detailed, and lengthy summary of all the provided lecture slides, tutorial guides, and practical lab sheets. 

To provide the most logical and structured summary possible, the materials have been grouped into **Six Major Thematic Modules**. Each module contains the relevant lectures, the corresponding tutorials, and the hands-on practical labs that apply those concepts. 

---

# MODULE 1: Introduction to Software Frameworks and Module Outline
This module sets the baseline for the entire course, differentiating between basic programming and software engineering, and introducing the core concept of Software Frameworks.

### Files Included in this Group:
*   **Lectures:** `Lecture_01_Software_Frameworks.pdf`
*   **Tutorials:** `1 - Tutorial.pdf`, `Tutorial 1 - Guide.pdf`, `Tutorial_01.pdf`, `Tutorial_01_Guide.pdf`, `Tutorial_01_Guide_v2.pdf`
*   **Labs/Documents:** `LabSheet_00_Module_Outline_2026.pdf`

### 1. Course Overview & Module Outline (`LabSheet_00_Module_Outline_2026.pdf`)
The course "Programming Applications and Frameworks" (IT3030) is designed to expose students to contemporary concepts, technologies, and industry best practices used to engineer enterprise systems. 
*   **Learning Outcomes (LOs):** Students will learn to apply basic framework concepts, evaluate industry-standard practices, create web applications using Java frameworks, apply REST architectural styles, and build client-side components using JavaScript frameworks.
*   **Assessment:** The course consists of continuous assessments (assignments/labs 30%, practical test 10%), a mid-semester exam (20%), and a final end-of-semester exam (40%).
*   **Topics Covered:** Introduction to frameworks, industry best practices (version control, CI/CD), Java distributed systems, Java frameworks (SOAP/Data persistence), RESTful web services, and client-side JavaScript frameworks (Angular/React).

### 2. Lecture Summary: Software Frameworks Overview
The lecture begins by differentiating **Programming** (simply writing code to create an application) from **Software Engineering** (the end-to-end process of applying engineering principles to produce quality software). Software engineering includes analyzing requirements, communicating with stakeholders, choosing architectures, quality assurance (QA), deployment, and maintenance.
*   **The Problem:** Most web applications share generic functionalities (e.g., user authentication, routing, database connectivity). Rewriting these from scratch every time is inefficient.
*   **The Solution - Frameworks:** A framework is an integrated set of software artifacts (classes, objects, components) providing a reusable architecture. It provides a foundation, allowing developers to extend it with their specific business logic rather than reinventing the wheel.
*   **Frameworks vs. Libraries:** 
    *   *Default Behavior:* Frameworks behave in a specific manner out of the box.
    *   *Extensibility:* Users can extend frameworks but cannot modify the core framework code.
    *   *Inversion of Control (IoC):* This is the key difference. With a library, the developer's code calls the library. With a framework, the framework controls the flow and calls the developer's code at specific, predefined points.
*   **Advantages & Limitations:** Frameworks speed up development, offer community support, provide caching, and enforce security standards. However, they force developers to respect strict conventions, limit tweaking, and carry a learning curve that might abstract the underlying language too much. Examples include Spring/Spring Boot (Java), Express (Node.js), Laravel (PHP), and Django (Python).

### 3. Tutorial 1 Summary: Framework Concepts
The tutorial reinforces the lecture by asking students to compare libraries and frameworks.
*   **Library vs. Framework Table:** Libraries (like NumPy, jQuery) are highly flexible and can be used anywhere in any project. Frameworks (like Django, Spring) dictate the structure and require an understanding of specific rules.
*   **Inversion of Control (IoC) Analogy:** The tutorial guide uses an excellent analogy: Using a library is like ordering food at a restaurant—you decide what and when to order. Using a framework is like going to a buffet—the structure is already set up for you, and you simply navigate the predefined flow, filling in your specific choices.
*   **Real-World Example:** Instagram chose **Django** (a Python framework) for its backend. Django's simplicity allowed Instagram to iterate features quickly, while its built-in security and scalability helped the platform handle exponential user growth.

---

# MODULE 2: Version Controlling & Workflows with Git
This module covers the absolute necessity of source code management, tracking history, and collaborating with teams using Git and GitHub.

### Files Included in this Group:
*   **Lectures:** `Lecture_02_Git_Part1.pdf`, `Lecture_03_Git_Part2.pdf`
*   **Tutorials:** `Tutorial_02.pdf`, `Tutorial_02_Guide_v3.pdf`, `Tutorial_02_v2.pdf`, `Tutorial_03_Guide_v2.pdf`, `Tutorial_03_v2.pdf`
*   **Labs:** `Practical Sheet 1 - Version Controlling with Git - I.pdf`, `Practical_01_Git.pdf`, `2023-S1-IT3030-LabSheet-02-Version Controlling with Git - II.pdf`

### 1. Lecture Summary: Git Part I & II
**Part I:** Explores the history and necessity of Version Control Systems (VCS). Before VCS, developers used manual methods (saving `FINAL_rev2.doc`), which caused massive overwrite risks and data loss.
*   **Evolution of VCS:** 
    *   *Local VCS:* Tracked files locally, but only one user could edit at a time.
    *   *Centralized VCS:* A single server held the code. Users committed via a network, but it relied on a central authority and network access.
    *   *Distributed VCS (Git):* Created by Linus Torvalds in 2005. Every user maintains a complete local repository. Users can commit locally without the internet, then `push` to or `pull` from a remote server (like GitHub) to share. Git operates on **Commits** (snapshots of the working directory identified by a unique SHA-1 hash).

**Part II:** Focuses on **Branching and Workflows**.
*   **Branching:** Think of it like a tree. The `main` or `master` branch is the trunk. A branch is an isolated detour from the main path, allowing developers to work on features or bug fixes without breaking the main codebase.
*   **Workflows:** Standardized "recipes" for how a team uses Git.
    *   *GitFlow:* A highly structured, comprehensive model with dedicated development, release, and hotfix branches. It is great for enterprise software but overkill for small projects.
    *   *GitHub Flow:* A simpler, continuous-deployment-friendly model. You create a branch off `main`, commit changes, open a **Pull Request (PR)**, gather feedback, merge into `main`, and deploy.
*   **Best Practices:** Keep commits atomic (one logical change per commit), commit often, pull before creating new branches, and write meaningful commit messages.

### 2. Tutorial 2 & 3 Summary: Git Concepts and Strategies
*   **Tutorial 2:** Explains why Git, despite being distributed, usually utilizes a centralized repository (Remote/Upstream). This acts as a "Single Source of Truth," facilitates CI/CD pipelines, acts as a backup, and organizes team collaboration. It also justifies that VCS is vital for large teams to prevent conflicts, but also highly beneficial for solo developers to maintain a structured history.
*   **Tutorial 3:** Focuses on the "Why" of Git features. 
    *   *Why branch?* It isolates work, allows parallel development, makes rollbacks easy, and provides a safe space for code review. 
    *   *Why atomic commits?* If a commit only does *one* thing, it is much easier to debug, review, and revert without accidentally undoing unrelated changes.
    *   *GitFlow vs. GitHub Flow:* GitFlow is deemed too complex for simple university assignments due to its massive overhead. GitHub flow is better, but it has cons: everything happens on `main` (risking instability), and it lacks Long-Term Support (LTS) branching strategies.

### 3. Lab Summary: Practical Sheets 1 & 2
*   **Practical 1 (Local & Remote Git Basics):** Guides students to install Git, open Git Bash, and initialize a local repository using `git init`. Students create a `HelloWorld.html` file, stage it using `git add`, check status with `git status`, and save it using `git commit -m`. The lab then shifts to GitHub, teaching students how to create an empty remote repository, generate a Personal Access Token (PAT) for authentication, and push the local code to the remote server.
*   **Practical 2 (Branching & Collaboration):** Students practice creating branches (`git checkout -b feature/name`), modifying files, and pushing the new branch to GitHub. The lab requires pair programming: Student A adds Student B as a collaborator; Student B clones the repo, creates a branch, makes a change, pushes, and opens a Pull Request (PR). Student A reviews and merges the PR, simulating a real-world GitHub Flow.

---

# MODULE 3: Web Application Architecture
This module bridges the gap between basic coding and enterprise systems by exploring how modern web applications are structured.

### Files Included in this Group:
*   **Lectures:** `Lecture_04_Web_Architecture.pdf`
*   **Tutorials:** `Tutorial_04_Guide_v2.pdf`, `Tutorial_04_v2.pdf`
*   **Labs:** `2026-S1-IT3030-LabSheet-03-Introduction to Spring Framework.pdf` (Note: Intro to Spring Boot fits perfectly here as the transition into the Application Layer).

### 1. Lecture Summary: Web Architecture
*   **Websites vs. Web Apps:** Websites are static content consumers. Web applications are dynamic, interactive, and process data.
*   **Three-Tier Architecture:** The most popular N-tier architecture.
    1.  **Presentation Tier (Frontend):** The UI. Built with HTML, CSS, JS, React, Angular.
    2.  **Application Tier (Backend/Server):** Handles business logic. Built with Java (Spring), Python (Django), Node.js.
    3.  **Data Tier (Database):** Stores information.
    *Benefits:* Each tier runs on its own infrastructure, can be developed by separate teams, scaled independently, and offers high security (UI cannot directly touch the database).
*   **Frontend Architectures:** Mentions MVC (Model-View-Controller) where the controller updates the view manually, and MVVM (Model-View-ViewModel) which uses two-way data binding.
*   **Backend Architectures:**
    *   *Monolithic:* The entire application is bundled into a single unit. It's fast to start but suffers from slow development as it grows, difficult scaling, and "local complexity."
    *   *Microservices:* The app is broken into small, independent, loosely coupled services communicating via APIs. Benefits include independent scaling, polyglot programming (using different languages for different services), and high reliability. The massive downside is **High Global Complexity**, infrastructure costs, and debugging difficulty (often devolving into a "Distributed Big Ball of Mud").

### 2. Tutorial 4 Summary: Architecture Trade-offs
*   **MVC vs. MVVM:** The tutorial explicitly compares them. MVC is tightly coupled with manual DOM updates, making unit testing harder. MVVM uses a ViewModel with two-way data binding, loosely coupling the UI and making it highly testable.
*   **Frontend Frameworks:** Explains that modern frameworks like Angular automatically implement component-based architectures (MVC/MVVM), relieving the developer from having to architect the foundation from scratch.
*   **Microservices vs. Monolith:** The tutorial emphasizes that Microservices are *not* a silver bullet. They are costly and complex. The recommended approach for a new project is to **start with a Monolith**. It is easier to set up, deploy, and debug. A team should only migrate to Microservices later when the application grows large enough to face specific scalability bottlenecks.

### 3. Lab Summary: Intro to Spring Framework (Practical 3)
This lab introduces Java's Spring Boot, the tool used to build the Application Layer.
*   **Spring vs. Spring Boot:** Spring is powerful but requires heavy configuration. Spring Boot is an "opinionated" extension that provides out-of-the-box configurations, allowing developers to "just run" applications.
*   **Implementation:** Students use the VS Code Command Palette to run "Spring Initializr". They create a Maven project, select Java, and add the **Spring Web** dependency.
*   **Writing the Code:** Students navigate to the main application file and create a method annotated with `@RestController` and `@GetMapping("/")`. They return a simple string "Hello world!".
*   **Running:** The app runs on an embedded Tomcat server at `http://localhost:8080`.
*   **Extension:** Students practice modifying the endpoint to `/hello` and reading a Query Parameter (`?name=Amith`).

---

# MODULE 4: REST APIs & Spring Boot
Building on the Application Layer, this module dives deep into how the Frontend and Backend communicate using RESTful Web APIs.

### Files Included in this Group:
*   **Lectures:** `Lecture_05_REST_APIs.pdf`
*   **Tutorials:** `Tutorial_05_v2.pdf`
*   **Labs:** `2026-S1-IT3030-LabSheet-04-Creating and consuming a simple API.pdf`, `Practical 05 _ REST APIs with Spring File.pdf`, `SimpleExersice_PAF-Prac4.pdf`

### 1. Lecture Summary: REST APIs
*   **What is an API?** An Application Programming Interface is a software contract that allows two applications (like Frontend and Backend) to talk to each other. Legacy examples include SOAP and CORBA.
*   **REST (Representational State Transfer):** Introduced by Roy Fielding in 2000. It is not a technology, but an **architectural style** that runs over HTTP. It facilitates strict decoupling between client and server.
*   **The Six Architectural Constraints of REST:**
    1.  *Client-Server:* Strict separation of UI and data storage.
    2.  *Stateless:* The server stores no session state; every request contains all necessary info.
    3.  *Cacheable:* Responses must declare if they can be cached to improve efficiency.
    4.  *Uniform Interface:* Resources are identified by URIs, manipulated through representations (JSON/XML), and rely on self-descriptive messages. Crucially, it includes **HATEOAS** (Hypermedia as the Engine of Application State), meaning the server sends hyperlinks to the client showing what actions are available next (like navigating a website).
    5.  *Layered System:* Clients cannot tell if they are connected to the end server or an intermediary (load balancer, proxy).
    6.  *Code on Demand (Optional):* Servers can temporarily extend client functionality by sending executable scripts.
*   **Richardson Maturity Model:** A 4-level scale determining how "RESTful" an API is.
    *   *Level 0:* Swamp of POX (Plain Old XML). One single endpoint, doing everything via HTTP POST. (RPC style).
    *   *Level 1:* Resources. Multiple URIs representing different resources, but still mostly using POST.
    *   *Level 2:* HTTP Verbs. Fully utilizes GET, POST, PUT, DELETE correctly, and uses proper HTTP status codes.
    *   *Level 3:* Hypermedia (HATEOAS). Full REST maturity with self-discoverable links.

### 2. Tutorial 5 Summary: Analyzing RESTfulness
*   The tutorial asks students to analyze a given JSON response (`{"id": 1, "name": "Bilbo", "role": "burglar"}`). 
*   Students must identify that this response sits at **Level 2** of the Richardson Maturity Model. It uses proper resources (`/employees/1`) and HTTP verbs (GET), but it lacks hypermedia links. To make it Level 3 (fully REST compliant), the response must include a `_links` object containing URIs (like `self`, `update`, `delete`) to fulfill the HATEOAS constraint.

### 3. Lab Summary: Building and Consuming APIs
*   **Practical 4 (Creating & Consuming APIs):**
    *   *Part 1 (The API):* Students create a new Spring Boot project (`GreetingAPI`). They learn about Java **Record classes**, which act as concise data carriers for the `Greeting` response. They build a `@RestController` that handles GET requests and returns JSON.
    *   *Part 2 (The Consumer):* Students create a second Spring Boot app to consume the API. They use Spring's `RestTemplate` to make an HTTP GET request from their Java code to the API they just built (`restmp.getForObject(url, Greeting.class)`), extracting the data and printing it to the console.
*   **Simple Exercise (Extension):** Students modify the API to accept **Path Variables** (`/greet/John`) and **Query Parameters** (`?message=Hello`) to customize the output.
*   **Practical 5 (Spring HATEOAS):** Students refer to official Spring documentation to upgrade their simple API into a Level 3 REST API. They import Spring HATEOAS libraries and use `WebMvcLinkBuilder` to dynamically generate and attach hyperlinks to their JSON responses, allowing clients to auto-discover related API actions.

---

# MODULE 5: API Authentication and Authorization
Exposing an API to the internet requires strict security to ensure only the right people access the right data.

### Files Included in this Group:
*   **Lectures:** `Lecture_06_REST_APIs_Auth.pdf`
*   **Tutorials:** `Tutorial 06 _ REST APIs - Authentication and Authorization - Guide File.pdf`, `Tutorial_06_v2.pdf`

### 1. Lecture Summary: Auth & Auth
*   **Authentication vs. Authorization:**
    *   *Authentication:* "Who are you?" Proving your identity (e.g., entering a username and password).
    *   *Authorization:* "What are you allowed to do?" Determining access rights (e.g., Admins can delete, Users can only read).
*   **Methods of API Security:**
    *   *HTTP Basic Auth:* The client sends `username:password` encoded in Base64 in the HTTP header. It is incredibly lightweight but highly insecure unless forced over HTTPS.
    *   *API Keys:* A unique generated string passed in the header or URL. Simple, but keys usually never expire, causing massive risk if stolen. It is a method of authentication, not authorization.
    *   *JSON Web Tokens (JWT):* The modern standard for stateless APIs. A compact, self-contained JSON object consisting of a Header, Payload, and Signature. The server digitally signs it using a secret key. *Crucial note:* JWT payloads are merely Base64 encoded, **not encrypted**. Anyone intercepting the token can read the data inside, so HTTPS is mandatory.
    *   *OAuth 2.0:* Not an authentication protocol, but an **Authorization Framework**. It solves the problem of a user giving a third-party app limited access to their resources *without* handing over their password (e.g., "Sign in with Google"). Features Roles: Resource Owner (user), Client (app), Authorization Server, and Resource Server. Uses "Grant Types" like Authorization Code Flow.
    *   *OpenID Connect (OIDC):* An identity layer built *on top* of OAuth 2.0 to add Authentication capabilities.

### 2. Tutorial 6 Summary: Authentication Deep Dive
*   **Session vs. Token Auth:** The tutorial clarifies that Session-based auth requires the server to store session data in memory, making scaling difficult. Token-based auth (like JWT) stores all data within the token itself, making the API stateless, highly scalable, and perfectly aligned with REST principles.
*   **JWT vs. API Keys:** JWTs contain structured payloads (claims) and support cryptographic signatures for verification. API Keys are just dumb strings.
*   **Enterprise Viability of JWT:** While JWT is great, the tutorial notes that for massive enterprise applications requiring fine-grained access control, pure JWT isn't enough. It should be combined with OAuth 2.0 frameworks.
*   **OAuth Misconceptions:** Reaffirms that OAuth 2.0 is an authorization framework, offloading the login process to a provider. To handle identity/authentication alongside it, OpenID Connect must be utilized.

---

# MODULE 6: Frontend Development (React & JavaScript)
The final module shifts focus entirely to the client side, showing how the data provided by the Backend APIs is rendered and manipulated for the end user.

### Files Included in this Group:
*   **Lectures:** `Lecture 07 _ Frontend development overview File.pdf`
*   **Tutorials:** `Tutorial 07 _ Frontend development File.pdf`
*   **Labs:** `Practical 06 _ Javascript Basics File.pdf`

### 1. Lecture Summary: Frontend Development Overview
*   **The Trifecta:** HTML (Structure), CSS (Style), JavaScript (Dynamic interactivity).
*   **The DOM:** The Document Object Model is an object-oriented, tree-like representation of the HTML structure provided by the browser as a Web API. JS is used to manipulate it.
*   **React JS:** Created by Facebook. It serves as the "View" in MVC.
    *   *Key Features:* Uses **One-Way Data Flow** (parent to child). Uses a **Virtual DOM** (React calculates UI changes in memory and only updates the specific changed nodes in the real DOM, saving massive processing costs). Uses **JSX** (writing HTML directly inside JavaScript, which also prevents XSS injection attacks).
    *   *Components:* UIs are built by composing small, reusable, nestable building blocks called components.
*   **State Management:** "State" is the data that changes over time in an app.
    *   *Props vs. State:* Props pass data down. State is managed *inside* the component.
    *   *State rules:* Avoid redundant state, avoid duplicated state, group related state.
    *   *Lifting State Up:* If two sibling components need the same state, you move the state up to their closest common parent and pass it down via props.
    *   *Hooks:* `useState` (manage local state), `useEffect` (side effects like API calls), `useReducer` (complex state logic outside the component), `useContext` (bypassing prop-drilling).
    *   *Redux:* For massive applications, lifting state up becomes a nightmare ("prop drilling"). Redux provides a single, centralized global store. It strictly enforces a one-way flow: View triggers an Action -> Action updates the Store -> Store updates the View.
*   **Bundling & Build Tools:** Tools like **Webpack**, **Parcel**, and **Vite** combine multiple JS/CSS files into optimized bundles, perform minification, and "tree-shaking" (removing unused code) to speed up loading.
*   **Web Security:** The lecture highlights the **OWASP Top 10** (Broken Access Control, Injection, CSRF, etc.) and emphasizes using HTTP Security Headers to fortify frontend apps.

### 2. Lab Summary: JavaScript Basics (Practical 6)
Before jumping into React, students must grasp modern ES6 JavaScript.
*   **Objects:** Creating standalone entities with properties and methods (e.g., an `Animal` object with a `displayType` function using the `this` keyword).
*   **Closures:** Functions that have access to the outer (enclosing) function's variables—even after the outer function has returned.
*   **Fetch API & Asynchronous JS:** Students consume a fake API (JSON Placeholder). They practice using `Callbacks`, writing `Promises` (using `.then()` and `.catch()`), and ultimately writing modern `async/await` blocks with `try/catch` error handling to fetch network data without freezing the browser.
*   **ES6 Features:** 
    *   *Classes & Inheritance:* Writing `class Car` with a `constructor`, and using `extends` and `super()` to create a derived `Model` class.
    *   *Variables:* Understanding the scoping differences between `var`, `let`, and `const`.
    *   *Array Methods:* Using `.map()` to iterate over arrays and transform data.
    *   *Destructuring:* Extracting values from arrays or deeply nested objects directly into variables using curly braces.

### 3. Tutorial 7 Summary: React State Management
This tutorial is essentially a heavy coding guide that walks students from basic React hooks up to enterprise Redux state management.
*   **Basic Hooks:** Writing components that use `useState` to build increment/decrement counters, handle text inputs (`onChange`), and use `setTimeout` for delayed state changes.
*   **Fetching Data:** Building a component that uses `useEffect` and `async/await` to fetch user data from a REST API, managing a `loading` boolean state while the data is in transit.
*   **Prop Drilling:** The tutorial shows an example where a `CounterApp` parent passes state to a `MyChildCountContainer`, which then maps and passes it down again to `MyChildCount1` components, demonstrating how cumbersome passing props can become.
*   **useReducer:** Introduces an `initialState` object and a `reducer(state, action)` function with a `switch` statement catching "increment" and "decrement" actions, replacing multiple `useState` calls.
*   **Redux Toolkit:** The ultimate solution. 
    1.  Students install `@reduxjs/toolkit` and `react-redux`.
    2.  They create a `store.js` using `configureStore`.
    3.  They create a `CounterSlice.js` using `createSlice`, defining the initial state and mutating reducers (noting that Redux Toolkit uses "Immer" under the hood to safely allow mutable-looking code).
    4.  They use the `useSelector` hook in the UI to read from the global store, and `useDispatch` to send actions to the reducers.
    5.  Finally, they wrap the entire React application tree in a `<Provider store={store}>` inside `main.jsx` so the global state is available everywhere.
