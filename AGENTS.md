# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` for app code (components, pages, utils).
- Assets: `public/` for static files (images, fonts). 
- Config: project configs at the root (e.g., `package.json`, tool configs).
- Tests: colocated as `*.test.*` near source or under `tests/` if present.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local dev server with hot reload.
- `npm run build`: create production build.
- `npm test`: run unit tests.
- `npm run lint` / `npm run format`: check and auto-fix code style, if configured.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; keep lines concise and self-explanatory.
- JavaScript/TypeScript: prefer ES modules, async/await, and functional components.
- Naming: `PascalCase` for components, `camelCase` for functions/variables, `SCREAMING_SNAKE_CASE` for env keys.
- Files: component files as `ComponentName.tsx`; utilities as `verbNoun.ts`.
- Lint/Format: ESLint + Prettier; run `npm run lint` and `npm run format` before committing.

## Testing Guidelines
- Framework: Jest or Vitest with React Testing Library (if UI).
- Location: colocate tests as `*.test.ts(x)` next to the unit under test.
- Coverage: add tests for new logic and critical paths; avoid flaky async tests.
- Run: `npm test` (use `--watch` locally) and ensure snapshot updates are intentional.

## Commit & Pull Request Guidelines
- Commits: use conventional style, e.g., `feat: add video upload flow`, `fix: handle 404 on profile`.
- Scope: one change per commit; include brief rationale in body when helpful.
- PRs: clear description, linked issue, steps to validate, and screenshots for UI changes.
- CI: ensure build, lint, and tests pass before requesting review.

## Security & Configuration Tips
- Secrets: never commit `.env*`; use example files like `.env.example` to document required keys (e.g., API base URLs, tokens).
- Dependencies: prefer maintained libraries; run `npm audit` periodically and upgrade proactively.

## Architecture Overview
- Client-first web app with modular components and shared utilities.
- Keep side effects isolated; prefer hooks/services for API access and state.
