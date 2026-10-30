# Phase 1 report — inspection only

No files were modified in either repo. I did not open `.env`, `.env.local`, or print any secrets.

`docs/taskflow-brief.md` does not exist. I read the handoff at `D:\Saad Projects\taskflow-frontend\TASKFLOW_UI_HANDOFF.md` in full.

## Baseline checks

| Check | Result |
|---|---|
| Backend test suite | **103 tests passed**, 5 suites (`npm test`) |
| Frontend TypeScript | `npx tsc --noEmit` passes |
| Frontend lint | **Broken before any changes** — ESLint 8.57.1 cannot load `eslint.config.mjs` (`eslint/config` is an ESLint 9 API; `eslint-plugin-next` is also not a direct dependency) |
| Backend files changed | None |
| Frontend files changed | None |

---

## 1. Frontend repo state

**Stack installed:** Next.js `15.3.3` (App Router), React `19.3.1`, TypeScript 5 strict, Tailwind CSS `3.4.19`, Radix UI (`dialog`, `select`, `slot`, `toast`), `lucide-react`, `date-fns`, `react-day-picker`, `class-variance-authority`, `@base-ui/react`.

**Existing structure:**

```text
src/
  app/
    layout.tsx          # Inter font, Header, AuthProvider, ToastProvider
    page.tsx            # redirects to /tasks
    login/page.tsx
    register/page.tsx
    projects/page.tsx   # project grid/list + create/edit/delete
    tasks/page.tsx      # list, search, filters, sort, pagination, scope tabs
  components/
    layout/header.tsx   # top nav only, no sidebar
    tasks/task-card.tsx
    tasks/task-form.tsx
    ui/                 # button, input, textarea, select, badge, card,
                        # dialog, calendar, date-picker, pagination,
                        # skeleton, toast, popover, etc.
  hooks/use-toast.ts
  lib/api.ts            # typed fetch layer for all endpoints
  lib/auth.tsx          # auth context, localStorage token
  lib/utils.ts
  types/api.ts          # API types
```

**What already works:** login/register, auth context, projects CRUD, task list with `scope`, search, status/priority filters, sorting, pagination, inline status updates, task create/edit, toasts, skeletons, date picker.

**Important:** the existing UI is **not Concept C**. It uses a blue primary colour, Inter font, and a top header — not the violet `#5B21B6`, Plus Jakarta Sans, 240px sidebar, or the dashboard/calendar/completed/settings screens from the handoff. Phase 2 will be a re-theme/restructure, not a greenfield build.

**Existing issues to fix during implementation (not fixed now):**

- Radix `SelectItem` uses `value=""` in task filters and the task form. Radix Select rejects empty-string item values at runtime.
- The assignee dropdown is literally empty (`projects.flatMap(() => [])`), so assignment cannot be done from the UI.
- Project description validation allows 2000 chars; backend allows **500**.
- Task cards show neither project name nor assignee initials, and have no delete action.
- `localStorage` stores the JWT and user object.
- API base fallback is `http://localhost:3000`, which conflicts with Next.js dev on port 3000.
- Route protection is per-page `useEffect` redirects, not a shared guard/middleware.
- No global 401 handling, no token-expiry handling, no cross-tab logout.
- `formatDate` formats due dates in local time; date-only backend values can shift a day in negative-offset timezones.
- `export const dynamic = "force-dynamic"` appears in client components; it is not a meaningful route-segment config there.
- No dashboard, calendar, completed, or settings route.
- No frontend tests.
- `src/components/ui/popover.tsx` is **untracked user work**; it imports `cn` from the `cn` package instead of `@/lib/utils` and uses Base UI. I left it untouched.

---

## 2. Backend contract — verified

Verified by reading models, routes, controllers, middleware, validators, and by running the 103-test suite.

### Auth

| Method | Path | Auth | Verified behavior |
|---|---|---|---|
| `POST` | `/register` | none | Body: `username` 3–30 chars, letters/numbers/underscore; `email` valid, trimmed/lowercased, max 100; `password` 8–72. Returns **201** `{ message, user: { id, username, email, role } }`. No token. `role` is stripped; new users are always `user`. Duplicate username/email → 400 `{ message }`. |
| `POST` | `/login` | none | Body: `email`, `password` (min 1). Returns **200** `{ message, token }`. Unknown email and wrong password both return **401** with the same message. |
| `GET` | `/profile` | Bearer | Returns **200** `{ message, user: { id, username, role } }` from the token payload. **No email**, no DB lookup. |
| `GET` | `/users` | Bearer + admin | Returns **200** `{ users: [{ _id, username, email, role, createdAt, updatedAt }] }`; password excluded. Non-admin → 403. |

**Token:** JWT, payload `{ id, username, role }`, expires in **1 hour**. No refresh token, no server-side logout. Header format: `Authorization: Bearer <token>`.

### Projects

| Method | Path | Authorization | Response |
|---|---|---|---|
| `POST` | `/projects` | authenticated | **201** `{ message, project }`. `name` required 1–100; `description` optional max **500**. `createdBy` comes from token. |
| `GET` | `/projects` | authenticated | **200** `{ projects: [...] }` — only projects where `createdBy = caller`. No pagination, no sort, no task counts. |
| `GET` | `/projects/:id` | owner **or** assignee of any task in the project | **200** `{ project }`. 404 if unknown, 403 otherwise. |
| `PUT` | `/projects/:id` | owner only | **200** `{ message, project }`. `name`/`description` optional. |
| `DELETE` | `/projects/:id` | owner only | **200** `{ message, project }`. **Cascade-deletes all tasks in the project.** |

**Project fields:** `_id`, `name`, `description` (may be absent), `createdBy` (ObjectId string, not populated), `createdAt`, `updatedAt`, `__v`.

**No project fields exist for:** colour, deadline, status, progress, task count, members. Do not invent them.

### Tasks

| Method | Path | Authorization | Response |
|---|---|---|---|
| `POST` | `/tasks` | owner of the target project | **201** `{ message, task }`. `title` 1–200; `description` optional max 2000; `status` optional; `priority` optional; `dueDate` optional date; `project` required valid ObjectId; `assignedTo` optional valid existing user ID. |
| `GET` | `/tasks` | authenticated | **200** `{ totalTasks, currentPage, totalPages, pageSize, tasks }`. |
| `GET` | `/tasks/:id` | creator **or** assignee | **200** `{ task }`; 403 otherwise; 404 if unknown. |
| `PUT` | `/tasks/:id` | creator **or** assignee | **200** `{ message, task }`. Creator can update `title`, `description`, `status`, `priority`, `dueDate`, `assignedTo` (`null` = unassign). Assignee may update **status only**; if an assignee sends any creator-only field, the whole request is 403 and nothing is applied. `project` cannot be changed (stripped). |
| `DELETE` | `/tasks/:id` | creator only | **200** `{ message, task }`. Assignee gets 403. |

**Task fields:** `_id`, `title`, `description` (may be absent), `status`, `priority`, `dueDate` (may be absent), `project` (ObjectId string), `createdBy` (ObjectId string), `assignedTo` (ObjectId string, may be absent/null), `createdAt`, `updatedAt`, `__v`.

**No `.populate()` anywhere.** `project`, `createdBy`, and `assignedTo` are raw IDs in every task response.

### Enums — verified

| Concept | API values |
|---|---|
| Status | `pending`, `in-progress`, `completed` |
| Priority | `low`, `medium`, `high` |

There is **no `urgent` priority** and no project status.

### `GET /tasks` query parameters — verified

| Parameter | Allowed values | Default | Behavior |
|---|---|---|---|
| `scope` | `created`, `assigned` | `created` | `created` → `createdBy = caller`; `assigned` → `assignedTo = caller`. These are separate sets; a self-assigned task appears in both. There is no union mode. |
| `status` | `pending`, `in-progress`, `completed` | none | Exact match. |
| `priority` | `low`, `medium`, `high` | none | Exact match. |
| `search` | string, max 200 | none | Case-insensitive regex on `title` and `description`; regex characters escaped. Does **not** search project name or assignee. |
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–100 | `10` | |
| `sortBy` | `createdAt`, `updatedAt`, `title`, `dueDate`, `priority` | `createdAt` | `priority` sorts the **string values** alphabetically, not High→Medium→Low. |
| `order` | `asc`, `desc` | `desc` | Sort includes `_id` as a tiebreaker. |

Pagination response: `{ totalTasks, currentPage, totalPages, pageSize, tasks }`. `totalPages` is `0` when there are no tasks.

**Not supported by `GET /tasks`:** project filter, assignedTo filter (other than `scope`), due-date range, overdue filter, multiple statuses, free-text search on project/assignee.

### Authorization matrix — verified

| Action | Creator | Assignee | Unrelated user |
|---|---|---|---|
| List projects | sees own projects | does not see project in list | no |
| Read project | yes | yes, if at least one task in project is assigned to them | 403 |
| Update/delete project | yes | no | 403 |
| Create task in project | yes | no (must own project) | 403 |
| List tasks | `scope=created` | `scope=assigned` | no |
| Read task | yes | yes | 403 |
| Update task | all allowed fields | status only | 403 |
| Delete task | yes | no | 403 |
| `GET /users` | admin only | admin only | 403 |

### Error formats — verified

| Status | Shape |
|---|---|
| 400 validation | `{ success: false, message: "Validation failed", errors: [{ field, message }] }` |
| 400 business (duplicate account, bad JSON) | Mostly `{ message }`; invalid JSON includes `success: false` |
| 401 / 403 / 404 business | `{ message }` |
| 404 unmatched route | `{ success: false, message }` |
| 413 / 500 | `{ success: false, message }` |
| 429 | `{ success: false, message }` |

The frontend error layer must handle both `{ message }` and `{ success: false, message, errors }`.

### Other verified backend behavior

- CORS default origins: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:5173`, `http://127.0.0.1:5173`. Credentials are **off**; auth is Bearer-only.
- API default port is **3000**, same as Next.js dev default.
- Rate limits: 500 requests / 15 min globally; 20 **failed** auth requests / 15 min for `/register` and `/login`.
- Deleting a project cascades to its tasks.
- Search is regex-escaped server-side.
- Unknown body/query fields are stripped; mass assignment is blocked.
- Backend README is stale in two places: it says `GET /tasks` only returns created tasks and mentions 83 tests. The code and tests now support `scope=assigned` and there are 103 tests.

---

## 3. Partial or unclear

1. **Assignee identity is the biggest gap.** `assignedTo` is an ID, and there is no non-admin user lookup. A normal user cannot discover users to assign, and the UI cannot render assignee names or initials. Only an admin can call `GET /users`.
2. **No task counts or dashboard aggregates.** There is no stats endpoint, no per-project counts, and no project filter on `/tasks`. Dashboard/project progress must be derived by fetching all task pages (max 100 per request) and grouping client-side.
3. **No date-range query.** Calendar month/week views require fetching all tasks and filtering client-side.
4. **No settings endpoints.** Only `GET /profile` exists; no profile update, password change, or preferences.
5. **Due date cannot be cleared.** `updateTaskSchema.dueDate` is not nullable. Sending `null` coerces to `1970-01-01T00:00:00Z`; sending `""` fails validation. A “clear due date” UI would be dishonest until the backend supports null/unset.
6. **Priority sorting is lexical.** `sortBy=priority` orders strings (`high`, `low`, `medium`), not High→Medium→Low. Client-side sorting only fixes the current page.
7. **No project colour field.** The handoff’s project colours must be assigned client-side (e.g. hash project ID to the palette) unless you want a persisted backend field.
8. **No project membership/team model.** An assignee can read only tasks assigned to them and the parent project by ID; they cannot see the project’s other tasks. “Team workflow” is therefore limited.
9. **No email in `/profile` or login response.** After a reload, the UI only knows `id`, `username`, `role`. Email is available only from the register response.
10. **Task cannot move between projects.** `project` is stripped on update.
11. **Due date timezone.** `z.coerce.date("2026-11-30")` stores UTC midnight. Formatting in local time will show the previous day for users west of UTC. Need a decision: treat due dates as date-only and format in UTC, or change backend representation.
12. **Frontend types are slightly inaccurate:** `Project.description`, `Task.dueDate`, and `Task.assignedTo` are typed as `... | null`, but Mongoose may omit them entirely; `CreateProjectRequest.description` says max 2000 but backend is 500.
13. **Rate-limit risk:** dashboard/calendar fetching many pages could consume the 500/15min global limit. Aggregate endpoints would avoid this.
14. **`.env.local` exists but was not read.** Please confirm the API base URL/port rather than me printing it.
15. **`GET /projects` ordering is unspecified.** It currently returns natural/insertion order; sort client-side if the sidebar needs alphabetical order.

---

## 4. Handoff features the UI can support today

| Handoff feature | Status | Notes |
|---|---|---|
| Sign in / sign up | **Yes** | Register then login; token lasts 1h |
| Protected routes | **Yes, client-side** | BFF middleware recommended for cleaner protection |
| Sidebar/app shell | **Yes, UI only** | No API dependency |
| Dashboard completion ring | **Yes, derived client-side** | Fetch all task pages; decide scope |
| Dashboard stat cards (To Do / In progress / Overdue) | **Yes, derived** | Overdue = `dueDate < today && status !== completed` |
| Project progress cards (“x of y done”) | **Yes for owned projects** | Group created tasks by `project`; no counts endpoint |
| Today list | **Yes** | Client-side due-date comparison |
| Tasks 3-column board | **Yes** | Group by status or make 3 filtered calls |
| List view toggle + pagination | **Yes** | Pagination is server-side |
| Search / status / priority / sort / reset | **Yes** | Reset is UI-only; priority sort caveat |
| Task card: title, priority, project | **Partial** | Project name requires mapping IDs to `/projects`; N+1 for assigned projects |
| Task card: assignee initials | **Blocked** | No non-admin user lookup |
| Task detail drawer | **Partial** | All task fields available; assignee name unavailable |
| Edit task | **Yes with guards** | Creator all fields; assignee status only |
| Delete task with confirmation | **Yes with guard** | Creator only |
| Assign task | **Blocked for normal users** | No user picker; “assign to me” is possible |
| Projects CRUD with confirmation | **Yes** | Description max 500; delete cascades tasks |
| Project colour header | **Yes, client-side palette** | No persisted colour field |
| Calendar month view | **Yes, derived** | Fetch all tasks; group by due date |
| Calendar week view / Today button | **Yes, derived** | Client-side date math |
| “No due date” panel | **Yes** | Tasks with missing/null `dueDate` |
| Completed page | **Yes** | `GET /tasks?status=completed`; scope decision needed |
| Settings | **Read-only only** | No update/password endpoints |
| Loading / empty / 401 / 403 / validation / server errors | **Yes** | Normalize the two error shapes |

---

## 5. What needs backend confirmation

These are **not implemented** and I will not invent them. Each is a question for you:

1. **Assignee discovery/display.** Recommended: authenticated `GET /users?search=` returning only `_id, username` (no email), or populate `assignedTo` with `{ _id, username }`. Without this, assignee initials and a user picker are impossible for normal users.
2. **Project/task aggregates.** Recommended: include `taskCount` and `completedCount` in `GET /projects`, and/or add `project` and due-date-range filters to `GET /tasks`. Client-side workaround exists but is inefficient.
3. **Clear due date.** Make `dueDate` nullable on update and unset it when `null`. Otherwise I will hide the clear action.
4. **Due-date semantics.** Confirm whether due dates are date-only or timestamps, and whether the UI should format them in UTC.
5. **Priority sort.** Confirm whether `sortBy=priority` should be High→Medium→Low. If yes, backend needs a computed rank or aggregation.
6. **Settings.** Are profile update / password change endpoints planned? If not, Settings will be read-only.
7. **Project colour.** Persist a `color` field, or use a deterministic frontend palette? I recommend frontend-only for now.
8. **Task move between projects.** Not supported. Confirm whether it is needed.
9. **Project membership/team.** Confirm whether assignees should see all tasks in a project, not just their assigned tasks.
10. **Email in profile.** Add `email` to `/profile` if Settings should show it.
11. **Refresh/logout.** No refresh token or logout endpoint. Confirm that re-login after 1h is acceptable.
12. **Rate limits.** Confirm 500/15min is sufficient for dashboard/calendar, or approve aggregate endpoints.

Until you approve backend changes, I will implement client-side workarounds and hide unsupported actions (assignee picker, due-date clear, settings editing).

---

## 6. Suggested setup for your approval

### Stack

Keep the existing **Next.js 15 App Router + TypeScript + Tailwind 3.4**. No need to recreate the app. Refactor the existing shell and API layer rather than starting over.

- **Font:** Plus Jakarta Sans via `next/font/google`, weights 400/500/600/700. Remove Inter.
- **Design tokens:** one clean token layer using Concept C hex values as CSS variables, exposed through Tailwind semantic names. Remove the duplicate legacy HSL variables. Map:
  - Background `#F4F5FB`, surface `#FFFFFF`, border `#DEDFF0`
  - Text `#14122B`, muted `#5A5873`
  - Primary `#5B21B6`; nav active at ~10% opacity
  - Badge colours exactly as in the handoff
  - 12px cards, 99px pills, 18px card padding, 28px page padding, 14–18px gaps, 1px borders, minimal shadows
  - Sidebar 240px, mobile drawer, 44px minimum touch targets
- **Components:** reuse Radix (`dialog`, `select`, `toast`, `slot`); add or build `avatar`, `dropdown-menu`, `tabs`, `progress`, `drawer`, `completion-ring`, `empty-state`, `error-state`. Standardise on Radix rather than mixing Base UI and Radix. The untracked `popover.tsx` needs a decision before I touch it.

### Folder structure

```text
src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (app)/layout.tsx              # sidebar shell + auth guard
    (app)/overview/page.tsx
    (app)/tasks/page.tsx
    (app)/projects/page.tsx
    (app)/calendar/page.tsx
    (app)/completed/page.tsx
    (app)/settings/page.tsx
    api/auth/login/route.ts
    api/auth/logout/route.ts
    api/auth/me/route.ts
    api/proxy/[...path]/route.ts  # or explicit resource handlers
    layout.tsx
    globals.css
  components/
    layout/{sidebar,mobile-drawer,page-header,account-menu}.tsx
    ui/{button,input,textarea,select,badge,avatar,card,dialog,drawer,
        dropdown-menu,tabs,progress,completion-ring,empty-state,
        error-state,skeleton,pagination,toast}.tsx
    tasks/{task-board,task-column,task-card,task-list,
           task-detail-drawer,task-form,task-filters,delete-task-dialog}.tsx
    projects/{project-grid,project-card,project-form,delete-project-dialog}.tsx
    dashboard/{stat-card,completion-ring,project-progress-card,today-list}.tsx
    calendar/{month-view,week-view,task-chip,no-due-date-panel}.tsx
  lib/
    api/{client.ts,errors.ts,endpoints.ts}
    auth/{provider.tsx,use-auth.ts,server.ts}
    dates.ts
    theme.ts
    utils.ts
  hooks/{use-tasks.ts,use-projects.ts,use-toast.ts}
  types/api.ts                    # keep as the single API type source
```

### Token storage — recommendation: BFF with httpOnly cookie

The backend only supports `Authorization: Bearer`, so the frontend cannot make a cookie-based auth flow by itself without a small Next.js server layer. Recommended:

1. `POST /api/auth/login` (Next route handler) calls the backend `/login`.
2. On success, Next sets an **httpOnly**, `SameSite=Lax`, `Secure` (production) cookie containing the JWT, `maxAge` 1h.
3. All browser calls go to same-origin Next routes. Next attaches `Authorization: Bearer <token>` when calling the API.
4. `POST /api/auth/logout` clears the cookie. There is no backend logout, so this is the only logout mechanism.
5. Next middleware redirects unauthenticated users to `/login` and authenticated users away from auth pages. It can check cookie presence; the API remains the source of truth for validity.
6. On any API 401, the route handler clears the cookie and returns 401; the client redirects to `/login`.
7. Add an `Origin` check on mutating route handlers for CSRF defence.

**Why:** the JWT never reaches browser JavaScript, so XSS cannot steal it, and no backend change is required. The cost is one extra hop through the Next server.

Alternatives if you prefer simpler:
- **In-memory + `sessionStorage`:** simplest direct-Bearer approach; token is gone when the tab closes, but still readable by XSS while the tab is open.
- **`localStorage`:** what the existing code does; easiest, least secure. I would not recommend it without your explicit acceptance.

### Ports and environment

- API defaults to **3000**; Next also defaults to **3000**. Run Next on **3001** (`next dev -p 3001`) or set the API `PORT=4000`. CORS already allows `localhost:3001`.
- With the BFF, use a **server-only** `API_BASE_URL=http://localhost:3000`; do not expose it as `NEXT_PUBLIC_*`.
- If we keep direct browser calls, `NEXT_PUBLIC_API_BASE_URL` must point at the API, and the API’s `CLIENT_URLS` must include the frontend origin.
- Please confirm the existing `.env.local` value without printing it.

### Tooling

- Fix ESLint first: either upgrade to ESLint 9 + a proper flat config using `eslint-config-next`, or revert to `.eslintrc.json` with ESLint 8. The current config cannot run.
- Add a `typecheck` script.
- Consider adding `@tanstack/react-query` for caching, deduplication, pagination, and mutation invalidation. It is optional but would simplify dashboard/calendar and prevent duplicate fetches.
- Add Playwright later for the workflow integration tests in the handoff. No frontend test framework exists today.

---

## 7. Decisions I need before Phase 2

1. **Refactor the existing app or rebuild the shell?** I recommend refactoring: keep `lib/api.ts`, `types/api.ts`, auth, projects/tasks logic; replace the header with the sidebar and re-theme everything.
2. **Token storage:** BFF httpOnly cookie (recommended), sessionStorage, or keep localStorage?
3. **Dashboard / My Tasks / Completed scope:** created tasks only, assigned tasks only, or a deduplicated union of both? This affects every aggregate.
4. **Assignee feature:** block it until a backend user lookup exists, ship “assign to me” only, or approve a backend addition?
5. **Backend changes:** do you approve any of the confirmations in section 5? If not, I will implement client-side workarounds and hide unsupported actions.
6. **Project colours:** deterministic frontend palette (recommended for now) or wait for a persisted backend field?
7. **Settings:** read-only profile page for now?
8. **Due-date clear:** hide the clear action until the backend supports null?
9. **Board pagination:** paginate per status column, or one shared page across the board? The handoff asks for both board and list pagination, but they behave differently.
10. **Dependencies:** may I add `@tanstack/react-query` and later Playwright? May I fix the lint config?
11. **Ports/env:** confirm Next on 3001 and the API base URL.

Once you approve these, I’ll start with Phase 2 (design tokens + app shell), one small reviewable change at a time.
