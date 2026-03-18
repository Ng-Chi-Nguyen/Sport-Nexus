# SportNexus

## Build & Test Commands
- Root dev: `npm run dev`
- Frontend dev: `npm run dev --prefix client`
- Frontend build: `npm run build --prefix client`
- Frontend lint: `npm run lint --prefix client`
- Backend dev: `npm run dev --prefix server`
- Backend has no real automated tests yet; `npm test --prefix server` is a placeholder and should not be treated as verification.

## Workspace Layout
- `client/` is a React 19 + Vite app using React Router and TanStack Query.
- `server/` is an Express 5 API using Prisma, JWT auth, Supabase Storage, and Nodemailer.
- `docs/` contains reference material only; do not assume it is the source of truth.
- `codemap.md` exists but is still a placeholder; do not rely on it until it is populated.

## Frontend Rules
- Main entry points are `client/src/main.jsx`, `client/src/routes/index.jsx`, and `client/src/App.jsx`.
- Route trees are split across `client/src/routes/webRoute.jsx`, `client/src/routes/authRoute.jsx`, and `client/src/routes/adminRoutes.jsx`; keep changes aligned with that split.
- File-name casing must match imports exactly. This repo already has case-sensitive import risks, so do not introduce or preserve mismatched casing.
- If adding or changing lazy-loaded routes/components, ensure there is a matching `Suspense` boundary or use the React Router lazy route API.
- Be careful when editing `client/src/App.jsx`: it currently mixes public layout concerns with admin pages and uses global `overflow-hidden`, which can break page scrolling.

## Backend Rules
- Backend entry point is `server/src/index.js`.
- Keep HTTP concerns in `server/src/controllers/**`, business logic in `server/src/services/**`, and request schemas in `server/src/validators/**`.
- Any customer or management route that touches user-specific or privileged data must be protected with `verifyToken` and, where needed, `checkPermission`.
- Do not log secrets, tokens, or raw credential env vars from mail/auth/storage config.
- Treat `server/prisma/schema.prisma` as the schema source of truth. Since migrations are not versioned yet, call out any schema change explicitly in your final report.

## Verification Expectations
- For frontend-only changes, run at least `npm run build --prefix client` and `npm run lint --prefix client` when possible.
- For backend changes, at minimum run a targeted startup or syntax check and describe any verification gaps because there is no backend test suite yet.
- If you change API contracts shared by both apps, verify both `client/` and `server/` flows instead of checking only one side.

## Known Gotchas
- Root tooling is orchestration only; this repo does not use npm workspaces, so dependencies and scripts are managed separately in `client/` and `server/`.
- Do not commit real `.env` files. Use `.env.example` for documenting required variables.
- Several route and auth areas already have security and layout debt; prefer tightening protections and simplifying layout boundaries over adding more special cases.
