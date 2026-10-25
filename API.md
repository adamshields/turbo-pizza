# Mock HTTP API

The API is already implemented. You are not expected to change it during the interview.

It listens on `127.0.0.1:3001`. Angular proxies `/api/**` to it, so application code uses relative URLs. Only port 4200 needs to be forwarded in Codespaces.

## GET /api/vendors?q=acme

Returns `Vendor[]`, not an envelope. An empty query returns all 12 records. Search matches vendor name or category, ignoring letter case and surrounding spaces. Status filtering is client-side.

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

Requests intentionally have different delays:

| Query | Response delay |
| --- | ---: |
| `a` | 1,200 ms |
| `ac` | 900 ms |
| `acm` | 500 ms |
| Any other query, including `acme` or empty | 150 ms |

Search `a`, wait about 350 ms, then replace it with `acme`. The older, broader request can finish after the newer request. Inspect the browser Network panel as well as the displayed results.

The exact query **`error`** returns HTTP 503 every time. A later valid query still succeeds at the API. This is deterministic, not a random failure rate.

## PATCH /api/vendors/:id

Request:

```json
{ "status": "suspended", "note": "Required documents are missing" }
```

The response is the complete updated `Vendor`, including the authoritative `updatedAt`. Save latency is 450 ms.

Rules:

- Status must be `active`, `pending`, or `suspended`.
- `note` must be a string. The original string may not exceed 200 characters.
- For a suspended status, `note.trim().length` must be at least 10. Leading/trailing spaces do not count. Internal spaces do count.
- A note is optional for active and pending statuses; send an empty string when absent.
- Valid notes are trimmed before storage.

Any note containing **`[fail]`**, case-insensitively, produces HTTP 503 after normal validation. Example: `Required documents [fail]`. The record is not changed. Remove `[fail]` to retry successfully.

HTTP 400 means invalid input, 404 means unknown record, and 503 is the deterministic scenario above. Error bodies have `{ "message": "..." }`.

## GET /api/health

Returns `{ "ok": true, "vendorCount": 12 }` when the server is running.

## POST /api/reset

Restores the initial data. Prefer the supplied `npm run api:reset` command, then refresh the browser.

## Scope

This is an interview simulator, not a production backend. Every server instance owns its own in-memory array. GET responses snapshot records when a request is received. Stopping the API discards updates. The local server cancels its scheduled response when the client connection closes; do not infer that every real backend can roll back a write merely because the browser aborts a request.
