import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { makeVendor } from '../../../tests/fixtures';
import { VendorPage } from './vendor-page';
import { VendorSearch } from './vendor-search';
import { VendorStore } from './vendor-store';

describe('VendorPage baseline', () => {
  let fixture: ComponentFixture<VendorPage>;
  let store: VendorStore;
  let search: { find: jest.Mock; loading: WritableSignal<boolean>; error: WritableSignal<string | null> };
  beforeEach(async () => {
    search = { find: jest.fn(), loading: signal(false), error: signal<string | null>(null) };
    await TestBed.configureTestingModule({ imports: [VendorPage], providers: [provideHttpClient(), provideHttpClientTesting()] })
      .overrideComponent(VendorPage, { set: { providers: [{ provide: VendorSearch, useValue: search }] } })
      .compileComponents();
    store = TestBed.inject(VendorStore);
    store.setVendors([makeVendor(), makeVendor({ id: 'v-002', name: 'Acme Plumbing', status: 'pending' })]);
    fixture = TestBed.createComponent(VendorPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('renders rows, a derived summary, and the initial search', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('[data-vendor-id]')).toHaveLength(2);
    expect(host.querySelector('[data-testid="active-count"]')?.textContent).toBe('1');
    expect(search.find).toHaveBeenCalledWith('');
  });
  it('opens the selected record through an Edit action', async () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-label="Edit Acme Electrical"]');
    button?.click();
    await fixture.whenStable();
    expect(store.selectedId()).toBe('v-001');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-vendor-editor')).not.toBeNull();
  });
  it('forwards input events from the real search field', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#vendor-search');
    if (!input) throw new Error('Search input is missing.');
    input.value = 'acme';
    input.dispatchEvent(new Event('input'));
    expect(search.find).toHaveBeenLastCalledWith('acme');
  });
});
