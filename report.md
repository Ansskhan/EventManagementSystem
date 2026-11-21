EventSphere — demo data and exhibitor onboarding report
=======================================================
Last updated: 2026-11-22

1. What the task asked for
--------------------------
- Ship static demo data (expos, exhibitors, booths, sessions) with the repo,
  not only in the local MongoDB.
- Provide images for expos and exhibitor logos and make the site render them.
- Fix exhibitor onboarding: accept SVG logos, show the logo on the attendee
  exhibitor directory, and collect a picture during registration.
- Simplify the exhibitor registration form, replace "contact person" with an
  email-based contact, make logo/website optional, and fix validation so a bad
  website cannot leave a half-registered account behind.


2. Completed
------------
2.1 Git hygiene and environment template
- .gitignore covers .env / .env.* / *.local, node_modules, dist, uploads, logs
  and OS/editor files; .env.example is committed.
- Backend/.env.example contains the 17 runtime variables with placeholders.

2.2 Research used to shape the dataset
- ITIF Asia, Pakistan Industrial Expo, Green Pakistan Expo, IAPEX and Health
  Asia dates/venues were researched to keep the 2027 demo editions realistic.

2.3 Demo content in MongoDB
- 6 published 2027 expos plus the user-created "Job Mela" (left untouched):
    Pakistan Industrial Expo 2027   (11-14 Feb 2027, Expo Centre Lahore)
    ITCN Asia Lahore 2027          (29-31 Jan 2027, Expo Centre Lahore)
    Edu Expo Pakistan 2027         (5-7 Mar 2027, Islamabad Convention Centre)
    Health Asia Karachi 2027       (15-18 Apr 2027, Karachi Expo Centre)
    Solar Pakistan Green Expo 2027 (20-23 May 2027, Expo Centre Lahore)
    Build Asia Design Expo 2027    (10-13 Jun 2027, Pak-China Friendship Centre)
- 30 booths (PIE-/ITC-/EDU-/HLT-/GRN-/BLD- prefixes), with prices, floor
  positions, exhibitor assignments and booked/available status.
- 24 sessions spread over the expo days with speakers, topics and fees.
- 8 exhibitor accounts + company profiles (Mughal Precision Works, Indus
  Robotic Systems, Shifa MedTech Solutions, Ravi Green Energy, Lahore Design
  Collective, Karakoram Learning Labs, Chenab Textile Machinery, Sindh Solar
  Works). "Job Mela" and the user-created "Nothing" profiles were not modified.
- All 6 expo covers and all 8 exhibitor logos now point at files that exist in
  the repo (previously they pointed at missing .png files, which is why cards
  showed only the company name/initials).

2.4 Repo image assets
- 6 real Unsplash photos in frontend/public/assets/expos/*.jpg (1600x900).
- 8 branded SVG logos in frontend/public/assets/exhibitors/*.svg.
- Unsplash was used instead of Pinterest because direct Pinterest downloads are
  blocked (HTTP 403) and the images are user-uploaded/copyrighted.

2.5 SVG upload support
- Backend upload filter accepts image/svg+xml for every image field.
- Some browsers report .svg as image/svg, text/xml or with no MIME type, so the
  filter also trusts the .svg extension (case-insensitive).
- SVG is enabled in the registration, company-profile and account picture
  pickers. Verified with real multipart requests (registration 201, profile
  update 200, text/xml + uppercase .SVG also accepted).

2.6 Exhibitor registration and profile
- One boxed registration form for both attendee and exhibitor (company details
  and personal details are no longer split into two boxes).
- Removed the separate contact-person field; the account email is stored as the
  company contact email (`contactEmail`) on the exhibitor profile.
- Company fields: name, category, business phone, products, services, website,
  description, logo. Phone is required (10-15 digits); logo and website are
  optional.
- Registration collects the company logo/picture (optional); it is stored as
  both the user profile image and the exhibitor `logoUrl`, so the logo appears
  immediately in the attendee exhibitor directory.
- Website URL is validated with a real URL parser before any database write.
  Invalid URLs return 400 and create no account; if profile creation fails for
  any reason the new user row is rolled back. This fixes the bug where a bad
  website registered the email and a corrected retry said "User already exists".
- Profile page and admin user list use contact email instead of contact person.
  Existing demo profiles were migrated to contactEmail and contactPerson removed.

2.7 Attendee exhibitor directory
- Exhibitor cards use logoUrl, fall back to the exhibitor's user profileImage,
  and fall back to initials if the image fails to load, so a broken image no
  longer leaves the company name showing as alt text.

2.8 Verification performed
- SVG multipart uploads (registration and company profile) return 2xx.
- Invalid website registration returns 400 and no user is created.
- Valid registration with a phone (and no logo) returns 201 and stores
  contactEmail (equal to the account email) plus the phone; missing phone
  returns 400 with no user created.
- Backend syntax checks (node --check) pass; frontend `npm run build` passes.
- MongoDB check: 0 missing exhibitor logo files in frontend/public/assets.


2.9 Organizer user deletion
- Admin user management has a Delete action next to Block/Unblock
  (DELETE /api/auth/delete-user/:id, admin only), behind a browser confirm.
- Deleting a user also removes their exhibitor profile, expo and session
  registrations, bookmarks, feedback, notifications, messages and exhibitor
  applications, and frees any booth they held.
- Guards: an admin cannot delete their own account (400) and other admin
  accounts cannot be deleted (400). Verified: self-delete 400, organizer
  delete 200 with no leftover rows, unknown id 404.

2.10 Images kept out of Git
- .gitignore now ignores all image/media extensions (png, jpg/jpeg, gif, webp,
  avif, bmp, tif/tiff, svg) for both frontend and backend, plus the existing
  Backend/uploads rule.
- Existing tracked images were removed from the Git index with
  `git rm --cached` so they stay on disk locally but stop being pushed. A fresh
  clone or a deploy from GitHub will not contain them; copy them back from this
  machine when needed.


3. Left
-------
3.1 Rewrite Backend/src/seedContent.js
    The committed file still seeds the old 2026 sample set. It must become the
    idempotent 2027 seed:
    - upsert the 6 expos by title (published),
    - create/find the 8 exhibitor users + profiles with SVG logos and contact
      emails,
    - upsert the 30 booths with assignments and statuses,
    - upsert the 24 sessions.
    Run with: cd Backend && npm run seed:content

3.2 Fix Backend/.env.example
    - FRONTEND_URL is still http://localhost:5176; Vite serves on 5173.
    - DEMO_* values are still placeholders; replace them with static demo
      credentials.

3.3 End-to-end check
    - Re-run the seed and confirm created/updated counts with no validation
      errors.
    - Hit /api/expo/getExpo?status=published, /api/exhibitor/search,
      /api/booth/public and /api/session/get-sessions.
    - Register an exhibitor in the browser with and without logo/website, then
      confirm the logo on /dashboard/exhibitors.

3.4 Commit and push
    Waiting for the user to request a commit/push.


4. Notes / constraints
----------------------
- "Job Mela" and the user-created "Nothing" exhibitor rows must not be deleted
  by any seed.
- Booth numbers are globally unique in the schema, hence the per-expo prefixes.
- The backend must be restarted (not just reloaded) to pick up middleware and
  controller changes if it was started with `npm start`.
- SVG files are served same-origin from /uploads; untrusted SVGs can contain
  scripts, so uploads should remain limited to trusted exhibitor accounts.
