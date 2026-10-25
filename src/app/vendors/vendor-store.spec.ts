import { TestBed } from '@angular/core/testing';
import { makeVendor } from '../../../tests/fixtures';
import { VendorStore } from './vendor-store';

describe('VendorStore baseline', () => {
  let store: VendorStore;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(VendorStore);
  });

  it('starts with no records or selection', () => {
    expect(store.vendors()).toEqual([]);
    expect(store.selectedVendor()).toBeNull();
    expect(store.summary()).toEqual({ total: 0, active: 0, pending: 0, suspended: 0 });
  });
  it('derives a summary from the current search results', () => {
    store.setVendors([makeVendor(), makeVendor({ id: 'v-002', status: 'pending' })]);
    expect(store.summary()).toEqual({ total: 2, active: 1, pending: 1, suspended: 0 });
  });
  it('filters results without changing the search-result totals', () => {
    store.setVendors([makeVendor(), makeVendor({ id: 'v-002', status: 'pending' })]);
    store.setFilter('pending');
    expect(store.filteredVendors().map((v) => v.id)).toEqual(['v-002']);
    expect(store.summary().total).toBe(2);
  });
  it('resolves selection by ID instead of storing a second vendor copy', () => {
    store.setVendors([makeVendor()]);
    store.select('v-001');
    expect(store.selectedVendor()?.name).toBe('Acme Electrical');
  });
  it('clears a selection removed by a new query or status filter', () => {
    store.setVendors([makeVendor()]);
    store.select('v-001');
    store.setFilter('pending');
    expect(store.selectedId()).toBeNull();
    store.setFilter('all');
    store.select('v-001');
    store.setVendors([]);
    expect(store.selectedId()).toBeNull();
  });
});
