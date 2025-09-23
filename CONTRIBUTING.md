# Contributing to mangatracker

Thank you for your interest in contributing! This repository is structured as a monorepo using Turborepo and npm workspaces. The goal of Phase 0 is to establish solid scaffolding and repo health.

## Branching strategy

- Create feature branches off `main`.
- Use short, descriptive names: `feat/...`, `fix/...`, `chore/...`, `docs/...`.
- Open Pull Requests early and keep them focused and small.

## Commit messages

- Prefer [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add ...`
  - `fix: correct ...`
  - `chore: bootstrap ...`
  - `docs: update README`

## PR review checklist

- Scope is focused and documented in the PR description.
- CI is green (typecheck, lint, build).
- No runtime env vars added during Phase 0.
- Follows strict TypeScript settings, no implicit `any` or returns.

## Local development

- Install dependencies: `npm ci`
- Start dev server: `npm run dev` (runs workspaces via Turborepo) or `cd apps/web && npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`

## Directory structure

- `apps/web` — Next.js 14 App Router + Tailwind
- `apps/worker` — TypeScript worker placeholder

## Opening a PR

- Target branch: `main`
- Title: clear and descriptive
- Description: what changed, how to test, and rollback notes
- Ensure CI passes and the PR remains limited to the described scope
