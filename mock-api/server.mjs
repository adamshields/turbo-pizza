import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { initialVendors } from './data.mjs';

const statuses = new Set(['active', 'pending', 'suspended']);

export function searchDelay(query) {
  const q = query.trim().toLowerCase();
  if (q === 'a') return 1200;
  if (q === 'ac') return 900;
  if (q === 'acm') return 500;
  return 150;
}

function sendJson(response, status, data) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(data));
}

function later(response, milliseconds, callback) {
  const timer = setTimeout(() => {
    if (!response.destroyed && !response.writableEnded) callback();
  }, milliseconds);
  response.once('close', () => clearTimeout(timer));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk.toString();
    if (body.length > 16384) throw new Error('Request body is too large.');
  }
  const value = JSON.parse(body || '{}');
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Request body must be a JSON object.');
  }
  return value;
}

/** Each server instance has independent, resettable in-memory data. */
export function createApiServer({ delayScale = 1, log = false } = {}) {
  let vendors = structuredClone(initialVendors);
  let sequence = 0;
  return createServer(async (request, response) => {
    const id = ++sequence;
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (log) console.log(`[api ${id}] ${request.method} ${url.pathname}${url.search}`);
    try {
      if (request.method === 'GET' && url.pathname === '/api/health') {
        sendJson(response, 200, { ok: true, vendorCount: vendors.length });
        return;
      }
      if (request.method === 'POST' && url.pathname === '/api/reset') {
        vendors = structuredClone(initialVendors);
        sendJson(response, 200, { ok: true, vendorCount: vendors.length });
        return;
      }
      if (request.method === 'GET' && url.pathname === '/api/vendors') {
        const query = (url.searchParams.get('q') ?? '').trim().toLowerCase();
        // Capture a snapshot at request time: a late response can genuinely be stale.
        const matches = structuredClone(vendors.filter((vendor) =>
          `${vendor.name} ${vendor.category}`.toLowerCase().includes(query),
        ));
        later(response, searchDelay(query) * delayScale, () => {
          if (query === 'error') {
            sendJson(response, 503, { message: 'Simulated search failure. Try another query.' });
          } else {
            sendJson(response, 200, matches);
          }
        });
        return;
      }
      const match = /^\/api\/vendors\/([^/]+)$/.exec(url.pathname);
      if (request.method === 'PATCH' && match) {
        const vendorId = decodeURIComponent(match[1]);
        const index = vendors.findIndex((vendor) => vendor.id === vendorId);
        if (index < 0) {
          sendJson(response, 404, { message: 'Vendor not found.' });
          return;
        }
        let body;
        try { body = await readJson(request); }
        catch {
          sendJson(response, 400, { message: 'Expected a JSON object with status and note.' });
          return;
        }
        if (!statuses.has(body.status) || typeof body.note !== 'string') {
          sendJson(response, 400, { message: 'Provide a valid status and a string note.' });
          return;
        }
        const note = body.note.trim();
        if (body.note.length > 200 || (body.status === 'suspended' && note.length < 10)) {
          sendJson(response, 400, { message: 'A suspension needs at least 10 characters. Notes must not exceed 200 characters.' });
          return;
        }
        later(response, 450 * delayScale, () => {
          if (note.toLowerCase().includes('[fail]')) {
            sendJson(response, 503, { message: 'Simulated save failure. Your changes were not saved.' });
            return;
          }
          const updated = { ...vendors[index], status: body.status, note, updatedAt: new Date().toISOString() };
          vendors = vendors.map((vendor) => vendor.id === vendorId ? updated : vendor);
          sendJson(response, 200, updated);
        });
        return;
      }
      sendJson(response, 404, { message: 'Route not found.' });
    } catch (error) {
      if (log) console.error('[api]', error);
      sendJson(response, 500, { message: 'Unexpected mock API error.' });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env['API_PORT'] ?? 3001);
  const server = createApiServer({ log: true });
  server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Mock API: http://127.0.0.1:${port}`));
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
