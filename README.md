# MangaTracker

Monorepo for MangaTracker MVP.

Repo structure
- apps/web: Next.js 14 App Router web app (Supabase auth, minimal UI, API routes)
- apps/worker: BullMQ worker that syncs from MangaDex
- packages/db: Prisma schema and client shared across apps

Getting started (local)
1. Copy envs
   cp .env.example .env
2. Start Postgres + Redis
   docker compose up -d
3. Install deps
   npm ci
4. Generate Prisma Client
   npx prisma generate --workspace=packages/db
5. Create initial migration (create-only)
   npx prisma migrate dev --create-only --name init --schema packages/db/prisma/schema.prisma
6. Run dev
   npm run dev
   - Web: http://localhost:3000
   - Worker: run separately in another terminal: npm run --workspace=@mangatracker/worker dev

Environment variables
- DATABASE_URL: postgresql://postgres:postgres@localhost:5432/mangatracker?schema=public
- REDIS_URL: redis://localhost:6379
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: from your Supabase project
- SUPABASE_SERVICE_ROLE: used by worker if needed in the future
- MANGADEX_BASE_URL: https://api.mangadex.org
- SYNC_INTERVAL_CRON: CRON pattern for repeat jobs (default */15 * * * *)

Web app
- Auth: Supabase magic link + GitHub OAuth. All main pages under /(app) are protected and redirect to /signin when not authenticated.
- Flows:
  - Home: lists your tracked series
  - Add: search MangaDex or paste URL/ID, track series (creates global Series and associates with your user), and enqueues immediate sync
  - Series detail: shows metadata and chapters; mark read/unread; trigger manual sync
- API routes:
  - POST /api/series { url?: string; sourceId?: string }
  - GET /api/search?q=...
  - POST /api/series/[id]/sync
  - POST /api/chapters/[id]/toggle-read

Worker
- Queue: "sync-series" (BullMQ)
- On startup: registers repeatable jobs for each tracked series (every 15 minutes by default)
- Processor: fetches MangaDex series + chapters, upserts into DB with basic rate limiting
- Health: exposes http OK on PORT (default 3001)

Testing
- Web: Vitest + React Testing Library
- Worker: unit tests for mappers

CI
- Node 20
- Postgres and Redis services
- Steps: npm ci → prisma generate → prisma migrate dev --create-only → turbo run typecheck lint test build

Deployment
- DB: Supabase Postgres. Run prisma migrate deploy against Supabase:
  DATABASE_URL=... npx prisma migrate deploy --schema packages/db/prisma/schema.prisma
- Web: Vercel
  - Set envs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL (if using server routes that access DB), REDIS_URL
- Worker: Render (Node service)
  - Set envs: DATABASE_URL, REDIS_URL, MANGADEX_BASE_URL, SYNC_INTERVAL_CRON
  - Start command: node dist/index.js (build first)

Notes
- Strict TypeScript everywhere.
- No secrets committed. Use .env and platform env managers.
