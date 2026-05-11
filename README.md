Country Management — Frontend (Vanilla JS)
========================================

Summary
-------
Small, recruiter-ready static frontend for managing a country dataset. Built with plain HTML, CSS and vanilla ES6 JavaScript — no build step or frameworks required.

Quick start (local)
-------------------
- Open `index.html` in a modern browser (Chrome/Edge/Firefox).
- No server required — the app persists data to `localStorage`.

Development notes
-----------------
- Pages: `index.html`, `countries.html`, `country-details.html`, `analytics.html`, `favorites.html`, `settings.html`, `login.html`, `help.html`.
- Shared scripts: `js/common.js`, `js/storage.js`, `js/ui.js`.
- Page controllers: `js/dashboard.js`, `js/countries.js`, `js/details.js`, `js/analytics.js`, `js/favorites.js`, `js/settings.js`, `js/login.js`.

Features
--------
- Dark / Light theme with persistence
- Import / Export countries (JSON)
- Add / Edit / Delete countries
- Table and card views, search, continent filter, population sort
- Favorites, recent activity and search history
- Lightweight analytics (largest/smallest/avg, per-continent counts)

Polish & notes
---------------
- Debug console.error statements have been removed/reduced for cleaner console output.
- All changes persist to `localStorage` under `cm_` keys; clearing storage will reset the app.

Deploy (Vercel / static host)
----------------------------
1. Ensure the project is in a Git repo.
2. Push to GitHub.
3. Create a Vercel project and point it to the repository root. Vercel will serve the static files automatically.

Commit & push
--------------
I will (or have) committed the README and final polish, and pushed to the remote if you requested a final push.

If you want any final accessibility or responsive tweaks, I can make them in a follow-up, but feature expansion is now frozen per your request.

Contact
-------
If you'd like a packaged zip or a GitHub release, tell me and I'll assemble it.
# Country Management Dashboard

A static frontend Country Management application built with HTML, CSS, and vanilla JavaScript. The app runs directly in the browser and persists country data in `localStorage`, so it works without a backend, API, database, or build step.

## Features

- Responsive admin dashboard layout
- Add, edit, delete, and view country details
- Browser `localStorage` persistence
- Search and continent filtering
- Toast notifications for user feedback
- Loading overlay and modal dialogs
- Clean table styling and empty state UI
- Mobile, tablet, and desktop friendly layout

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

## Deployment Instructions

### GitHub
1. Push the repository to GitHub.
2. Keep `index.html` at the repository root.
3. Ensure the `css/`, `js/`, and `assets/` folders remain in place.

### Vercel
1. Import the GitHub repository into Vercel.
2. Choose the repository root as the deployment directory.
3. Deploy as a static site.

No build tools or package installation are required. Open `index.html` directly to run the app locally.
