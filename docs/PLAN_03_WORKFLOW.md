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
