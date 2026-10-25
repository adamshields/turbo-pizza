import { computed, Injectable, signal } from '@angular/core';
import { StatusFilter, Vendor } from './vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorStore {
  readonly vendors = signal<readonly Vendor[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly statusFilter = signal<StatusFilter>('all');

  readonly filteredVendors = computed(() => {
    const status = this.statusFilter();
    return this.vendors().filter((vendor) => status === 'all' || vendor.status === status);
  });

  readonly selectedVendor = computed(() =>
    this.vendors().find((vendor) => vendor.id === this.selectedId()) ?? null,
  );

  readonly summary = computed(() => ({
    total: this.vendors().length,
    active: this.vendors().filter((vendor) => vendor.status === 'active').length,
    pending: this.vendors().filter((vendor) => vendor.status === 'pending').length,
    suspended: this.vendors().filter((vendor) => vendor.status === 'suspended').length,
  }));

  setVendors(vendors: readonly Vendor[]): void {
    this.vendors.set(vendors);
    this.clearHiddenSelection();
  }

  setFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.clearHiddenSelection();
  }

  select(id: string | null): void {
    this.selectedId.set(id);
  }

  replaceVendor(updated: Vendor): void {
    const vendors = this.vendors();
    const existing = vendors.find((vendor) => vendor.id === updated.id);
    if (existing) {
      Object.assign(existing, updated);
    }
    this.vendors.set(vendors);
    this.clearHiddenSelection();
  }

  private clearHiddenSelection(): void {
    if (!this.filteredVendors().some((vendor) => vendor.id === this.selectedId())) {
      this.selectedId.set(null);
    }
  }
}
