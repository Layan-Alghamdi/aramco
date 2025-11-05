## Aramco Digital Presentation Platform (Monorepo)

This repository contains a web editor and API server for creating on-brand presentations with collaboration, autosave, versioning, locks, and AI stubs.

### Structure

- `apps/web` — Next.js-style React app (scaffolded) with editor, canvas, autosave indicator
- `apps/api` — Node.js API server (Express) with routes for slides, templates, locks, comments, versions, AI stubs
- `packages/shared` — Shared TypeScript types and API contract definitions

### Quick start

1) Prerequisites
   - Node.js 18+
   - pnpm (preferred): `npm i -g pnpm`

2) Install dependencies
   - From repo root: `pnpm install`

3) Development
   - Web (Next.js): `pnpm --filter web dev` → http://localhost:3000
   - API (Express): `pnpm --filter api dev` → http://localhost:4000/health

4) Build
   - Web: `pnpm --filter web build`
   - API: `pnpm --filter api build`

5) Start (production build)
   - Web: `pnpm --filter web start`
   - API: `pnpm --filter api start`

### Features in this scaffold

- Autosave indicator component with states: Saving, Saved, Offline
- Autosave hook with debounce and offline queue (localStorage) that drains on reconnect
- Editor page route with basic canvas placeholder and state store
- API routes for slides, templates, locks, comments, versions, exports, share links, AI stubs
- Lock enforcement stub on write operations
- Versioning endpoints stubs
- Shared types covering users, decks, slides, assets, locks, comments, versions, share links

### Next steps

- Wire real database (Postgres), cache (Redis), and storage (S3)
- Replace Express with NestJS if preferred
- Add realtime (WebSocket + CRDT/Yjs)
- Implement PDF export and PPTX job workers
- Integrate SSO/OIDC and RBAC

### Notes

- The autosave queue currently targets a placeholder call; wire it to your API endpoint (`PUT /slides/:id`) when the backend is ready.
- Offline saves are persisted in `localStorage` under `autosaveQueue:v1` and are retried when the browser goes back online.


