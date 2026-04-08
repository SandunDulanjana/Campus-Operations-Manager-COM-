# IT3030 PAF Assignment — Workflow

## Git Workflow

The project will use a simple branch-based Git workflow.

The `developer` branch will act as the main working branch for the team. Each
piece of work will be done in a separate feature branch, then checked and merged
back into `developer` through a pull request.

This keeps the shared branch stable while work is happening. It also makes it
easier to review changes, fix mistakes before they spread, and keep a clear
history of who changed what.

Each commit should do one clear thing. Commit messages should be short,
specific, and easy to understand later.

The workflow must stay simple enough for the team to follow every time.

## Git Workflow Details

The project will use a simple branch-based workflow.

The `developer` branch will be the shared working branch. Each piece of work
will happen in a separate feature branch and then come back into `developer`
through a pull request.

This keeps the shared branch stable while work is happening. It also makes it
easier to review changes, catch mistakes early, and keep a clear history of
what changed.

Each branch should focus on one task only. Branches should be short-lived and
deleted after the work is merged.

Commit messages should be short and clear. Each commit should do one thing only.
Small commits are easier to understand, review, and fix later.

Feature branch names should be simple and readable, such as:

  - `feature/sasindu/resources`
  - `feature/sithmini/bookings`
  - `feature/lihini/tickets`
  - `feature/sandun/auth`

This workflow is simpler than GitFlow and fits the size of this project better.

## Git Rules To Follow

The following rules keep the repository easier to manage:

  - create one branch for one feature only
  - keep branches short-lived
  - do not work directly on the shared branch
  - pull the latest changes before starting new work
  - push changes often so work is not lost
  - use atomic commits so each commit has one clear purpose
  - delete branches after they are merged

Pull requests will be used to review work before it is merged back into
`developer`. A pull request should show exactly what changed and why.

If a conflict appears, it should be fixed while the branch is still small,
before the work becomes harder to merge.

Branch names should stay readable and consistent. A name should make it obvious
what the branch is for.

---

## Viva Defense

This section explains why we made each workflow decision, connected to course materials.

### Why Feature Branches and Pull Requests

**Lecture Reference:** Lecture 03 — Git Workflows, Tutorial 03 — Git Concepts and Strategies

We use feature branches and Pull Requests because the lecture materials teach branching as a way to isolate work from the main path of development. A branch is a detour from the shared codebase, which allows one piece of work to move forward without immediately affecting other work.

#### How This Applies to Our Project

In our project, each major task is expected to happen in its own feature branch and then come back into the shared branch through a Pull Request.

```
developer ──────●──────────────●────────────── shared working branch
                 \
feature/...       ●────●────●                 isolated work
                              \
                               PR ──▶ review ──▶ merge back
```

This matches what was taught in Lecture 03:
- branching isolates work
- Pull Requests are used to propose changes
- review happens before merging
- completed branches should be short-lived and removed after merge

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Isolation of work** | One person can work on a feature without immediately affecting the shared branch |
| **Safer collaboration** | Changes are reviewed before being merged into the team branch |
| **Clear history** | The repository shows what changed, why it changed, and through which PR it entered the codebase |
| **Conflict reduction** | Short-lived feature branches reduce the chance of large merge conflicts |
| **Better individual visibility** | Since the assignment is individually assessed, feature branches and PRs help show each member's contribution clearly |

#### Why Not Other Approaches?

| Approach | Why We Did Not Use It |
|---|---|
| **Direct work on shared branch** | Risks breaking the branch for everyone and removes the review step |
| **Working only locally** | Prevents regular collaboration and removes the remote repository as the teams shared source of truth |
| **GitFlow** | The lecture materials describe GitFlow as comprehensive but potentially overkill for small projects like this one |

**Conclusion:** Feature branches and Pull Requests are the best fit for this project because they follow the branching practices taught in the course, support safer collaboration, and make each members contribution easier to review and explain during viva.

### Why `developer` as the Shared Working Branch

**Lecture Reference:** Lecture 03 — Keeping the Main Branch Clean

The lecture materials emphasize that the main branch should only contain production-ready code. To follow this principle while still collaborating as a team, we use a `developer` branch as our shared working branch.

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Keeps main clean** | Main stays as the stable, production-ready reference at all times |
| **Team integration space** | Developer allows multiple members features to be merged and tested together before touching main |
| **Clear separation** | Main is for the final submission-ready state, developer is for active team integration |
| **Submission readiness** | Main can always be zipped and submitted without worrying about broken in-progress features |

#### Why We Use `developer` Instead of Main Directly

| Approach | Why We Did Not Use It |
|---|---|
| **All work on main** | Tutorial 03 warns this causes instability and loses the clean production-ready state |
| **No shared branch at all** | Would require constant coordination to avoid conflicts, impractical for 4-person team |

**Conclusion:** Using `developer` as the shared working branch follows the principle of keeping main stable and production-ready, while giving the team a proper space to integrate and test work together.

### Why Atomic Commits

**Lecture Reference:** Lecture 03 — Git General Best Practices

The lecture materials teach that commits should be atomic. Each commit should do one clear thing and be focused on one part of a feature. This minimizes damage if we ever need to revert a specific change.

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Easy to revert** | If a specific change breaks something, we can undo only that commit without touching unrelated work |
| **Easier code review** | Reviewers can understand exactly what changed and why in each commit |
| **Clearer history** | The git log tells the story of how the feature was built, step by step |
| **Better for viva** | During viva, we can point to specific commits and explain exactly what each one does |

#### Atomic Commits in Practice

```
Good commits:
- "add Resource entity with name, type, capacity fields"
- "add GET /api/resources endpoint"
- "add search filter by type and location"

Bad commits:
- "added stuff"           ← unclear
- "fix bug and also added feature X" ← two things in one commit
```

**Conclusion:** Atomic commits are a best practice from the course materials that make our project history clean, reviewable, and easier to defend during viva.

### Why GitHub Actions and CI

**Lecture Reference:** Module 02 Summary — DevOps Principles (Shift Left, CI/CD), Lecture 03 — Additional Topics

We implemented a GitHub Actions workflow to follow the DevOps principle of Shift Left. This means running build and test checks as early as possible in the development process, rather than at the end.

#### How Our CI Works

```
Push to developer ──▶ GitHub Actions ──▶ Build + Test ──▶ Pass/Fail Report
     or                (automated)         (mvn clean test)
Push to main
```

#### Why This Matters for Our Project

| Benefit | How It Applies |
|---|---|
| **Immediate feedback** | Every push automatically checks if the code builds and tests pass |
| **Prevents broken code** | If a change breaks something, CI catches it before it spreads to the whole team |
| **Shift Left** | Bugs and build failures are caught at the point of commit, not during submission |
| **Viva evidence** | A working CI pipeline demonstrates DevOps awareness and best practice application |

#### Why Not Other Approaches?

| Approach | Why We Did Not Use It |
|---|---|
| **Manual build and test** | Relies on each developer remembering to run tests, error-prone and inconsistent |
| **No CI at all** | Would mean no automated quality gate, increasing risk of submission-day failures |

**Conclusion:** GitHub Actions CI follows the DevOps concepts taught in the course materials and provides an automated quality gate that catches issues early, keeps the codebase healthy, and demonstrates best practice application during viva.
