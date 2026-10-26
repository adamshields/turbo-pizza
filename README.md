# VendorDesk — pairing exercise

## Start here

VendorDesk is a small Angular vendor-management app for a 60-minute pairing interview. You can search and filter a directory of vendors, see summary counts, and edit a vendor's status and note.

The Codespace installs dependencies, runs the starter checks, and starts the app and local API automatically. Wait for Angular to finish compiling, then use forwarded port **4200**. You should not need to install or start anything yourself.

Link

http://localhost:4200

## The assignment

Operations reports that search sometimes shows the wrong vendors. The status editor is unfinished, and after an edit the directory, summary, and selected vendor can disagree.

Investigate these reports, make a small and understandable fix, and demonstrate how you verified it. The app, sample data, API, and test harness are supplied; focus on the Angular application rather than setup or styling.

**Session:** 60 minutes. The interviewer will assess your investigation, implementation, communication, and verification—not how many assertions you finish.

### 1. Make search reliable

Try entering `a`, wait about 350 ms, then replace it with `acme`. The requests have different response delays, so an older search can finish after a newer one. Check both the Network panel and the displayed results.

The latest query should determine the displayed results. Coalesce rapid changes for **250 ms**, ignore repeated queries that differ only in surrounding spaces, and keep searching after an individual request fails. Show understandable loading and error states.

The local API returns 12 sample vendors for an empty query and searches names and categories without regard to case or surrounding spaces. The `a`, `ac`, and `acm` requests take 1,200, 900, and 500 ms respectively; other searches take 150 ms. The exact query `error` returns HTTP 503, and later searches can still succeed.

### 2. Complete status editing

Choose **Edit** on a vendor. The form is provided, but saving is unfinished. Complete these behaviors:

1. Save one of the supported statuses (`active`, `pending`, or `suspended`) and the note through the supplied API. Use the complete vendor record returned by the server; do not guess a replacement locally. Show when a save is pending and prevent duplicate saves.
2. A suspended vendor needs a note with at least 10 non-whitespace characters. Notes may not exceed 200 characters. Show a field-level validation message and do not send invalid requests. Active and pending vendors may have an empty note.
3. On a failed save, preserve the user's input, show an error, clear the pending state, and allow a retry.
4. After a successful save, keep the directory, summary, and selected details in agreement without reloading. If the vendor no longer matches the selected status filter, remove it from that view and close its editor.

Notes are trimmed before storage. A note containing `[fail]` triggers a repeatable HTTP 503 after validation; remove it to retry successfully. The API returns the updated vendor, including its authoritative `updatedAt` value.

The summary cards count the current search results **before** the status filter. The directory count reflects the filter. This is intentional.

## Working the interview

Talk through the problem, ask for clarification, and explain your reasoning rather than silently coding as fast as possible. Make small, understandable changes that preserve control and clarity.

The app uses Angular 22, standalone components, signals, zoneless change detection, and typed reactive forms. Keep the existing patterns where appropriate. You do not need to add a state-management library, rewrite the project, or change the API delays. A different sound design is fine if you can explain it and preserve the expected behavior.

## How to verify your work

| Command | Purpose |
| --- | --- |
| `npm test` | Run baseline tests. These should pass before and after your changes. |
| `npm run test:challenge` | Run behavior tests; some are expected to fail in the starter. |
| `npm run test:challenge -- search` | Run search behavior tests only. |
| `npm run test:challenge -- editor` | Run editing behavior tests only. |
| `npm run test:challenge -- state` | Run shared-state and view-consistency tests only. |
| `npm run test:api` | Run contract tests for the supplied API. |

Add at least one regression test. Be ready to explain what it checks and why it would have failed before your fix. Prefer observable behavior over testing a private method or a particular implementation choice. Do not remove assertions or replace the requested behavior with hard-coded results.

Some challenge tests also cover stretch concerns such as cancellation during the debounce window, cleanup, and in-flight saves. Prioritize the required user-visible behavior, and discuss any remaining edge cases with your interviewer.

## Suggested pacing

| Time | Goal |
| --- | --- |
| 0–10 min | Reproduce the reports and explain the relevant request and state flow. |
| 10–20 min | Identify the search root cause and add or plan a focused regression test. |
| 20–35 min | Implement a coherent search fix. |
| 35–50 min | Complete validation and save behavior. |
| 50–55 min | Check shared-state consistency and run targeted tests. |
| 55–60 min | Demonstrate a success and failure path; summarize the work. |

You do not need to finish every stretch case. Prioritize a correct, understandable solution and verification over breadth.

## Final handoff

Leave your changes on the supplied branch. Be ready to summarize what changed, show the relevant test results, demonstrate one successful flow and one failure flow, and identify one remaining limitation and your next verification step.

