# Candidate brief — Variant A: Search correctness

**Scenario:** You have joined the team maintaining VendorDesk. Operations reports that search sometimes shows the wrong vendors, and the status editor has not been completed.

**Session:** 60 minutes. The interviewer will assess your understanding, debugging, implementation, and verification—not just how many assertions you finish.

## Ticket 1 — Make search reliable

Reproduce the report: enter `a`, wait about 350 ms, then replace it with `acme`. Requests have deliberate, deterministic delays. Observe the Network panel and the eventual results.

The latest query should determine the displayed results. Coalesce rapid changes for **250 ms**, ignore repeated queries that differ only in surrounding spaces, and keep searching after an individual request fails. The exact query `error` triggers the failure scenario.

Think about loading/error state as well as the happy path. Explain the root cause before changing code.

## Ticket 2 — Complete status editing

Choose Edit on a vendor. The form is present, but saving is unfinished. Implement the feature acceptance criteria below. Check the summary and filtered list after a successful update; a second reported symptom is that views can disagree after editing.


## Working agreement

This is a pairing session, not a typing-speed contest. Ask clarifying questions, explain the behavior you observe, and make the smallest understandable change. Documentation is allowed. Confirm the AI-assistance rule with your interviewer before using it; it must be the same for every candidate in the round.

Keep the existing standalone components and modern template syntax. You do not need to change styling, add a state-management library, or rewrite the project. Typed reactive forms are supplied; a new forms API is not required. A correct alternative architecture is welcome when you can explain it and preserve the observable behavior.

The app uses Angular 22 and zoneless change detection. Recent API recall is not the entire assessment: ask for a documentation pointer rather than getting stuck on a method name.

## Feature acceptance criteria

The server API is already implemented; its contract is in **API.md**.

1. Submit a status and note through `VendorApi.update`. Emit the **returned server record**, not a locally guessed replacement. Show that a request is pending and prevent duplicate saves.
2. A suspended status requires `note.trim().length >= 10`. Notes must not exceed 200 characters. Display a field-level message and do not send invalid requests. Active and pending statuses allow an empty note.
3. On failure, retain the user's input, show an error, clear the pending state, and allow a retry. A note containing `[fail]` reliably triggers a 503 after validation.
4. On success, the directory, summary, and selected details must agree without reloading the page. If the saved vendor no longer matches the selected status filter, remove it from that view and close its editor.

The summary cards count the **current search results before the status filter**. The table count reflects the status filter. This is intentional product behavior, not a bug.

## Test your work

`npm test` is the baseline suite and should stay green. `npm run test:challenge` is the target acceptance suite; failures in the starter are intentional. `TESTING.md` explains the split and subset commands.

Add at least one regression test yourself. Explain why it would have failed before your change. Prefer observable behavior to testing a private method or whether you happened to choose a particular operator.

## Suggested use of the hour

First understand and reproduce the reported behavior. Spend most of the time on a coherent fix and the editing feature. Leave time to demonstrate a failure path and explain a test. Finishing every stretch assertion is not a prerequisite for a useful interview.

## Stretch discussion

Discuss request cancellation during the debounce window, subscription lifetime, switching vendors while a save is in flight, and state ownership if a second route needs the same vendor. Identify one test you would add with more time.

## Submission

Leave your changes on the supplied branch. Run the relevant tests and show the result. Briefly summarize what you changed, what remains, and your next verification step. Do not change the API delays, remove assertions, or replace the requested behavior with hard-coded sample results.
