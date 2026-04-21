# IT3030 PAF Assignment — Requirements

## Source Documents

This file uses the official assignment brief and the marking rubric.

  - Assignment Brief:  [PAF_Assignment-2026.pdf](Assignment/PAF_Assignment-2026.pdf)
  - Marking Rubric:    [IT3030_PAF_2026_Marking_Rubric.pdf](Assignment/IT3030_PAF_2026_Marking_Rubric.pdf)

## What This Project Is About

We are building a website for a university. This website has two main jobs.

  Job number one: People at the university can book rooms, labs, and equipment.
  For example, a teacher can book a lecture hall for a class.

  Job number two: People at the university can report problems. For example, 
  someone can say "the projector in room 302 is not working." Then a technician 
  comes and fixes it.

  There are different types of users. Normal users can make bookings and report 
  problems. Managers can say yes or no to a booking. Technicians can mark 
  problems as fixed. Admins can do everything.

  This is called the Smart Campus Operations Hub.

## Team Members and Roles

We agreed on these roles in the meeting:

  - sasindu — Member 1 — Module A
  - sithmini — Member 2 — Module B
  - lihini — Member 3 — Module C
  - sandun — Member 4 — Module D and Module E

We will keep this mapping unless the team clearly agrees to change it.

## Module Definitions

  - Module A — Facilities & Assets Catalogue: rooms, labs, equipment, search, filters, status
  - Module B — Booking Management: booking requests, approval or rejection, conflict checks, cancellations
  - Module C — Maintenance & Incident Ticketing: incident tickets, attachments, comments, technician updates
  - Module D — Notifications: booking updates, ticket updates, comment alerts
  - Module E — Authentication & Authorization: login, roles, access control

---

## Viva Defense

This section explains why our requirements are structured this way and how they align with the assignment brief and marking rubric.

### Why These Modules Match the Assignment Brief

**Reference:** Assignment Brief — Core Features and Recommended Work Allocation

The module structure is taken directly from the assignment brief. The brief defines five core feature areas, and our requirement plan maps one-to-one to those areas.

#### Direct Mapping

| Assignment Requirement | Our Module |
|---|---|
| Facilities and assets catalogue | Module A |
| Booking management | Module B |
| Maintenance and incident ticketing | Module C |
| Notifications | Module D |
| Authentication and authorization | Module E |

#### Why This Matters

| Reason | Why It Matters for Viva |
|---|---|
| Requirement alignment | Shows scope is based on official brief, not arbitrary feature picks |
| Clear boundaries | Makes each module easy to explain and defend |
| Assessment clarity | Supports individual contribution visibility during viva |

**Conclusion:** Our module definitions follow the assignment brief directly, so the requirements are defensible and assessable.

### Why This Scope Prioritises Minimum Requirements First

**Reference:** Assignment Brief — "minimum requirements must be fully satisfied first"

We prioritize minimum required functionality before optional innovation. This protects core marks and ensures the system is complete, testable, and demonstrable.

#### Scope Priority Order

```text
1) Minimum required features
2) Integration quality and validation
3) UI/UX quality improvements
4) Optional creativity features
```

#### Why This Matters

| Scope Decision | Reason |
|---|---|
| Core requirements first | Prevents missing mandatory features in final evaluation |
| Integration before extras | Reduces risk of broken workflows between modules |
| Quality gates included | Supports testing, validation, and error-handling marks |

**Conclusion:** This scope order matches the brief and maximizes both delivery reliability and grading outcomes.

### Why Module A and Module B Are Closely Connected

**Reference:** Assignment Brief — Module A and Module B definitions

Booking management depends on resource management. A booking cannot be created, validated, or approved without a valid resource and its metadata.

#### Dependency Flow

```text
Resource created and maintained (Module A)
        ↓
User discovers resource (search/filter)
        ↓
Booking request submitted (Module B)
        ↓
Conflict and workflow checks
```

#### Shared Contract Areas

| Shared Area | Why It Must Be Agreed |
|---|---|
| `resourceId` and metadata | Booking must reference a real, active resource |
| Availability and status | Booking logic must respect ACTIVE / OUT_OF_SERVICE |
| Time-window constraints | Conflict checks require consistent time representation |

**Conclusion:** Module A and B must be designed in coordination because they represent one continuous business workflow.

### Why Clear Contribution Boundaries Matter for Viva

**Reference:** Assignment Brief — Individual assessment and viva readiness

The assignment is group work but assessed individually. Each member must clearly explain their own endpoints, UI components, and design decisions.

#### Evidence Needed Per Member

| Evidence Type | Purpose |
|---|---|
| Feature branch and PR history | Shows ownership and contribution trail |
| Endpoint and UI ownership | Demonstrates independent implementation ability |
| Design justification | Shows understanding, not just coding output |

#### Practical Rule

```text
Shared planning is allowed.
Implementation ownership must remain clear.
Each member must be able to defend their own work in viva.
```

**Conclusion:** Clear boundaries are not optional process overhead; they are necessary for fair individual assessment and viva performance.
