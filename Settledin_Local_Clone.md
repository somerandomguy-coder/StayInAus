
# Settledin Local Clone: Learn-and-Takeover Plan
## Summary
- This repo is not original source code. It is a **captured production build** (minified Vite bundles) plus a **local mock backend server**.
- Your main “editable logic” for behavior right now is the local Node server at [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js).
- The frontend app logic lives in hashed files under [www.settledin.app/assets](/home/nam/StayInAus/www.settledin.app/assets), which are hard to maintain directly because they are compiled/minified.
- Goal for takeover: learn current flow first, then gradually re-introduce maintainable source (`src/`) while keeping this local clone running.

## Architecture Map (What Folder/File Does What)
- Project root runtime docs/config:
  - [package.json](/home/nam/StayInAus/package.json): only starts Node server (`start:local`).
  - [LOCAL_CLONE.md](/home/nam/StayInAus/LOCAL_CLONE.md): run notes and limitations.
- Local backend/mock API:
  - [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js): HTTP server, SPA routing, static file serving, mocked APIs, in-memory state.
- Frontend web app shell:
  - [www.settledin.app/local-entry.html](/home/nam/StayInAus/www.settledin.app/local-entry.html): local SPA entry used for `/home`, `/login`, etc.
  - [www.settledin.app/home.html](/home/nam/StayInAus/www.settledin.app/home.html): original captured prod entry/SEO-heavy HTML.
- Frontend compiled bundles:
  - [www.settledin.app/assets/index-CzioLhT0.js](/home/nam/StayInAus/www.settledin.app/assets/index-CzioLhT0.js): Vite bootstrap/chunk loader + preload error handling + mount.
  - [www.settledin.app/assets/App-CJyG6E1j.js](/home/nam/StayInAus/www.settledin.app/assets/App-CJyG6E1j.js): main app module with route/API wiring.
  - [www.settledin.app/assets/supabase-fazHhpD0.js](/home/nam/StayInAus/www.settledin.app/assets/supabase-fazHhpD0.js): bundled Supabase client internals.
- Local auth bootstrap:
  - [www.settledin.app/local-demo-auth.js](/home/nam/StayInAus/www.settledin.app/local-demo-auth.js): seeds demo Supabase-like localStorage session.
- Captured JSON snapshots:
  - [www.settledin.app/api](/home/nam/StayInAus/www.settledin.app/api): seed data snapshots (occupations/universities + legacy captured responses).
- Restored telemetry scripts:
  - [www.settledin.app/_vercel](/home/nam/StayInAus/www.settledin.app/_vercel): Vercel analytics/speed-insights scripts.
- Backups/history:
  - [backupstayinaus](/home/nam/StayInAus/backupstayinaus): pruned/restored backup files.
  - [lh3.googleusercontent.com](/home/nam/StayInAus/lh3.googleusercontent.com): captured external image artifact.

## Runtime Flow (How It Works End-to-End)
- Browser opens `/home` -> server checks SPA paths and serves [local-entry.html](/home/nam/StayInAus/www.settledin.app/local-entry.html#L1).
- HTML loads [local-demo-auth.js](/home/nam/StayInAus/www.settledin.app/local-demo-auth.js#L1) first, then module script [index-CzioLhT0.js](/home/nam/StayInAus/www.settledin.app/assets/index-CzioLhT0.js).
- `index-Czio...` lazy-loads main app chunk (`App-CJyG6E1j.js`), mounts React root, and has reload handling for missing chunks.
- App calls APIs like `/api/user/preferences`, `/api/subscription/status`, `/api/user/journey`, `/api/feedback`, etc.
- Server routes all `/api/*` into `handleApi()` in [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js#L478), returning mock state.
- State is in-memory object (preferences/journey/subscription/etc.) initialized near [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js#L79), so writes are lost on restart.
- Static assets are served from disk with MIME mapping via `serveStaticFile()` at [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js#L910).

## Stack + Interfaces You Need to Own
- Frontend stack:
  - React 18 runtime (`createRoot`) from bundled core.
  - Vite production bundle conventions (hashed chunks, module preload).
  - React Query in bundle (`react-query-CBpCeMlb.js`).
  - Supabase JS client (bundled; version string indicates `supabase-js ... 2.99.2` in compiled file).
  - Vercel analytics/speed-insights scripts.
- Backend stack:
  - Node built-in `http` (no Express), JSON API handlers, manual routing.
- Key app routes seen in bundle:
  - `/home`, `/login`, `/auth/callback`, `/onboarding`, `/visa-advisor`, `/top-occupations`, `/settings`, `/subscription`, `/subscription/success`, `/pre-departure-checklist`, `/terms`, `/privacy`, `/upgrade`.
- Key API interfaces (actual local backend contracts):
  - User/profile/journey: `/api/user/preferences`, `/api/user/journey`, `/api/user/journey/tasks`, `/api/user/visa/history`.
  - Visa pathway/subscription: `/api/user/work-visa-pathways`, `/api/subscription/status`, `/api/subscription/update`, `/api/subscription/cancel`.
  - Reference data: `/api/occupations`, `/api/universities`, `/api/visas`, `/api/visas/check-eligibility`.
  - EOI analytics mocks: `/api/eoi/*`.
- Data seeds:
  - Occupations snapshot: 713 rows in [api/occupations.html](/home/nam/StayInAus/www.settledin.app/api/occupations.html).
  - Universities snapshot: 44 rows in [api/universities.html](/home/nam/StayInAus/www.settledin.app/api/universities.html).

## Best Practices Present vs Gaps
- Good practices already present:
  - Cache-busted hashed assets and chunk splitting (Vite-style).
  - Defensive preload/chunk error recovery in index bootstrap.
  - Centralized API layer in app bundle (single place to call endpoints).
  - Local mock server isolates frontend learning from real backend dependencies.
- Important gaps/risks for long-term ownership:
  - Main frontend is minified compiled output, not maintainable source.
  - No typed contracts/schema validation around APIs.
  - No automated tests in this repo.
  - In-memory backend state resets on server restart.
  - Auth in local script is a fake session seed; production auth logic is not represented fully.
- About “encrypting JS”:
  - Browser JS is never truly secret. Production apps ship readable/extractable JS by design.
  - Normal protection is: keep secrets server-side, use publishable keys on client, enforce auth/authorization on backend/RLS.
  - Minification/obfuscation only raises effort; it does not secure secrets.

## Learning-and-Takeover Pathway (Decision-Complete)
1. Week 1: Runtime understanding
- Run app and map request flow in browser network tab for `/home`, `/settings`, `/visa-advisor`.
- Trace each API request to exact handler in [local-clone-server.js](/home/nam/StayInAus/local-clone-server.js).
- Build your own “API contract notes” for request/response shapes.

2. Week 2: Own backend mock layer
- Refactor mentally into modules (preferences, journey, subscription, feedback, eoi) without changing behavior yet.
- For each module, list required fields the UI depends on.
- Add a restart-safe data strategy plan (file persistence or lightweight DB) before feature changes.

3. Week 3: Rebuild maintainable frontend shell
- Create a fresh `src/` React + Vite app in parallel (do not delete current bundle yet).
- Recreate only one route first (`/home`) and wire it to existing local API.
- Use TypeScript + a typed API client from day one.

4. Week 4: Incremental migration
- Migrate routes one-by-one in priority order:
  - `/home` -> `/settings` -> `/visa-advisor` -> `/top-occupations` -> auth/subscription pages.
- Keep old bundle available as fallback until parity is achieved.

5. Week 5+: Production-hardening
- Move mock API to proper backend framework and database.
- Add auth boundaries, input validation, and logging.
- Add test layers: unit (helpers), integration (API), e2e (core journeys).

## Test/Checkpoint Plan
- Checkpoint A (understanding): you can explain every `/home` network request and its matching backend handler.
- Checkpoint B (backend ownership): you can modify one API response shape intentionally and predict UI impact.
- Checkpoint C (migration): your new `src/` `/home` page renders equivalent data from existing API.
- Checkpoint D (quality): basic tests cover at least preferences GET/PUT + journey task CRUD + subscription status flow.

## Assumptions and Defaults
- Assumption: your priority is learning + maintainability, not preserving exact minified bundle internals.
- Default: treat current bundle as reference behavior and migrate to new readable source progressively.
- Default: keep `local-clone-server.js` as temporary compatibility backend while rebuilding frontend.
- Default: do not trust client-side keys/tokens as secret material; enforce security on server side.
