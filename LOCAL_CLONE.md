# Local Clone Run Guide

## Start

```bash
npm run start:local
```

Then open:

- http://127.0.0.1:4173/home
- http://127.0.0.1:4173/visa-advisor
- http://127.0.0.1:4173/top-occupations
- http://127.0.0.1:4173/settings

## What this setup does

- Serves your captured frontend bundle from `www.settledin.app`.
- Uses `www.settledin.app/local-entry.html` as SPA entry for local routes.
- Seeds a local demo auth session via `www.settledin.app/local-demo-auth.js` so protected pages render.
- Mocks API endpoints in `local-clone-server.js` with in-memory data and your captured snapshots (`api/occupations.html`, `api/universities.html`).

## Where to edit mock data

- User profile/preferences/journey/subscription: `local-clone-server.js` (the `state` object).
- EOI ranking/competitiveness demo data: `local-clone-server.js` (top occupations + EOI sections).
- Auth demo identity: `www.settledin.app/local-demo-auth.js`.

## Important limitations

- This is a local demo scaffold, not production backend parity.
- Login/signup/billing are mocked.
- Some flows outside the captured pages may still need additional asset/API capture.
