# Repository Guidelines

## Project Structure & Module Organization
- Core app code lives in `src/`.
- Routes use Next.js App Router under `src/app/`:
  - `src/app/(landing)` for public pages.
  - `src/app/internal/financial/*` for authenticated financial flows.
- Reusable UI is in `src/components/` (feature folders with co-located `index.tsx`, `*.module.scss`, `*.test.tsx`).
- API/service logic is in `src/services/` (`auth`, `user`, and `financial/*`).
- Shared helpers/types: `src/util/`, `src/types/`, and test helpers in `src/tests/`.
- Static assets are in `public/`.

## Build, Test, and Development Commands
Use Yarn (project standard, lockfile is `yarn.lock`).

- `yarn dev`: start local dev server at `http://localhost:3000`.
- `yarn build`: create production build.
- `yarn start`: run the production build locally.
- `yarn test`: run Jest tests once.
- `yarn test:watch`: run tests in watch mode.
- `yarn coverage`: run tests with coverage output.
- `yarn lint` / `yarn lint:fix`: run ESLint / auto-fix lint issues.
- `yarn format`: run Prettier across `src/**/*.{js,jsx,ts,tsx}`.
- `yarn compile`: run TypeScript type checking (`tsc`).

## Coding Style & Naming Conventions
- TypeScript + React 19 + Next.js 16.
- Formatting: 4 spaces, max line length 120, semicolons, double quotes, trailing commas (`.editorconfig`, `.prettierrc`).
- Styling uses SCSS Modules (`*.module.scss`) scoped per component.
- Use path alias imports via `@/*` (maps to `src/*`).
- Prefer `index.tsx` entry files in feature folders.

## Testing Guidelines
- Framework: Jest with `jsdom` and Testing Library.
- Keep tests co-located as `*.test.ts` or `*.test.tsx`.
- Run a single test file with: `yarn test src/components/.../file.test.tsx`.
- Generate coverage with `yarn coverage`; CI enforces formatting, lint, and coverage pass on push/PR.

## Commit & Pull Request Guidelines
- Follow conventional commit style used in history: `feat(scope): ...`, `fix(scope): ...`, `test: ...`, `docs: ...`.
- Keep commits focused and descriptive; reference affected area (for example, `financial`, `landing`, `auth`).
- PRs should include:
  - concise summary of behavior changes,
  - linked issue/ticket (when applicable),
  - screenshots/GIFs for UI changes,
  - confirmation that `yarn format`, `yarn lint`, and `yarn coverage` pass.