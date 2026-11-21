EventSphere — static demo data task report
==========================================
Last updated: 2026-11-21

1. What the task asked for
--------------------------
- Add static demo data (events, exhibitors, booths, sessions) to the repository,
  not only to the local MongoDB, so it ships with a GitHub push.
- Fill in Backend/.env.example because that file is committed.
- Provide images for the events/exhibitors.
- Site should render proper data with working images.


2. What is DONE
---------------
2.1 Git hygiene (earlier session, committed)
- Rewrote .gitignore: .env / .env.* / *.local ignored, .env.example kept,
  node_modules, dist, uploads, logs, OS/editor files.
- Removed the already-staged Backend/.env and 21,039 node_modules files from the
  index (files kept on disk). Verified the Brevo API key never entered the index.
- Commits exist: 0610c9d, 291625b, 5c97036.

2.2 Environment template
- Backend/.env.example is committed with all 17 variables (PORT, MONGO_URI,
  JWT_SECRET, BREVO_*, FRONTEND_URL, ADMIN_*, DEMO_*, DEMO_COMPANY_NAME).
- Values are placeholders, no real API key.

2.3 Research (done, used to shape the dataset)
- ITIF Asia: 4-6 Nov 2026, Lahore Expo Centre (24th edition); 2027 edition in Karachi.
- Pakistan Industrial Expo (10th): 14-16 Nov 2026, Halls 1 & 2, Lahore Expo Centre.
- Green Pakistan Expo: 26-28 Nov 2026, Lahore Expo Centre.
- IAPEX Lahore: 4-6 Dec 2026, Lahore Expo Centre.
- Health Asia: Karachi 10-12 Sep 2026; next Lahore edition 22-24 Apr 2027.
- These were used to keep venues/themes realistic for the 2027 demo edition
  already present in the database.

2.4 Database content (already inserted by an earlier partial run)
- 6 demo expos for 2027 + 1 user-created expo ("Job Mela", left untouched).
- 6 x 5 = 30 booths with floor positions, prices and assignments.
- 6 x 4 = 24 sessions spread across the expo days.
- 8 exhibitor profiles with company details, contacts and booth links
  (Mughal Precision Works, Indus Robotic Systems, Shifa MedTech Solutions,
  Ravi Green Energy, Lahore Design Collective, Karakoram Learning Labs,
  Chenab Textile Machinery, Sindh Solar Works).

2.5 Images (new, in the repo)
- 6 real photos downloaded from Unsplash into frontend/public/assets/expos/:
    itcn-asia-lahore-2027.jpg          (conference audience)
    pakistan-industrial-expo-2027.jpg  (factory automation)
    edu-expo-pakistan-2027.jpg         (students / library)
    health-asia-karachi-2027.jpg       (clinic interior)
    solar-pakistan-green-expo-2027.jpg (solar farm)
    build-asia-design-expo-2027.jpg    (architect drafting)
  All downloaded, opened and visually checked. Each is 130-282 KB, 1600x900.
- 8 branded SVG logos generated in frontend/public/assets/exhibitors/:
    mughal-precision.svg, indus-robotic.svg, shifa-medtech.svg, ravi-green.svg,
    lahore-design.svg, karakoram-learning.svg, chenab-textile.svg, sindh-solar.svg

2.6 Why Pinterest was not used
- i.pinimg.com returns HTTP 403 to direct downloads (hotlink protection).
- Pinterest images are user-uploaded, usually copyrighted, and scraping breaks
  Pinterest's terms. Unsplash was used instead: free license, no attribution
  required, safe to commit.


3. What is LEFT (in order)
--------------------------
3.1 Write Backend/src/seedContent.js
    The current file still seeds the old 2026 sample set. It must be replaced
    with an idempotent seed that reproduces the 2027 dataset above:
    - upsert 6 expos by title (published status),
    - create/find the 8 exhibitor users + profiles,
    - upsert 30 booths (numbered PIE-/ITC-/EDU-/HLT-/GRN-/BLD-) with
      exhibitor assignments and booked/available status,
    - upsert 24 sessions.
    Run with: cd Backend && npm run seed:content

3.2 Point the database at the new image files
    Expos currently reference .png paths whose files never existed, and
    exhibitors reference missing .png logos. Re-running the seed must switch
    them to the new .jpg / .svg files. This is the fix for the broken images.

3.3 Fix Backend/.env.example
    FRONTEND_URL currently reads http://localhost:5176 but Vite serves on 5173.
    Replace the DEMO_* placeholder values with the static demo credentials.

3.4 Verify
    - Re-run the seed; expect created/updated counts and no validation errors.
    - Check every image path in MongoDB exists on disk.
    - Hit the public endpoints and confirm JSON + image URLs:
        /api/expo/getExpo?status=published
        /api/exhibitor/search
        /api/booth/public
        /api/session/get-sessions
    - Optionally open the site and confirm cards render images.

3.5 Commit the changes
    Not done yet; waiting for the user to ask for a commit/push.


4. Blockers / notes
-------------------
- Provider connection kept dropping mid-response during this session; no project
  files or data were damaged.
- "Job Mela" and the exhibitor rows named "Nothing" are user-created records and
  must not be deleted by the seed.
- Booth numbers are globally unique in the schema, hence the per-expo prefixes.
