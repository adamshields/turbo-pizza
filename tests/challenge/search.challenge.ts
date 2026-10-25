import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VendorSearch } from '../../src/app/vendors/vendor-search';
import { VendorStore } from '../../src/app/vendors/vendor-store';
import { makeVendor } from '../fixtures';

describe('Acceptance: resilient search', () => {
  let search: VendorSearch;
  let store: VendorStore;
  let http: HttpTestingController;
  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), VendorSearch] });
    search = TestBed.inject(VendorSearch);
    store = TestBed.inject(VendorStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    try { http.verify({ ignoreCancelled: true }); } finally { jest.useRealTimers(); }
  });

  it('coalesces rapid keystrokes into a single request after 250 ms', async () => {
    search.find('a'); search.find('ac'); search.find('acm'); search.find('acme');
    await jest.advanceTimersByTimeAsync(249);
    const early = http.match((req) => req.url === '/api/vendors');
    early.forEach((request) => { if (!request.cancelled) request.flush([]); });
    expect(early).toHaveLength(0);
    await jest.advanceTimersByTimeAsync(1);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([makeVendor()]);
  });

  it('does not allow an older response to overwrite the newest results', async () => {
    search.find('a');
    await jest.advanceTimersByTimeAsync(300);
    const old = http.expectOne((req) => req.params.get('q') === 'a');
    search.find('acme');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([makeVendor()]);
    if (!old.cancelled) old.flush([makeVendor({ id: 'v-004', name: 'Atlas Safety' })]);
    expect(store.vendors().map((vendor) => vendor.id)).toEqual(['v-001']);
  });

  it('cancels the obsolete HTTP request as soon as a new query arrives', async () => {
    search.find('a');
    await jest.advanceTimersByTimeAsync(300);
    const old = http.expectOne((req) => req.params.get('q') === 'a');
    search.find('acme');
    const wasCancelled = old.cancelled;
    if (!old.cancelled) old.flush([]);
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([]);
    expect(wasCancelled).toBe(true);
  });

  it('continues accepting searches after a failed request', async () => {
    search.find('error');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'error').flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(search.error()).toBeTruthy();
    search.find('acme');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([makeVendor()]);
    expect(store.vendors()).toEqual([makeVendor()]);
    expect(search.error()).toBeNull();
    expect(search.loading()).toBe(false);
  });

  it('trims input and ignores consecutive equivalent queries', async () => {
    search.find('acme');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([]);
    search.find('  acme  ');
    await jest.advanceTimersByTimeAsync(300);
    const repeated = http.match((req) => req.url === '/api/vendors');
    repeated.forEach((request) => { if (!request.cancelled) request.flush([]); });
    expect(repeated).toHaveLength(0);
  });

  it('keeps loading true while the replacement request is in flight', async () => {
    search.find('a');
    await jest.advanceTimersByTimeAsync(300);
    const old = http.expectOne((req) => req.params.get('q') === 'a');
    search.find('acme');
    await jest.advanceTimersByTimeAsync(300);
    const current = http.expectOne((req) => req.params.get('q') === 'acme');
    if (!old.cancelled) old.flush([]);
    const loadingDuringCurrentRequest = search.loading();
    current.flush([makeVendor()]);
    expect(loadingDuringCurrentRequest).toBe(true);
    expect(search.loading()).toBe(false);
  });

  it('cancels in-flight requests when its injector is destroyed', async () => {
    search.find('a');
    await jest.advanceTimersByTimeAsync(300);
    const request = http.expectOne((req) => req.params.get('q') === 'a');
    TestBed.resetTestingModule();
    expect(request.cancelled).toBe(true);
  });
});
