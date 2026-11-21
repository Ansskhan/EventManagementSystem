# EnhanceUI.md — UI/UX enhancement context

Living document for frontend UI work on EventSphere. Keep it updated as changes land.
Last reviewed: 2026-11-22

## 1. How we work

The user supplies a reference image (or several) plus a note about which screen/area to
improve. The expected loop is:

1. Locate the screen in `frontend/src/features/**` and the CSS file that styles it.
2. Open the live site at the relevant viewport(s) to see the current state.
3. Implement the change in the existing component + existing CSS file. No new design
   system, no new library unless explicitly approved.
4. Verify at 1440px (desktop), 768px (tablet) and 390px (phone), then report what changed.
5. Never change business logic, API calls or backend contracts for a visual request.

Screenshots are only taken when the user asks for a visual check or when a change needs
visual verification. They are review artefacts, never committed.

## 2. Running / previewing

- Frontend: `cd frontend && npm run dev` → http://localhost:5173 (Vite, proxies `/api`,
  `/uploads`, `/socket.io` to http://localhost:4000).
- Backend: `cd Backend && npm start` (no hot reload; restart after controller/middleware edits).
- Public pages work without login: `/`, `/events`, `/events/:id`, `/exhibitors`,
  `/schedule`, `/floor-plan`, `/about`, `/contact`, `/login`, `/register`.
- Dashboard pages (`/dashboard/...`) need a signed-in account; ask the user for a demo
  login when a dashboard screenshot is required.
- Local review tooling (gitignored, judge my screenshots by it):
  - `.contextgit/ui-review/tools/shots.mjs` — screenshots of the main screens.
  - `.contextgit/ui-review/tools/audit.mjs` — lists horizontal-overflow offenders per
    page at 1440/1024/768/390px.
  - Needs Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.

## 3. Brand and visual language (current)

Warm "editorial maximalist" direction. It already looks distinctive — the goal is to
refine, not replace.

- Canvas `#faf8f3` / `#f7f3ed`, surface `#fffdf9`, hairline borders `#e8e3d9`, `#eee7df`.
- Ink `#262326` / `#302b2d`, muted text `#746c65`, `#887a70`.
- Accent orange `#ed6037` (hover `#d94c26`), deep plum `#28202d` / `#292329`.
- Secondary tints: peach `#f5e3d6`, lilac `#e6e0ee`, sage `#e5eadf`.
- Type: Manrope for headings (tight tracking, -1 to -4px), DM Sans for body.
- Radii: 4–7px for controls/cards; hero image uses a 140px top-left radius and the
  "experience" photo a 100px top-right radius.
- Buttons: `.button` / `.button-dark` / `.button-orange` (public), `.dash-primary`,
  `.outline-button`, `.danger-button` (dashboard).
- Eyebrows: 8–10px uppercase, 1.2–1.7px letter-spacing, orange status dot.
- Section rhythm: 60–98px vertical padding, `.wrap` max-width 1280 with 56px gutters
  (32px ≤1050px, 24px ≤760px).

## 4. CSS structure

One file per feature, all imported from `src/app/App.jsx`:

`index.css` (public site, header, hero, footer), `public-pages.css`, `event-card.css`,
`exhibitor-card.css`, `auth.css`, `dashboard.css`, `overview.css`, `management-table.css`,
`expo-record.css`, `application.css`, `application-table.css`, `booth-detail.css`,
`sessions.css`, `analytics.css`, `bookmarks.css`, `feedback.css`, `notifications.css`,
`messages.css`, `account.css`.

Note: most of these files are single-line minified-style CSS. Add rules in the same
compact style there; `expo-record.css` and the `EnhanceUI.md`-era edits use normal
formatting. Prefer appending a clearly-scoped rule over rewriting a minified line.

## 5. Screens inventory

Public: home, events list, event detail, exhibitors directory, schedule, floor plan,
about, contact, login, register (one boxed form for attendee/exhibitor).

Home hero is a 4-slide crossfade carousel: each slide carries its own photo, headline,
caption, "next up" sticker and live-stat line. It advances every 5.5s, has clickable
dots top-right, and does not auto-advance when `prefers-reduced-motion` is set. Slide
data lives in the `heroSlides` array at the top of `features/public/pages/HomePage.jsx`.

Dashboard (`WorkspaceLayout`, shared by admin/organizer and exhibitor/attendee):
overview, expos (list/new/edit), applications, profile, exhibitors, booths, sessions
(list/new/edit), registrations, attendance, users, analytics, bookmarks, feedback,
notifications, messages, account.

Shared components: `PublicHeader` + `Footer`, event cards, exhibitor cards, dashboard
sidebar/header, tables (`.records-table`), forms (`.workspace-form`, `.auth-field`).

## 6. Audit findings (current build, 2026-11-22)

Verified by screenshot + automated overflow check. These are the known rough edges to
address when the user points at them.

High impact
- No mobile navigation: the public header hides `.navigation` below 760px and renders
  the CTA hidden too, but nothing renders the `.menu-button` hamburger. On phones the
  only navigation is the footer. There is a menu/link problem, not just styling.
- Horizontal scroll at tablet/laptop widths (768–1024px) on the home page: the decorative
  `.hero-orbit` circles (`.orbit-one`, `.orbit-two` with negative `right`) push the
  document to 1099px at a 1024px viewport and 781px at 768px. 390px is clean because the
  orbits are hidden there.
- ~~The hero "Future Makers / next up" sticker was clipped by the photo frame's rounded
  corner.~~ Fixed: both stickers now live in `.hero-visual` instead of inside the
  `overflow:hidden` `.photo-frame`, so they float over the image unclipped.

Medium
- Auth (login/register) on desktop: the form column sits low with a lot of empty space
  above; disabled primary button (`#d7c4b5` on `#d7c4b5` text) has very low contrast.
- Exhibitors directory: the "Connect" panel lists five booths per company as one long
  run-on line ("Booth PIE-104 · Hall 1 Ground Floor / Booth ITC-204 · …"); product and
  service text truncates mid-word with an ellipsis on mobile; the logo tile and company
  name are visually disconnected on small screens.
- Events cards: the `published` status chip is tiny and low contrast over busy artwork;
  "7 events found" is nearly invisible.
- Mobile home: the audience strip packs "ONE SHARED SPACE" into a 55px column next to
  three stacked links, which reads awkwardly.

Low / polish
- Mixed tiny type: 8–10px labels are used widely; several are below comfortable mobile
  reading size.
- Numerous hairline-border card variants (`.dash-card`, `.table-card`, `.records-table`,
  `.workspace-form`) differ subtly in radius/padding.
- Focus style is a purple outline (`#643bcc`) that does not belong to the warm palette.

Data-only issues (not UI work): test rows such as exhibitor "Nothing" with "this is very
good gop gop" and categories like "SOMETHING" appear in the directory; booth listings look
duplicated per exhibitor.

## 7. Conventions for new UI work

- Reuse existing tokens above; do not introduce new accent colours or fonts.
- Keep components' markup/class names unless a rename is part of the request.
- Interaction states required: hover, focus-visible, disabled, loading, empty, error.
- Mobile first for new rules: check 390px, then 768px, then 1440px.
- Text must not clip, overflow or truncate mid-word; containers must not create
  horizontal scroll (`audit.mjs` must report `ok` at all four widths).
- Images live on disk only (git-ignored), so do not build layouts that depend on a new
  committed image file.
- Verify with `cd frontend && npm run build` after CSS/JSX changes.

## 8. Backlog (suggested order)

1. Mobile navigation in `PublicHeader` (hamburger + slide-in panel), and keep the CTA reachable.
2. Kill the hero-orbit overflow at 768–1024px (clip the hero, hide orbits below 1050px).
3. ~~Reposition the hero "next up" sticker so it is never clipped.~~ Done (moved out of
   `.photo-frame`).
4. Exhibitor card: collapse booth details into a compact line/badge count, fix truncation,
   improve mobile hierarchy.
5. Auth screens: tighten vertical rhythm, strengthen disabled-button contrast.
6. Event card status chip + result count legibility.
7. Unify focus ring to the warm accent and audit 8–10px labels for minimum readable size.
