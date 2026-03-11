# Release Automation Analysis For Frontend

## Objective

Evaluate what can be reused from the backend release automation model in this Next.js frontend and what must be adapted to match the current repository structure, CI, and deployment model.

## Current frontend state

- Main application stack: Next.js 16 + React 19 + TypeScript
- Package manager: Yarn 1 (`packageManager: yarn@1.22.22`)
- Canonical version already exists in [`package.json`](../package.json)
- Current integration branch in the local repository: `develop`
- Existing CI workflow: [`.github/workflows/main.yml`](../.github/workflows/main.yml)
- Current workflow validates:
  - formatting
  - lint
  - type check
  - tests with coverage
  - production build

## What can be reused directly

The backend model is largely reusable at the process level.

### 1. Branching and release decision model

This part fits the frontend well:

- development on `develop`
- stable branch on `main`
- automation proposes a release PR from `develop` to `main`
- merge of that PR is the explicit approval point
- merge into `main` creates tag `vX.Y.Z` and GitHub Release

This is compatible with a frontend deployed through GitHub-based workflows or Vercel Git integration.

### 2. Semantic versioning derived from Conventional Commits

This is reusable without backend-specific coupling.

Recommended frontend bump rules:

- `BREAKING CHANGE` or `!` -> major
- `feat` -> minor
- `fix`, `refactor`, `test`, `docs`, `build`, and `chore` -> patch

This matches the engineering rules you already want in the repo and keeps tags, changelog, and deployed state aligned.

### 3. Release PR contents

The same release PR shape is valid for the frontend:

- version bump
- changelog summary
- release metadata

For this repo, the files are different, but the contract is the same.

### 4. Workflow split

The backend split into `ci.yml`, `release-pr.yml`, and `publish.yml` should also be used here. The separation is clean and maps well to this repository.

### 5. Repository-local release scripts

The backend decision to keep versioning logic in repository-local scripts instead of depending fully on a generic release tool is also a good fit here.

Reason:

- your flow is specifically `develop -> release PR -> main`
- local scripts make SemVer rules explicit
- frontend version sources and changelog generation are simple to edit in Node/TypeScript or shell

## What must be adapted for the frontend

### 1. Version ownership location

Backend uses `kawori/version.py`. That should not be copied as-is.

For this frontend, the best canonical version source is:

- `package.json`

Reason:

- the repo already has `version` at line 3
- Node/Next tooling already understands this file
- GitHub Actions can read and update it without inventing a second source of truth

Optional improvement:

- create `src/util/version.ts` that reads/export-builds the app version for runtime display or diagnostics

But that file should mirror `package.json`, not replace it as the canonical source.

### 2. Release preparation script implementation language

Backend uses Python scripts. For this frontend, Python is possible but not ideal.

Recommended adaptation:

- create a repo-local Node script, for example `scripts/prepare-release.mjs` or `scripts/prepare-release.ts`
- optionally create `scripts/extract-release-notes.mjs`

Reason:

- the repository is already Node/Yarn-based
- no extra runtime assumption is needed in CI besides Node
- editing `package.json` and `CHANGELOG.md` is natural in JS/TS

### 3. Deployment model

Backend deploys to a VM and runs a deploy script. That part is not directly reusable.

This frontend appears closer to a Vercel deployment model because:

- README references Vercel deployment
- the app uses `@vercel/analytics`
- the app uses `@vercel/speed-insights`
- Sentry config enables `automaticVercelMonitors`

So the backend `deploy_release.sh` and VM update process should be replaced by one of these frontend models:

- Vercel auto-deploy from `main`
- GitHub Action that marks the release as deploy-ready while Vercel deploys from Git integration
- GitHub Action that calls a hosting provider deployment API

Recommended default:

- keep GitHub responsible for release PR, tag, and GitHub Release
- let Vercel handle deployment from `main`

That preserves the same approval boundary without duplicating deployment concerns.

### 4. One-off execution contract

The backend has a strong concept of one-off operational scripts (`scripts.xml`, Django command, persistent execution registry). That does not translate directly to this frontend.

For a Next.js frontend, most releases do not need a one-off registry because there is no migration layer or server-side operational task runner in this repo.

This means:

- `scripts.xml` should not be copied
- `docs/oneoff-registry.md` is unnecessary unless this repo starts owning operational frontend migrations or external data repair tasks

If you still need a frontend release checklist for exceptional cases, adapt the concept into a lighter document such as:

- `docs/release-notes-ops.md`

Use it only for manual release follow-ups like:

- rotating env vars
- toggling feature flags
- invalidating CDN/cache
- updating third-party dashboard configuration

### 5. Current CI branch mismatch

The current workflow still listens to:

- `main`
- `dev`
- `feature/*`

But the repository is currently on `develop`.

That means the first adaptation is structural:

- replace `dev` with `develop`
- decide whether direct pushes to `feature/*` should continue to trigger full CI
- add PR validation for both `develop` and `main` if that matches the branch policy

## Recommended frontend implementation

### Phase 1: normalize policy

1. Standardize branch policy as `develop` and `main`.
2. Enforce Conventional Commits in team practice.
3. Add release documentation specific to the frontend.
4. Decide whether deployment is Vercel auto-deploy on `main`.

### Phase 2: prepare release automation

1. Add `CHANGELOG.md`.
2. Add `scripts/prepare-release.mjs`.
3. Add `scripts/extract-release-notes.mjs`.
4. Add `yarn release:prepare` script.
5. Create `.github/workflows/release-pr.yml` to open or update the PR from `develop` to `main`.

### Phase 3: publish on merge

1. Create `.github/workflows/publish.yml`.
2. On merge to `main`, validate again.
3. Create tag `vX.Y.Z` if missing.
4. Create GitHub Release using the matching changelog section.
5. Allow hosting provider deployment to happen from `main`.

### Phase 4: runtime and observability alignment

Optional but useful for frontend operations:

1. Expose the app version in a diagnostic endpoint, footer, or admin area.
2. Pass release version to Sentry so errors are tied to a tag/release.
3. Ensure the build knows the release version from `package.json` or the generated tag.

## Suggested file mapping from backend to frontend

- `kawori/version.py` -> `package.json`
- `scripts/prepare_release.py` -> `scripts/prepare-release.mjs`
- `scripts/extract_release_notes.py` -> `scripts/extract-release-notes.mjs`
- `.github/workflows/release-pr.yml` -> same name, adapted for Node/Yarn
- `.github/workflows/publish.yml` -> same name, adapted for frontend deploy target
- `scripts/deploy_release.sh` -> do not copy if Vercel deploys from `main`
- `scripts.xml` -> do not copy
- `docs/oneoff-registry.md` -> do not copy unless the frontend gets real release-only operational steps

## Recommended decisions for this repository

Based on the current codebase, the most coherent approach is:

1. Keep `package.json` as the canonical version source.
2. Reuse the backend release flow design almost entirely.
3. Reimplement release scripts in Node instead of Python.
4. Split the current CI into `ci.yml` and separate release workflows.
5. Replace VM deploy logic with Vercel-or-provider deployment from `main`.
6. Skip the backend one-off registry model for now.

## Immediate gaps before implementation

- The current workflow file should be renamed or split because it is only CI, not release automation.
- Branch naming must be corrected from `dev` to `develop`.
- The repository still lacks:
  - `CHANGELOG.md`
  - release scripts
  - release PR workflow
  - publish workflow
  - explicit frontend release documentation

## Conclusion

The backend model is reusable in its release governance, SemVer rules, release PR flow, and GitHub workflow split. The main adaptations are technical, not conceptual:

- use `package.json` instead of a Python version module
- use Node-based scripts instead of Python scripts
- use Vercel or frontend hosting deployment instead of a VM deploy script
- drop the backend-only one-off execution framework unless a real frontend operational need appears
