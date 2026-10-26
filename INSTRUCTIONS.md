# VendorDesk — Angular pairing exercise

http://localhost:4200

VendorDesk is a small Angular vendor-management app for a 60-minute pairing interview. You can search and filter a directory of vendors, see summary counts, and edit a vendor's status and note. Parts of it are unfinished or broken on purpose. Your job is to investigate, fix, and verify them.

This file is the complete handout.

## Contents

1. [Open the app](#1-open-the-app)
2. [The assignment](#2-the-assignment)
3. [Working the interview](#3-working-the-interview)
4. [Verify your work](#4-verify-your-work)
5. [Suggested pacing](#5-suggested-pacing)
6. [Final handoff](#6-final-handoff)
7. [API reference](#7-api-reference)
8. [Project layout](#8-project-layout)
9. [Stack](#9-stack)

## 1. Open the app

Do this first. The Codespace starts the app and its API for you, so you don't install or run anything.

1. Open the **Ports** tab in the Codespace.
2. Find port **4200** (labeled VendorDesk) and choose **Open in Browser**.

The address at the top of this file, `http://localhost:4200`, works only in the desktop VS Code app. In a browser Codespace, use the Ports tab.

If the page is blank or shows an error, wait a minute. Angular may still be compiling.

### What you'll see

- **Summary cards** at the top count the vendors matching the current search, before the status filter is applied.
- **Vendor directory** lists the vendors matching the search and status filter. The "results" count reflects the filter.
- **Search** matches vendor name or category, ignoring letter case and surrounding spaces. An empty search shows all 12 sample vendors.
- **Status filter** narrows the directory to all, active, pending review, or suspended.
- **Edit** on a row selects that vendor and opens the details editor on the right, where you can change the status and note.

Sample data lives in memory on the local API. Changes persist until the API restarts. To restore the sample data, run `npm run api:reset` in the terminal, then refresh the browser.

## 2. The assignment

Operations reports that search sometimes shows the wrong vendors. The status editor is unfinished, and after an edit the directory, summary, and selected vendor can disagree.

Investigate these reports, make a small and understandable fix, and demonstrate how you verified it. The app, sample data, API, and test harness are supplied. Focus on the Angular application rather than setup or styling.

### 2.1 Make search reliable

Operations reports that the list sometimes shows vendors for a search the user has already replaced. This section explains how to see that, what the correct behavior is, and how to know your fix works.

#### Reproduce the bug

1. Open the **Network** tab in the browser developer tools and keep it open.
2. In the search box, type `a`. Wait about 350 ms. A request for `/api/vendors?q=a` appears. The API takes about 1.2 seconds to answer it.
3. Without waiting for that request, clear the box and type `acme`. A request for `/api/vendors?q=acme` appears. The API answers it in about 150 ms.
4. Watch the directory and the Network panel for the next two seconds.

Timeline with the sample API:

| Time | What happens | What the user should see |
| --- | --- | --- |
| 0 ms | You type `a`. Request A starts. | "Searching vendors…" |
| about 350 ms | You type `acme`. Request B starts. | Still "Searching vendors…" |
| about 500 ms | Request B finishes with the `acme` vendors. | The `acme` results: Acme Electrical and Acme Plumbing |
| about 1,200 ms | Request A finishes with the broader `a` results. | The directory should still show the `acme` results |

If the directory changes to the broader `a` results at about 1,200 ms, you have reproduced the bug. The Network panel shows both requests, so you can check their order and timing even when the displayed results are wrong.

#### Required behavior

Each rule below has a concrete check you can run in the app.

- **The latest query determines the results.** After you stop typing, the directory shows results for the query in the box. A late answer to an older query must never replace them. Check it with the timeline above.
- **Rapid typing sends one request.** Type `acme` one letter at a time, quickly. The Network panel should show a single request for `q=acme`, sent about 250 ms after the last keystroke. Coalesce changes for **250 ms**.
- **Spaces do not count.** Typing `  acme ` should not send a new request if the last search was `acme`. Ignore repeated queries that differ only in surrounding spaces.
- **One failed search does not stop the next.** Type `error`. The HTTP 503 response should show a search error in the results area. Then type `acme`. Its results should appear and the error should clear. Keep searching after an individual request fails.
- **Loading and error states are visible.** While a search is pending, the results area shows that it is loading. After a failure, it shows an understandable message, not an empty list with no explanation.

The API response delays are fixed. The `a` query takes 1,200 ms, `ac` takes 900 ms, `acm` takes 500 ms, and every other query takes 150 ms. See [section 7](#7-api-reference). Do not change them.

#### Done when

- The timeline in "Reproduce the bug" no longer produces the `a` results after `acme`.
- Typing `acme` one letter at a time sends one Network request for `q=acme`.
- Typing `error`, then `acme`, shows the error and then the `acme` results.
- You have at least one regression test that fails before your fix and passes after it. Section 4 explains how to write it.

### 2.2 Complete status editing

Choose **Edit** on a vendor. The form is provided, but saving is unfinished.

1. **Save** one of the supported statuses (`active`, `pending`, or `suspended`) and the note through the supplied API (`VendorApi.update`). Use the complete vendor record the server returns; do not guess a replacement locally. Show when a save is pending and prevent duplicate saves.
2. **Validate the note.** A suspended vendor needs a note with at least 10 non-whitespace characters. Notes may not exceed 200 characters. Show a field-level validation message and do not send invalid requests. Active and pending vendors may have an empty note.
3. **Handle failure.** On a failed save, preserve the user's input, show an error, clear the pending state, and allow a retry.
4. **Keep the views in agreement.** After a successful save, the directory, summary, and selected details must agree without reloading the page. If the vendor no longer matches the selected status filter, remove it from that view and close its editor.

Notes are trimmed before storage. A note containing `[fail]` (any letter case) triggers a repeatable HTTP 503 after validation. Remove `[fail]` to retry successfully. The API returns the updated vendor with its authoritative `updatedAt` value.

## 3. Working the interview

Talk through the problem, ask for clarification, and explain your reasoning rather than silently coding as fast as possible. Make small, understandable changes that preserve control and clarity.

Ask your interviewer what AI assistance is allowed for this round before you start.

The app uses Angular 22, standalone components, signals, zoneless change detection, and typed reactive forms. Keep the existing patterns where appropriate. You do not need to add a state-management library, rewrite the project, or change the API delays. A different sound design is fine if you can explain it and preserve the expected behavior. Ask for a documentation pointer rather than getting stuck on a method name.

Discussion topics for stretch time:

- Cancelling a request during the 250 ms debounce window.
- Subscription lifetime and cleanup when the page or editor is destroyed.
- Switching to another vendor while a save is in flight.
- Where state should live if a second route needs the same vendor.

## 4. Verify your work

| Command | Purpose |
| --- | --- |
| `npm test` | Baseline Jest suite. Should pass before and after your changes. |
| `npm run test:challenge` | Acceptance tests. Some fail in the starter by design. |
| `npm run test:challenge -- search` | Search acceptance tests only. |
| `npm run test:challenge -- editor` | Editing acceptance tests only. |
| `npm run test:challenge -- state` | Shared-state and view-consistency tests only. |
| `npm run test:api` | Contract tests for the supplied API. |
| `npm run typecheck` | TypeScript checks for app and spec code. |
| `npm run build` | Production build. |
| `npm run test:coverage` | Baseline coverage into `coverage/baseline/`. |

### Test layout

- **Baseline tests** live next to the code in `src/app/vendors/*.spec.ts`. They cover the API client, initial search, store filtering, component templates, input/output wiring, and the editor scaffold.
- **Acceptance tests** live in `tests/challenge/*.challenge.ts`. They are executable assertions that describe the desired behavior. Read them to see exactly what is checked.
  - `search.challenge.ts`: 250 ms coalescing, result ordering, cancellation, recovery, trimming and deduplication, loading state, teardown.
  - `editor.challenge.ts`: client validation, API payload, server response, pending state, duplicate saves, failure and retry, teardown.
  - `state.challenge.ts`: derived totals, immutability, selection, filtering after a save, OnPush rendering.
- Search timing tests use Jest fake timers. Component tests use the zoneless TestBed environment with `fixture.whenStable()`.
- The rendering acceptance test deliberately does not call `fixture.detectChanges()` after the store update. A correct change notifies the OnPush component by itself.

Acceptance tests check behavior through the public service and component interfaces, not private RxJS operators. Some checks are stronger than the minimum requirement, such as immediate cancellation at the next keystroke. If you choose a different sound design, explain it rather than deleting the check.

### Regression test (required)

Add at least one regression test of your own, in an adjacent `.spec.ts` file or in a relevant acceptance file. Reproduce the bug, confirm the test fails for the right reason, implement the fix, and rerun the test. Be ready to explain what the test checks and why it would have failed before your fix. Prefer observable behavior over testing a private method. Do not remove assertions or hard-code results.

## 5. Suggested pacing

| Time | Goal |
| --- | --- |
| 0–10 min | Reproduce the reports and explain the request and state flow. |
| 10–20 min | Identify the search root cause and add or plan a focused regression test. |
| 20–35 min | Implement a coherent search fix. |
| 35–50 min | Complete validation and save behavior. |
| 50–55 min | Check shared-state consistency and run targeted tests. |
| 55–60 min | Demonstrate a success path and a failure path; summarize the work. |

You do not need to finish every stretch case. A correct, understandable solution with real verification is worth more than breadth.

## 6. Final handoff

Leave your changes on the branch you were given. Be ready to:

- Summarize what changed and why.
- Show the relevant test results.
- Demonstrate one successful flow and one failure flow in the running app.
- Name one remaining limitation and your next verification step.

## 7. API reference

The API is implemented and you are not expected to change it. Application code calls it through relative `/api/**` URLs.

### GET `/api/vendors?q=<query>`

Returns a `Vendor[]` array (no envelope). An empty query returns all 12 records. Matching ignores letter case and surrounding spaces. Status filtering happens in the client.

```json
[
  {
    "id": "v-001",
    "name": "Acme Electrical",
    "category": "Electrical",
    "contact": "Jordan Ellis",
    "email": "acme@vendors.example",
    "status": "active",
    "annualSpend": 128000,
    "note": "",
    "updatedAt": "2026-10-01T12:00:00.000Z"
  }
]
```

Response delays by query:

| Query | Delay |
| --- | ---: |
| `a` | 1,200 ms |
| `ac` | 900 ms |
| `acm` | 500 ms |
| Any other query, including `acme` and empty | 150 ms |

The exact query `error` returns HTTP 503 every time. A later valid query still succeeds. This is deterministic, not a random failure rate.

### PATCH `/api/vendors/:id`

Request:

```json
{ "status": "suspended", "note": "Required documents are missing" }
```

Returns the complete updated `Vendor`, including the authoritative `updatedAt`. Save latency is 450 ms.

Rules:

- `status` must be `active`, `pending`, or `suspended`.
- `note` must be a string of at most 200 characters, counted before trimming.
- For `suspended`, `note.trim()` must be at least 10 characters. Internal spaces count.
- For `active` and `pending`, an empty note is allowed. Send `""` when there is no note.
- Valid notes are trimmed before they are stored.
- A note containing `[fail]` (any letter case) returns HTTP 503 after validation. The record does not change. Remove `[fail]` to retry successfully.

Errors return `{ "message": "..." }`. HTTP 400 means invalid input, 404 means unknown vendor, and 503 is the deliberate failure scenario.

### GET `/api/health`

Returns `{ "ok": true, "vendorCount": 12 }` while the server is running.

### POST `/api/reset`

Restores the original sample data. From the terminal, `npm run api:reset` does the same thing, then refresh the browser.

### Scope

This is an interview simulator, not a production backend. Data lives in memory and is lost when the API restarts. Each GET response reflects the records at the moment the request arrives. If a browser aborts a request, the local server cancels its scheduled response. Do not assume that every real backend can roll back a write because a browser cancelled a request.

## 8. Project layout

| Path | Contents |
| --- | --- |
| `src/app/vendors/vendor-page.*` | Page: search box, status filter, directory table, editor wiring. |
| `src/app/vendors/vendor-search.ts` | Search service. Calls the API and tracks loading and error state. |
| `src/app/vendors/vendor-store.ts` | Shared signals: vendors, selection, filter, and derived lists and counts. |
| `src/app/vendors/vendor-editor.*` | Details form for status and note. |
| `src/app/vendors/vendor-api.ts` | HTTP client for `GET /api/vendors` and `PATCH /api/vendors/:id`. |
| `src/app/vendors/vendor.model.ts` | `Vendor` type, statuses, and the status filter. |
| `src/app/vendors/vendor-summary.ts` | Summary cards. |
| `src/app/vendors/*.spec.ts` | Baseline tests. |
| `tests/challenge/*.challenge.ts` | Acceptance tests. |
| `tests/fixtures.ts` | Shared test vendor factory. |
| `mock-api/` | In-memory API server, sample data, and API contract tests. |

## 9. Stack

| Component | Version |
| --- | --- |
| Angular framework | 22.2.3 |
| Angular CLI and build | 22.2.4 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| Jest and jest-environment-jsdom | 30.5.2 |
| jest-preset-angular | 17.0.3 |

Do not use `--legacy-peer-deps` or change package versions to work around a dependency problem. Tell your interviewer instead.
