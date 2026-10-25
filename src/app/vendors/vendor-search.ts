import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { VendorApi } from './vendor-api';
import { VendorStore } from './vendor-store';

@Injectable()
export class VendorSearch {
  private readonly api = inject(VendorApi);
  private readonly store = inject(VendorStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queries = new Subject<string>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  find(query: string): void {
    this.queries.next(query);
  }

  constructor() {
    this.queries.pipe(takeUntilDestroyed()).subscribe((query) => {
      this.loading.set(true);
      this.error.set(null);
      this.api.search(query).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (vendors) => {
          this.store.setVendors(vendors);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Search failed. Try a different search.');
          this.store.setVendors([]);
          this.loading.set(false);
        },
      });
    });
  }
}
