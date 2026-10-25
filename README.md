# VendorDesk — Angular 22 interview workspace

A small vendor-management application for a 60-minute pairing interview. Read **CANDIDATE.md** before changing code.

The app intentionally includes incomplete behavior. The environment, API, styling, and test harness are supplied so the exercise is about Angular rather than setup or CSS.

## Start in GitHub Codespaces

Open this repository in a Codespace. The devcontainer installs Node 24, installs dependencies, runs the starter verification gate, and requests an automatic launch of the API and Angular dev server. Open forwarded **port 4200** after compilation finishes.

If the server did not start, check `.cache/dev.log`, then run:

```sh
npm run setup
npm start
```

To stop the automatically started session before starting one in your terminal:

```sh
npm run dev:stop
npm start
```

## Start locally

Use Node **24.15 or newer within the Node 24 line**. With nvm:

```sh
nvm install 24
nvm use 24
npm run setup
npm start
```

Open `http://localhost:4200`. `npm start` runs the Angular dev server and the in-memory HTTP API together. It works without Docker; the devcontainer is optional for local work. On Windows without nvm, install a supported Node 24 release first, then use the same npm commands.

`npm run setup` installs dependencies and runs `npm run verify`. On the first install it creates `package-lock.json`; commit that file before interviews. Later setups use `npm ci`. This delivered source kit does not contain an invented or unverified lockfile.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the app and API together. |
| `npm test` | Run the baseline Jest suite. Expected green before and after the work. |
| `npm run test:watch` | Watch the baseline tests. |
| `npm run test:challenge` | Run acceptance tests. Some intentionally fail in the starter. |
| `npm run test:challenge -- search` | Run only the search acceptance tests. |
| `npm run test:challenge -- editor` | Run only the editing acceptance tests. |
| `npm run test:challenge -- state` | Run only the shared-state acceptance tests. |
| `npm run test:coverage` | Produce baseline coverage in `coverage/baseline/`. |
| `npm run test:api` | Run standalone Node HTTP API contract tests. |
| `npm run verify` | Prerequisites, TypeScript checks, baseline Jest, API tests, production build. |
| `npm run verify:complete` | Everything above, plus challenge acceptance tests. |
| `npm run api:reset` | Reset the running API's records; then refresh the browser. |

Tests are run through **Jest directly**, not `ng test`. No Karma or Vitest runner is configured. See **TESTING.md**.

## What is in the codebase?

```text
src/app/
  app.ts                       Application shell
  app.config.ts                Standalone application providers
  app.routes.ts                Lazy-loaded vendor route
  vendors/
    vendor-page.ts / .html      Search field, directory, selected editor
    vendor-api.ts              Typed HttpClient calls
    vendor-search.ts           Search orchestration
    vendor-store.ts            Shared signal state and derived values
    vendor-editor.ts / .html    Typed reactive-form editing scaffold
    vendor-summary.ts          Separate OnPush summary component
    status-badge.ts            @switch status presentation
    vendor.model.ts            Domain types
mock-api/                      Actual local HTTP server and sample data
src/**/*.spec.ts               Baseline Jest tests
tests/challenge/              Acceptance tests for the requested behavior
.devcontainer/                 Codespaces setup
.github/workflows/ci.yml        Install/build/test verification
```

All application components are standalone. Templates use `@if`, `@for`, `@empty`, and `@switch`; there are no `*ngIf`/`*ngFor` templates or custom NgModules. State uses signals and computed values. The app and Jest TestBed are zoneless. Forms use typed reactive forms; you are not required to introduce a different forms API.

## API and data

See **API.md** for endpoints, validation, deterministic delays, and failure scenarios. Everything is local sample data. No database, API keys, cloud account, or external API is needed. Data survives browser refreshes while the API process remains running and resets when that process restarts.

## Baseline versus acceptance

A successful baseline run demonstrates that the supplied workspace works; it does **not** mean the interview tickets are complete. The acceptance suite checks the target behavior, including stretch cases. Do not delete assertions to make a report green. Discuss a legitimate implementation/test-contract change with the interviewer.

## Dependency versions and delivery verification

See **DEPENDENCIES.md** for the pinned stack and source references. The first online setup must pass before an interview. `DELIVERY-NOTE.md` records the execution limitation. The full kit's `VALIDATION.md` contains the detailed evidence.
