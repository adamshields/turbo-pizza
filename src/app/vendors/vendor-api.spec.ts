import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { makeVendor } from '../../../tests/fixtures';
import { VendorApi } from './vendor-api';

describe('VendorApi', () => {
  let api: VendorApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(VendorApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends a search query through HttpClient', () => {
    const result = jest.fn();
    api.search('acme electrical').subscribe(result);
    const request = http.expectOne((req) => req.url === '/api/vendors');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('acme electrical');
    request.flush([makeVendor()]);
    expect(result).toHaveBeenCalledWith([makeVendor()]);
  });

  it('loads the complete directory for an empty query', () => {
    api.search('').subscribe();
    const request = http.expectOne((req) => req.params.get('q') === '');
    request.flush([]);
  });

  it('sends the typed update payload and returns the server record', () => {
    const result = jest.fn();
    const update = { status: 'pending' as const, note: 'Review started' };
    api.update('v-001', update).subscribe(result);
    const request = http.expectOne('/api/vendors/v-001');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(update);
    const updated = makeVendor(update);
    request.flush(updated);
    expect(result).toHaveBeenCalledWith(updated);
  });

  it('propagates HTTP failures to its caller', () => {
    const failure = jest.fn();
    api.search('error').subscribe({ error: failure });
    http.expectOne((req) => req.params.get('q') === 'error').flush({ message: 'Unavailable' }, { status: 503, statusText: 'Service Unavailable' });
    expect(failure).toHaveBeenCalledWith(expect.objectContaining({ status: 503 }));
  });
});
