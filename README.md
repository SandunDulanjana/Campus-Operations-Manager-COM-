<div align="center">

# 🏫 Smart Campus Operations Manager (COM)

**A full-stack campus maintenance and operations management platform that streamlines ticket handling, user administration, resource booking, and real-time notifications across university facilities.**

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---


## ✨ Features

### 🔐 Authentication & Security
- Credential-based login (University ID + Password)
- Google OAuth 2.0 integration with auto-registration flow
- JWT-based stateless authentication with token expiry
- Two-Factor Authentication (TOTP authenticator app + SMS OTP)
- Password reset via email with keyword-based verification
- Role-based access control (RBAC) with Spring Security

### 👥 User Management
- Admin invite-based user creation with email & secure invite link (24h expiry)
- Google OAuth self-registration → admin approval workflow
- Role assignment & modification (6 roles)
- User deactivation (soft delete) and permanent deletion
- Registration request approval/rejection with notifications
- Profile management with photo upload

### 🎫 Ticket Management
- Create, view, assign, resolve, reject, and close maintenance tickets
- 8 ticket categories (Electrical, Plumbing, IT Equipment, HVAC, etc.)
- 4 priority levels (Low, Medium, High, Critical)
- Ticket lifecycle: OPEN → IN_PROGRESS → RESOLVED → CLOSED / REJECTED
- SLA breach tracking
- File attachments & comment threads per ticket
- Technician assignment with email notification

### 🔔 Notification System
- In-app bell notifications with unread count badge
- Admin broadcast notifications with audience targeting (by role)
- Draft/publish workflow for notifications
- Mark as read (single & bulk)
- Automated notifications for registration approvals, rejections, and ticket assignments
- Email notifications via Gmail SMTP

### 📅 Resource & Booking Management
- Campus resource CRUD (rooms, equipment, facilities)
- Booking requests with admin approval workflow
- CSV resource import/export
- Schedule conflict detection

### 📊 Analytics & Reporting
- Technician ticket analysis with charts (Recharts)
- SLA compliance metrics
- Ticket status distribution

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 21 | Programming language |
| **Spring Boot** | 4.0.4 | Application framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | — | ORM / database access |
| **Hibernate** | — | JPA implementation |
| **PostgreSQL** (Neon) | 16 | Cloud relational database |
| **JWT (jjwt)** | 0.12.6 | Token-based authentication |
| **Lombok** | — | Boilerplate reduction |
| **Jakarta Validation** | — | Bean validation (`@NotBlank`, `@Email`) |
| **Spring Mail** | — | SMTP email notifications |
| **TOTP (totp-spring)** | 1.7.1 | Authenticator app 2FA |
| **ZXing** | 3.5.3 | QR code generation |
| **Maven** | 3.9+ | Build & dependency management |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2 | UI library |
| **Vite** | 8.0 | Build tool & dev server |
| **React Router DOM** | 7.13 | Client-side routing |
| **Axios** | 1.13 | HTTP client for API calls |
| **Recharts** | 3.8 | Data visualization charts |
| **Lucide React** | — | Icon library |
| **Shadcn/UI** | — | UI component library |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Neon DB** | Serverless PostgreSQL (cloud-hosted) |
| **Gmail SMTP** | Email delivery for notifications |
| **Google OAuth 2.0** | Social login integration |

---

## 📋 Prerequisites

Make sure you have the following installed before running the project:

| Requirement | Version | Download |
|------------|---------|----------|
| **Java JDK** | 21+ | [Download](https://adoptium.net/) |
| **Node.js** | 18+ | [Download](https://nodejs.org/) |
| **Maven** | 3.9+ | [Download](https://maven.apache.org/) |
| **Git** | Latest | [Download](https://git-scm.com/) |

You will also need:
- A **Neon DB** account → [neon.tech](https://neon.tech) (free tier available)
- A **Google Cloud Console** project with OAuth 2.0 credentials → [console.cloud.google.com](https://console.cloud.google.com)
- A **Gmail account** with App Password for SMTP (or any SMTP provider)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/SandunDulanjana/Campus-Operations-Manager-COM-.git
cd Campus-Operations-Manager-COM-
```

### 2. Backend Setup

#### 2.1 Create the `.env` file

Create a `.env` file inside the `backend/` directory:

```bash
cd backend
```

Create `backend/.env` with:

```env
# ── Database (Neon PostgreSQL) ─────────────────────────────────
DB_URL=jdbc:postgresql://ep-XXXXX.ap-southeast-1.aws.neon.tech/your_db_name?sslmode=require
DB_USERNAME=your_neon_username
DB_PASSWORD=your_neon_password

# ── JWT ────────────────────────────────────────────────────────
JWT_SECRET=your-256-bit-secret-key-at-least-32-characters-long
JWT_EXPIRATION=86400000

# ── Google OAuth 2.0 ──────────────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ── Frontend URL ──────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173

# ── Email (Gmail SMTP) ────────────────────────────────────────
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

#### 2.2 Build & Run the Backend

```bash
# From the backend/ directory
mvn clean install -DskipTests
mvn spring-boot:run
```

The backend will start on **http://localhost:8081**

### 3. Frontend Setup

```bash
# From the project root, go to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

### 4. Access the Application

Open your browser and go to: **http://localhost:5173**

> **First-time setup:** You'll need to manually create an admin user in the database, or use Google OAuth to register and then promote the user to ADMIN via a direct SQL update.

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | ✅ | JDBC connection URL for Neon PostgreSQL |
| `DB_USERNAME` | ✅ | Database username |
| `DB_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens (min 32 characters) |
| `JWT_EXPIRATION` | ✅ | Token expiry in milliseconds (86400000 = 24 hours) |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth 2.0 client secret |
| `FRONTEND_URL` | ❌ | Frontend URL for redirects (default: `http://localhost:5173`) |
| `MAIL_USERNAME` | ✅ | Gmail address for SMTP |
| `MAIL_PASSWORD` | ✅ | Gmail App Password (not your regular password) |

> ⚠️ **Never commit `.env` files to Git.** The `.gitignore` is already configured to exclude them.

---

## 📡 API Documentation

The backend exposes RESTful APIs organized by module:

| Module | Base URL | Auth |
|--------|----------|------|
| **Authentication** | `/api/auth/*` | Public (login, register, reset) |
| **Users** | `/api/users/*` | Admin only |
| **Notifications** | `/api/notifications/*` | Mixed (user + admin) |
| **Tickets** | `/api/v1/tickets/*` | Authenticated |
| **Resources** | `/api/resources/*` | Mixed (public read, admin write) |
| **Bookings** | `/api/bookings/*` | Authenticated |
| **Profile** | `/api/profile/*` | Authenticated |
| **Two-Factor Auth** | `/api/2fa/*` | Authenticated |

### Key Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with University ID + password |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/forgot-password` | Request password reset keyword |
| POST | `/api/auth/reset-password` | Reset password with keyword |
| GET | `/api/auth/invite/validate` | Validate an invite token |
| POST | `/api/auth/invite/complete` | Complete invite setup |
| POST | `/api/auth/submit-university-id` | Submit University ID (Google OAuth flow) |

</details>

<details>
<summary><b>👥 User Management (Admin)</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create & invite a new user |
| PUT | `/api/users/{id}/role` | Update user role |
| DELETE | `/api/users/{id}` | Soft-delete (deactivate) user |
| DELETE | `/api/users/{id}/permanent` | Permanently delete user |
| GET | `/api/users/registration-requests` | List pending registrations |
| POST | `/api/users/{id}/approve` | Approve registration |
| POST | `/api/users/{id}/reject` | Reject registration |

</details>

<details>
<summary><b>🔔 Notifications</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get my notifications |
| GET | `/api/notifications/unread-count` | Get unread badge count |
| PATCH | `/api/notifications/{id}/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/notifications` | Create broadcast (admin) |
| GET | `/api/notifications/admin/all` | List all (admin) |
| PATCH | `/api/notifications/{id}/toggle-published` | Toggle draft/live (admin) |
| DELETE | `/api/notifications/{id}` | Delete notification (admin) |

</details>

<details>
<summary><b>🎫 Ticket Management</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tickets` | Create a ticket |
| GET | `/api/v1/tickets` | Get all tickets (optional `?status=OPEN`) |
| GET | `/api/v1/tickets/my` | Get my tickets |
| GET | `/api/v1/tickets/assigned` | Get assigned tickets (technician) |
| GET | `/api/v1/tickets/{id}` | Get single ticket |
| PATCH | `/api/v1/tickets/{id}/status` | Update ticket status |
| DELETE | `/api/v1/tickets/{id}` | Delete ticket (admin) |

</details>

---

## 📂 Project Structure

```
Campus-Operations-Manager-COM-/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/.../backend/
│   │   ├── auth/                     # 🔐 Authentication & user management
│   │   │   ├── controller/           #    AuthController, UserController, ProfileController
│   │   │   ├── dto/                  #    Request/Response DTOs
│   │   │   ├── model/                #    User entity (JPA)
│   │   │   ├── repository/           #    UserRepository (Spring Data)
│   │   │   └── service/              #    UserService, TwoFactorService
│   │   ├── notification/             # 🔔 Notification system
│   │   │   ├── controller/           #    NotificationController
│   │   │   ├── dto/                  #    CreateNotificationRequest, NotificationDTO
│   │   │   ├── model/                #    AppNotification entity
│   │   │   ├── repository/           #    NotificationRepository
│   │   │   └── service/              #    NotificationService, EmailNotificationService
│   │   ├── ticket/                   # 🎫 Ticket management
│   │   │   ├── controller/           #    TicketController, CommentController
│   │   │   ├── dto/                  #    CreateTicketRequest, TicketResponse
│   │   │   ├── model/                #    Ticket, TicketStatus, TicketCategory
│   │   │   ├── repository/           #    TicketRepository
│   │   │   └── service/              #    TicketService
│   │   ├── booking/                  # 📅 Resource booking
│   │   ├── resource/                 # 🏗️ Campus resources
│   │   ├── security/                 # 🛡️ JWT filter, OAuth2 handler
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── OAuth2AuthenticationSuccessHandler.java
│   │   └── SecurityConfig.java       #    CORS, URL authorization rules
│   ├── src/main/resources/
│   │   └── application.properties    #    App config (reads from .env)
│   ├── .env                          #    🔒 Environment variables (not in Git)
│   └── pom.xml                       #    Maven dependencies
│
├── frontend/                         # React + Vite frontend
│   ├── src/
│   │   ├── admin/                    # 👑 Admin dashboard & pages
│   │   │   ├── AdminLayout.jsx       #    Sidebar + header layout
│   │   │   ├── AdminDashboardHome.jsx
│   │   │   ├── AdminUsersPage.jsx    #    User management UI
│   │   │   ├── AdminTicketsPage.jsx
│   │   │   ├── AdminNotificationsPage.jsx
│   │   │   └── AdminResourcesPage.jsx
│   │   ├── technician/               # 🔧 Technician dashboard
│   │   │   ├── TechnicianLayout.jsx
│   │   │   ├── TechnicianDashboardHome.jsx
│   │   │   └── TechnicianTicketAnalysis.jsx
│   │   ├── auth/                     # 🔐 Login, OAuth, password reset pages
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OAuthCallback.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── SetupAccountPage.jsx
│   │   ├── api/                      # 📡 Axios API service files
│   │   │   ├── authApi.js
│   │   │   ├── adminApi.js
│   │   │   ├── notificationApi.js
│   │   │   └── ticketApi.js
│   │   ├── context/                  # 🌐 React Context (AuthContext)
│   │   ├── components/               # 🧩 Shared UI components
│   │   ├── ticket/                   # 🎫 Ticket pages
│   │   ├── booking/                  # 📅 Booking pages
│   │   ├── profile/                  # 👤 User profile page
│   │   ├── App.jsx                   #    Root component & router
│   │   └── main.jsx                  #    Entry point
│   ├── package.json
│   └── vite.config.js
│
└── docs/                             # 📄 Documentation & screenshots
```

---

## 👤 User Roles

The system supports **6 user roles**, each with specific permissions:

| Role | Code | Permissions |
|------|------|------------|
| 🧑‍🎓 **User** | `USER` | Submit tickets, view own bookings, receive notifications, manage profile |
| 🔧 **Technician** | `TECHNICIAN` | View assigned tickets, update ticket status (in-progress/resolved), ticket analysis dashboard |
| 📅 **Booking Manager** | `BOOKINGMNG` | Approve/reject booking requests, manage schedules |
| 🏗️ **Resource Manager** | `RECOURSEMNG` | Add/edit/delete campus resources (rooms, equipment) |
| 🛠️ **Maintenance Manager** | `MAINTENANCEMNG` | Oversee maintenance operations, assign technicians |
| 👑 **Admin** | `ADMIN` | Full access — manage users, approve registrations, create notifications, manage all tickets, resources, and bookings |

### Role Hierarchy

```
ADMIN (full access)
  ├── MAINTENANCEMNG (maintenance oversight)
  ├── RECOURSEMNG (resource management)
  ├── BOOKINGMNG (booking approvals)
  ├── TECHNICIAN (ticket assignments)
  └── USER (basic access)
```

---

## 🔄 Authentication Flow

### Credential Login
```
User enters University ID + Password
  → POST /api/auth/login
  → Server validates credentials (BCrypt hash comparison)
  → If 2FA enabled → return temp token → verify 2FA code
  → Generate JWT token (userId, email, role, 24h expiry)
  → Frontend stores token → attached to all future requests
```

### Google OAuth Login
```
User clicks "Continue with Google"
  → Redirects to Google consent screen
  → Google redirects back with auth code
  → Spring exchanges code for user profile
  → If new user → registration flow (needs admin approval)
  → If existing + approved → generate JWT → redirect to dashboard
```

---

## 🧪 Testing with Postman

A comprehensive Postman testing guide is available covering all 28 API endpoints across 4 modules.

### Quick Start
1. **Login first:** `POST http://localhost:8081/api/auth/login`
2. **Copy the JWT token** from the response
3. **Add header** to all requests: `Authorization: Bearer <your-token>`

### Tested Modules
- ✅ Authentication (login, forgot password, reset password)
- ✅ User Management (CRUD, role updates, registration approval)
- ✅ Notifications (broadcast, read, delete, toggle)
- ✅ Ticket Management (create, assign, resolve, delete)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project was developed as an academic assessment for campus operations management.

---

<div align="center">

**Built with ❤️ using Spring Boot & React**

[⬆ Back to Top](#-smart-campus-operations-manager-com)

</div>
