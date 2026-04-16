# IT3030 PAF Assignment — Module A and B Design

## Purpose

This document defines implementation-ready design decisions for:

- Module A — Facilities and Assets Catalogue
- Module B — Booking Management

The goal is to keep implementation consistent with the assignment brief, marking rubric, and lecture concepts.

## Module A — Facilities and Assets Catalogue

### A1. Resource Entity (Draft)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Long | Yes | Primary key |
| `name` | String | Yes | Resource display name |
| `type` | Enum | Yes | `LECTURE_HALL`, `LAB`, `MEETING_ROOM`, `EQUIPMENT` |
| `capacity` | Integer | Yes | Must be >= 1 |
| `location` | String | Yes | Building/room/location text |
| `status` | Enum | Yes | `ACTIVE`, `OUT_OF_SERVICE` |
| `availabilityStart` | LocalTime | No | Optional availability window |
| `availabilityEnd` | LocalTime | No | Optional availability window |
| `createdAt` | Instant | Yes | Audit field |
| `updatedAt` | Instant | Yes | Audit field |

### A2. Validation Rules (Draft)

- `name` must not be blank
- `capacity` must be positive
- `availabilityStart` must be before `availabilityEnd` (if both exist)
- `availabilityStart` and `availabilityEnd` must be provided together
- `status` defaults to `ACTIVE`
- `EQUIPMENT` may omit `capacity`, but if provided it must still be positive

### A3. Module A Endpoints (Draft)

| Endpoint | Method | Purpose | Success Code |
|---|---|---|---|
| `/api/resources` | GET | List resources (with optional filters) | 200 |
| `/api/resources/{id}` | GET | Get one resource by id | 200 |
| `/api/resources` | POST | Create resource | 201 |
| `/api/resources/{id}` | PUT | Replace/update resource | 200 |
| `/api/resources/{id}` | DELETE | Remove resource | 204 |

### A4. Search and Filter Contract (Draft)

- `type`
- `minCapacity`
- `location`
- `status`

Example: `/api/resources?type=LAB&minCapacity=40&location=A-Block&status=ACTIVE`

## Module B — Booking Management

### B1. Booking Entity (Draft)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | Long | Yes | Primary key |
| `resourceId` | Long | Yes | Foreign key to Resource |
| `userId` | Long | Yes | Booking owner |
| `date` | LocalDate | Yes | Booking date |
| `startTime` | LocalTime | Yes | Start time |
| `endTime` | LocalTime | Yes | End time |
| `purpose` | String | Yes | Why booking is requested |
| `expectedAttendees` | Integer | No | Optional for equipment |
| `status` | Enum | Yes | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `reviewReason` | String | No | Required for reject/cancel review note |
| `createdAt` | Instant | Yes | Audit field |
| `updatedAt` | Instant | Yes | Audit field |

### B2. Booking Workflow (Draft)

```text
PENDING -> APPROVED
PENDING -> REJECTED
APPROVED -> CANCELLED
```

### B3. Validation Rules (Draft)

- `startTime` must be before `endTime`
- booking cannot be created for `OUT_OF_SERVICE` resource
- booking cannot overlap approved booking of same resource/date/time range
- `purpose` must not be blank

### B4. Module B Endpoints (Draft)

| Endpoint | Method | Purpose | Success Code |
|---|---|---|---|
| `/api/bookings` | POST | Create booking request | 201 |
| `/api/bookings/{id}` | GET | Get one booking | 200 |
| `/api/bookings/me` | GET | Get current user's bookings | 200 |
| `/api/bookings` | GET | Admin list with filters | 200 |
| `/api/bookings/{id}` | PATCH | Update booking state (e.g., approve, reject with `reviewReason`, or cancel) | 200 |

## A-B Integration Contract

### Shared Agreements

| Area | Agreement |
|---|---|
| Identifier | Booking stores `resourceId` |
| Resource status | Only `ACTIVE` resources can be booked |
| Capacity rule | `expectedAttendees` should not exceed `capacity` where applicable |
| Conflict check | Same resource + overlapping time on same date is invalid |
| Error handling | Use meaningful 4xx responses for validation/business-rule failures |

### Edge Cases to Handle

- resource deleted after bookings exist (current implementation uses hard delete; booking-side handling still needs review)
- resource switched to `OUT_OF_SERVICE` while future bookings exist
- concurrent booking attempts for same resource/time window

## Viva Defense Hooks (A/B)

Use these prompts while implementing endpoints:

- Why this HTTP method?
- Why this status code?
- Why this validation rule?
- Why this state transition?
- Which lecture concept supports this design?

## Open Decisions

- Whether resource deletion should stay hard-delete or move to block/soft-delete once auth and broader module integration are complete
- Whether booking history is immutable after terminal state
- Whether `availabilityStart/End` is daily or per-date
- Exact role permissions for booking approval/rejection/cancellation
