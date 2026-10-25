import { TestBed } from '@angular/core/testing';
import { VendorStore } from '../../src/app/vendors/vendor-store';
import { VendorSummary } from '../../src/app/vendors/vendor-summary';
import { makeVendor } from '../fixtures';

describe('Acceptance: shared state and signal notifications', () => {
  let store: VendorStore;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [VendorSummary] });
    store = TestBed.inject(VendorStore);
    store.setVendors([makeVendor(), makeVendor({ id: 'v-002', status: 'pending' })]);
  });

  it('recomputes summary totals after a successful update', () => {
    expect(store.summary().active).toBe(1);
    store.replaceVendor(makeVendor({ status: 'suspended', note: 'Required documents are missing' }));
    expect(store.summary()).toEqual({ total: 2, active: 0, pending: 1, suspended: 1 });
  });
  it('does not mutate the previous collection or vendor object', () => {
    const previous = store.vendors();
    const previousVendor = previous[0];
    store.replaceVendor(makeVendor({ status: 'pending' }));
    expect(store.vendors()).not.toBe(previous);
    expect(previousVendor.status).toBe('active');
  });
  it('updates the selected record from the same source of truth', () => {
    store.select('v-001');
    const old = store.selectedVendor();
    expect(old?.status).toBe('active');
    store.replaceVendor(makeVendor({ status: 'pending' }));
    expect(store.selectedVendor()?.status).toBe('pending');
    expect(store.selectedVendor()).not.toBe(old);
  });
  it('removes a record that no longer matches the filter and closes its editor', () => {
    store.setFilter('active');
    store.select('v-001');
    expect(store.filteredVendors()).toHaveLength(1);
    store.replaceVendor(makeVendor({ status: 'pending' }));
    expect(store.filteredVendors()).toHaveLength(0);
    expect(store.selectedId()).toBeNull();
  });
  it('refreshes an OnPush summary without manually forcing change detection', async () => {
    const fixture = TestBed.createComponent(VendorSummary);
    fixture.detectChanges();
    await fixture.whenStable();
    const activeCount = () => (fixture.nativeElement as HTMLElement).querySelector('[data-testid="active-count"]')?.textContent;
    expect(activeCount()).toBe('1');
    store.replaceVendor(makeVendor({ status: 'pending' }));
    // No fixture.detectChanges() here: the signal must notify Angular.
    await fixture.whenStable();
    expect(activeCount()).toBe('0');
  });
});
