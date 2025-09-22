# mangatracker

Production-ready monorepo scaffold using Turborepo + npm workspaces. Phase 0 focuses on structure, strict TypeScript, CI, and repo health — no runtime env vars.

## What's included

- Turborepo monorepo with npm workspaces
- apps/web: Next.js 14 (App Router) + Tailwind + strict TS
- apps/worker: TypeScript placeholder for future worker cluster
- Strict base `tsconfig` inherited across packages
- Prettier, ESLint (Next core-web-vitals for web), Husky + lint-staged
- GitHub Actions CI (Node 20, npm): typecheck, lint, build
- MIT License, Code of Conduct, Contributing guide, CODEOWNERS

## Directory structure

```
/
├─ apps/
│  ├─ web/            # Next.js App Router + Tailwind
│  └─ worker/         # TS worker placeholder
├─ .github/workflows/ # CI
├─ .husky/            # Git hooks
├─ turbo.json         # Turborepo pipeline
├─ tsconfig.base.json # Strict TS settings
├─ package.json       # npm workspaces + scripts
└─ prettier.config.cjs
```

## Quickstart

1. Install dependencies

```
npm ci
```

2. Run dev (web app)

```
# From repo root via Turbo tasks
# or directly in the app
npm run dev
# or
cd apps/web && npm run dev
```

3. Typecheck, lint, build (across all workspaces)

```
npm run typecheck
npm run lint
npm run build
```

## CI

GitHub Actions runs on push to `main` and on Pull Requests:

- Setup Node 20.x
- `npm ci`
- `npx turbo run typecheck lint build`

## Phase 0 scope

- Scaffolding only (structure, tooling, CI)
- No runtime environment variables
- Strict TS throughout

## How to roll back

If needed, revert the PR that introduced this scaffold:

- Use GitHub's "Revert" on the PR, or
- Locally: `git revert <merge_commit_sha>`

## Notes

- Package manager: npm (package-lock.json). No pnpm/yarn files.
- Engines: Node >= 20.
