import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApiServer, searchDelay } from './server.mjs';

let server;
let base;
beforeEach(async () => {
  server = createApiServer({ delayScale: 0.02 });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
afterEach(async () => {
  const closed = new Promise((resolve) => server.close(resolve));
  server.closeAllConnections();
  await closed;
});
const list = async (q = '') => (await fetch(`${base}/api/vendors?q=${encodeURIComponent(q)}`)).json();
const update = (id, body) => fetch(`${base}/api/vendors/${id}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('mock API contract', () => {
  it('exposes health and 12 seeded vendors', async () => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, vendorCount: 12 });
    assert.equal((await list()).length, 12);
  });
  it('searches names and categories case-insensitively', async () => {
    assert.deepEqual((await list('  ACME ')).map((v) => v.id), ['v-001', 'v-002']);
    assert.deepEqual((await list('technology')).map((v) => v.id), ['v-007']);
  });
  it('returns an empty array for no matches', async () => {
    assert.deepEqual(await list('not-a-real-vendor'), []);
  });
  it('has deterministic latency to reproduce out-of-order requests', () => {
    assert.equal(searchDelay('a'), 1200);
    assert.equal(searchDelay('ac'), 900);
    assert.equal(searchDelay('acm'), 500);
    assert.equal(searchDelay('acme'), 150);
  });
  it('returns a repeatable 503 only for the error query', async () => {
    assert.equal((await fetch(`${base}/api/vendors?q=error`)).status, 503);
    assert.equal((await fetch(`${base}/api/vendors?q=acme`)).status, 200);
  });
  it('persists a valid status update and trims the note', async () => {
    const response = await update('v-001', { status: 'suspended', note: '  Missing required documents  ' });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'suspended');
    assert.equal(body.note, 'Missing required documents');
    assert.equal((await list('Acme Electrical'))[0].status, 'suspended');
  });
  it('allows a blank note for an active or pending status', async () => {
    assert.equal((await update('v-004', { status: 'active', note: '' })).status, 200);
  });
  it('rejects an invalid status without changing data', async () => {
    assert.equal((await update('v-001', { status: 'unknown', note: '' })).status, 400);
    assert.equal((await list('Acme Electrical'))[0].status, 'active');
  });
  it('rejects a short or whitespace-only suspension reason', async () => {
    assert.equal((await update('v-001', { status: 'suspended', note: '   short   ' })).status, 400);
    assert.equal((await update('v-001', { status: 'suspended', note: '            ' })).status, 400);
  });
  it('rejects notes over 200 characters', async () => {
    assert.equal((await update('v-001', { status: 'pending', note: 'x'.repeat(201) })).status, 400);
  });
  it('does not persist a deliberately failed save', async () => {
    const response = await update('v-001', { status: 'suspended', note: 'Review required [fail]' });
    assert.equal(response.status, 503);
    assert.equal((await list('Acme Electrical'))[0].status, 'active');
  });
  it('rejects malformed JSON and non-object bodies', async () => {
    assert.equal((await fetch(`${base}/api/vendors/v-001`, { method: 'PATCH', body: '{' })).status, 400);
    assert.equal((await update('v-001', null)).status, 400);
  });
  it('returns 404 for unknown records and routes', async () => {
    assert.equal((await update('missing', { status: 'active', note: '' })).status, 404);
    assert.equal((await fetch(`${base}/unknown`)).status, 404);
  });
  it('resets modified records to the original fixture', async () => {
    await update('v-001', { status: 'pending', note: 'Changed by a candidate' });
    assert.equal((await fetch(`${base}/api/reset`, { method: 'POST' })).status, 200);
    assert.equal((await list('Acme Electrical'))[0].status, 'active');
  });
});
