import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { StatusBadge } from './status-badge';
import { VendorEditor } from './vendor-editor';
import { isStatusFilter, Vendor } from './vendor.model';
import { VendorSearch } from './vendor-search';
import { VendorStore } from './vendor-store';
import { VendorSummary } from './vendor-summary';

@Component({
  selector: 'app-vendor-page',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, StatusBadge, VendorEditor, VendorSummary],
  providers: [VendorSearch],
  templateUrl: './vendor-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorPage {
  readonly store = inject(VendorStore);
  readonly search = inject(VendorSearch);
  readonly query = new FormControl('', { nonNullable: true });
  readonly notice = signal<string | null>(null);
  readonly editorVendors = computed(() => {
    const vendor = this.store.selectedVendor();
    return vendor ? [vendor] : [];
  });

  constructor() {
    this.query.valueChanges.pipe(startWith(this.query.value), takeUntilDestroyed()).subscribe((query) => {
      this.notice.set(null);
      this.search.find(query);
    });
  }

  changeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isStatusFilter(value)) {
      this.store.setFilter(value);
    }
  }

  onSaved(vendor: Vendor): void {
    this.store.replaceVendor(vendor);
    this.notice.set(`${vendor.name} was updated.`);
  }
}
