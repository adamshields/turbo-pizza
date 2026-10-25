import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { makeVendor } from '../../../tests/fixtures';
import { VendorSearch } from './vendor-search';
import { VendorStore } from './vendor-store';

describe('VendorSearch baseline', () => {
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
  it('places a successful search response in the store', async () => {
    search.find('acme');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'acme').flush([makeVendor()]);
    expect(store.vendors()).toEqual([makeVendor()]);
    expect(search.loading()).toBe(false);
    expect(search.error()).toBeNull();
  });
  it('exposes an error and stops loading when a request fails', async () => {
    search.find('error');
    await jest.advanceTimersByTimeAsync(300);
    http.expectOne((req) => req.params.get('q') === 'error').flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(search.error()).toBeTruthy();
    expect(search.loading()).toBe(false);
  });
});
