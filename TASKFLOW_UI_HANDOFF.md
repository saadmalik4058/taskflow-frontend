# Taskflow UI Handoff — Concept C (Modern Project Studio)

Put this file in the repo root (or `docs/`) next to the original brief, and give opencode both.

## Rules (from the brief — do not skip)
- Frontend only. Do NOT change the backend, schema, or API contracts. Do NOT invent endpoints or fields.
- FIRST inspect the backend repo (models, routes, controllers, middleware, validation) and report what exists. If you cannot, ask me for the files.
- Work one page/workflow at a time. Small, reviewable changes. Explain decisions. Test before moving on.
- Stack: React/Next.js + TypeScript + Tailwind. Keep API calls in one reusable layer. Handle loading, empty, 401, 403, validation, and server-error states.
- Do not store JWTs insecurely without discussing it with me first.

## Status/priority mapping (verify against backend)
| UI label | API value |
|---|---|
| To Do | `pending` |
| In progress | `in-progress` |
| Completed | `completed` |

Priorities: Low / Medium / High → `low` / `medium` / `high`. No "Urgent" unless the backend supports it.

## Design tokens (Concept C)
- Background `#F4F5FB`, surface `#FFFFFF`, border `#DEDFF0`
- Text `#14122B`, muted text `#5A5873`
- Primary accent (violet) `#5B21B6`; nav active = accent at ~10% opacity
- Project colours (examples): `#4338CA`, `#0E7490`, `#B45309` — one per project
- Font: Plus Jakarta Sans (400/500/600/700)
- Radius: 12px cards; 99px for badges/pills
- Spacing: card padding 18px; page padding 28px; gaps 14–18px
- Shadows: minimal; rely on 1px borders

Badge colours (text on background):
- High `#B42318` on `#FEE4E2` · Medium `#93370D` on `#FEF0C7` · Low `#475467` on `#F2F4F7`
- To Do `#475467` on `#F2F4F7` · In progress `#3730A3` on `#E0E7FF` · Completed `#05603A` on `#D1FADF`

## Layout
- Left sidebar 240px: logo, nav (Overview, My Tasks, Projects, Calendar, Completed, Settings), project list with colour dots, account label at bottom.
- Page header: title left, prominent "+ Create task" button right.
- Responsive: sidebar becomes a drawer on mobile; board columns stack or scroll; no horizontal page overflow; touch targets ≥ 44px.

## Screens
1. **Dashboard:** completion ring + stat cards (To Do, In progress, Overdue), project progress cards (colour bar, progress bar, "x of y done"), Today list. Derive all numbers from real API data.
2. **Tasks:** toolbar (search, status, priority, sort, reset) and a 3-column board by status. Cards show title, priority badge, project, assignee initials. List view toggle, pagination, detail drawer, edit/delete with confirmation.
3. **Projects:** 3-column grid of cards with colour header, name, "x of y tasks done", progress bar. Create/edit/delete (with confirm). No invented deadlines or statuses.
4. **Calendar:** month grid with task chips by due date (priority/status colours), plus a "No due date" side panel. Week view, Today button, open task on click.

## Reference
Open design canvas (visual reference only): https://claude.ai/artifact/HL9gCwYXnfhzhfux5jgFqu — see the C row. All data there is demo data.

## Build order
1. Phase 1 report: backend inspection.
2. Design system + app layout (tokens, Button, Input, Badge, Avatar, Card, Dialog/Drawer, empty/loading/error states).
3. Auth (sign in / sign up) and protected routes.
4. Projects → Tasks (create, assign if allowed, edit, status/priority, filter/sort/paginate) → Dashboard → Calendar → Completed → Settings.
5. Integration testing of every workflow in the brief.

Stop after each step and show me what changed.
