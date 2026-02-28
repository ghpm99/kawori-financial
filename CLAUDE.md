# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server at http://localhost:3000
yarn build        # Production build
yarn test         # Run tests once
yarn test:watch   # Run tests in watch mode
yarn coverage     # Run tests with coverage report
yarn lint         # Lint src/**/*.{js,jsx,ts,tsx}
yarn lint:fix     # Lint with auto-fix
yarn format       # Format with Prettier
yarn compile      # TypeScript type check (tsc)
```

To run a single test file:
```bash
yarn test src/components/payments/paymentsDrawer/paymentsDrawer.test.tsx
```

**Package manager:** Yarn 4.12.0 (`yarn`, not `npm` or `pnpm`).

## Architecture

### Tech Stack
- **Next.js 16** with App Router, **React 19**, **TypeScript**
- **Ant Design v6** as the UI component library (with `@ant-design/nextjs-registry` for SSR)
- **TanStack Query v5** for all data fetching and server state
- **Axios** for HTTP calls against a Django REST backend (`NEXT_PUBLIC_API_URL`)
- **SCSS Modules** for component-scoped styles
- **Sentry** for error monitoring

### Route Structure

```
src/app/
  (landing)/          # Public routes: home, /signin, /signup
  internal/
    layout.tsx        # Authenticated shell with MenuInternal + LoginHeader
    financial/
      (dashboard)/    # Main dashboard
      bills/          # Pagamentos (expenses)
      earnings/       # Receitas (income)
      budget/         # Budget goals
      invoices/       # Invoice management
      monthly/        # Monthly financial view
      report/         # Financial overview report
      scheduled_bills/# Scheduled recurring payments
      tags/           # Tag management
```

Path alias `@/*` maps to `src/*`.

### Component File Convention

Each component lives in its own directory with co-located files:

```
src/components/feature/ComponentName/
  index.tsx                 # Component implementation
  ComponentName.test.tsx    # Tests (co-located, not in __tests__)
  ComponentName.module.scss # Scoped styles
```

### Provider Pattern

State management uses React Context + TanStack Query. There are two tiers:

**Global providers** (in `src/components/providers/index.tsx`, wrapping the whole app in this order):
1. `QueryClientProvider` — TanStack Query
2. `ThemeProvider` — light/dark theme with `localStorage` persistence
3. `AntdRegistry` — Ant Design SSR compatibility
4. `AuthProvider` — JWT auth state, sign-in/sign-out, token refresh
5. `UserProvider` — current user profile
6. `LayoutProvider` — sidebar collapse, active menu item

**Feature providers** (added at the page `layout.tsx` level per route):
- `PaymentsProvider` — payment list with filters, pagination, detail drawer
- `InvoicesProvider`, `BudgetProvider`, `TagsProvider`, `DashboardProvider`, `ReportProvider`
- `PayoffProvider` — batch payment payoff modal
- `SelectPaymentsProvider` — row selection state for batch actions
- `CsvImportProvider` — multi-step CSV import wizard state

Each provider exposes a typed `useXxx()` hook. Calling the hook outside its provider throws an error.

Providers use a **filter reducer** internally with actions `SET_ALL`, `RESET`, `SET_FIELD`, and `SET_PAGINATION`. The TanStack Query list query is keyed by `["entity", localFilters]` — changing filters automatically triggers a refetch. URL query params are synced to filter state via `updateFiltersBySearchParams`.

### API / Service Layer

`src/services/index.ts` exports a single Axios instance (`apiDjango`) configured with:
- Base URL from `NEXT_PUBLIC_API_URL`
- `withCredentials: true` (cookie-based auth)
- Response interceptor that auto-retries on 401 by calling `refreshTokenAsync()`, then fires a `tokenRefreshFailed` CustomEvent if the refresh also fails (causing `AuthProvider` to sign the user out)

Services are organized under `src/services/financial/{payments,invoices,budget,payoff,report,tag}/` and `src/services/auth/`, `src/services/user/`.

### Theme System

`src/styles/theme.ts` defines a `colors` object that is injected as CSS custom properties (`:root { --color-... }`) via `addStyle`. It also exports `antdThemes` with Ant Design `ThemeConfig` objects for `light` and `dark` modes.

`ThemeProvider` reads/writes the `theme` key from `localStorage` and applies the class name to `<html>`. A blocking inline script in `src/app/layout.tsx` sets the class before hydration to prevent flash.

### Session Management

`src/sessionGate.ts` is a module-level singleton that tracks session status (`active | invalidating | invalid`). It is used during sign-out to prevent race conditions where in-flight requests trigger another token refresh.

### Testing

Tests use Jest + jsdom + `@testing-library/react`. Setup files are at:
- `src/jest.setupFiles.js`
- `src/jest.setupFilesAfterEnv.js`

`@faker-js/faker` is used for generating test data.

Component tests mock the feature provider hook at the module level:

```ts
jest.mock("@/components/providers/payments", () => ({
    usePayments: jest.fn(),
}));
// In beforeEach: (usePayments as jest.Mock).mockReturnValue({ ... });
```

Service tests mock `@/services` directly:

```ts
jest.mock("@/services", () => ({ apiDjango: { get: jest.fn(), post: jest.fn() } }));
```

Auth service tests use `jest.spyOn(apiAuth, 'method')` instead of `jest.mock` because service functions close over the module-level axios instance.

### CI

GitHub Actions (`.github/workflows/main.yml`) runs on push to `main`, `dev`, `feature/*` and on PRs to `main`. It runs: `yarn format`, `yarn lint`, `yarn coverage`.
