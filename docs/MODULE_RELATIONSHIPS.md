# IT3030 PAF Assignment — Module Relationship Matrix

## Purpose

This file captures cross-module dependency strength and shared agreements needed before implementation.

Modules:

- A: Facilities and Assets Catalogue
- B: Booking Management
- C: Maintenance and Incident Ticketing
- D: Notifications
- E: Authentication and Authorization

## Relationship Matrix

| Pair | Strength | Shared Contract Needed | Key Agreement Focus |
|---|---|---|---|
| A-B | Very High | Yes | `resourceId`, availability, conflict checks |
| A-C | High | Yes | ticket target resource, status impact |
| A-D | Low-Medium | Optional | indirect resource-related notifications |
| A-E | Medium | Yes | role-based resource management permissions |
| B-C | Medium-High | Yes | maintenance status affecting bookings |
| B-D | High | Yes | booking state change notifications |
| B-E | High | Yes | create/view/approve permissions by role |
| C-D | High | Yes | ticket update and comment notifications |
| C-E | High | Yes | ticket/comment ownership and role checks |
| D-E | Medium-High | Yes | notification recipient identity and access |

## Priority Integration Order

1. A-B
2. A-C
3. B-E
4. C-E
5. B-D
6. C-D
7. B-C
8. A-E
9. D-E
10. A-D

## Contract Checklist Template

Use this template for each high-strength relationship:

| Item | Notes |
|---|---|
| Shared identifiers | |
| Shared fields | |
| Business rules | |
| State dependencies | |
| API expectations | |
| Role/access rules | |
| Event/notification triggers | |
| Open questions | |

## Immediate Focus

Before implementation starts, finalize contracts for:

- A-B
- A-C
- B-E
- C-E
- B-D
- C-D
