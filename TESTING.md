# Testing guide

## Suites

There are **20 baseline Jest cases** and **19 challenge Jest cases**. The separate API contract suite has **14 Node test-runner cases**; those are not Jest cases.

Baseline tests live next to their implementation in `src/app/vendors/*.spec.ts`. They check the API client, initial search success/error behavior, store initialization/filtering, real component templates, input/output wiring, and the editing scaffold.

Acceptance tests live in `tests/challenge/*.challenge.ts`. They are executable assertions, not disabled tests or `it.todo` placeholders. They describe the desired behavior and are intentionally red where the starter has defects or unfinished work.

| Acceptance file | Cases | What it checks |
| --- | ---: | --- |
| `search.challenge.ts` | 7 | 250 ms coalescing, result ordering, prompt cancellation, recovery, trimming/deduplication, loading state, teardown |
| `editor.challenge.ts` | 7 | Client validation, API payload, server response, pending state, duplicate saves, failure/retry, teardown |
| `state.challenge.ts` | 5 | Derived totals, immutability, selection, filtering after save, real OnPush rendering |

## Run subsets

```sh
npm test
npm run test:challenge -- search
npm run test:challenge -- editor
npm run test:challenge -- state
npm run test:challenge
```

`npm run verify` deliberately excludes acceptance tests so the provided starter can have a green infrastructure/build gate. `npm run verify:complete` adds them. The CI workflow exposes a manual `run_challenge` option; enable it when evaluating a completed submission.

## What the assertions actually exercise

HTTP tests use `provideHttpClient()` followed by `provideHttpClientTesting()` and `HttpTestingController`. They can flush requests in the wrong order without a real server or sleeping for seconds. The actual mock server's behavior has its own contract tests.

Search-service timing tests use Jest fake timers and `advanceTimersByTimeAsync`. Component tests use the zoneless TestBed environment and `fixture.whenStable()`. They do not use Angular's ZoneJS-only `fakeAsync` helpers.

The signal-rendering acceptance test intentionally does **not** call `fixture.detectChanges()` after the store update. A correct notification path must schedule the OnPush component's render. Calling detectChanges after every step would conceal this defect.

Tests check public behavior through the supplied service/component interfaces, not private RxJS operator names. Some acceptance checks are deliberately stronger than the minimum interview goal: immediate cancellation at the next keystroke, cleanup, and complete pending-state correctness. Explain a different but sound design rather than silently deleting those checks.

## Adding your regression test

Place a new baseline regression in an adjacent `.spec.ts` file, or extend a relevant acceptance file. Reproduce the failure, make the test fail for the right reason, implement the fix, and rerun it. At least one candidate-written test is part of the interview even though acceptance tests are supplied.

## Coverage

`npm run test:coverage` produces `coverage/baseline/index.html` and `lcov.info`. There is no arbitrary coverage-percentage hiring cutoff. A test that catches a real regression is more useful evidence than many creation-only tests.

## Troubleshooting

Run `npm run doctor` first. Use Node 24.15+ and install through `npm run setup`; do not substitute an unpinned TypeScript major or use `--legacy-peer-deps` to hide a dependency mismatch. For Codespaces startup logs, inspect `.cache/dev.log`. The setup gate stops on an install, typecheck, test, or build failure rather than claiming success.
