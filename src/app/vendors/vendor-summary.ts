import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VendorStore } from './vendor-store';

@Component({
  selector: 'app-vendor-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metrics" aria-label="Summary of search results, before the status filter">
      <div class="metric"><span>Total vendors</span><strong data-testid="total-count">{{ store.summary().total }}</strong><small>Current search results</small></div>
      <div class="metric"><span><i class="dot dot-active"></i>Active</span><strong data-testid="active-count">{{ store.summary().active }}</strong><small>Approved to work</small></div>
      <div class="metric"><span><i class="dot dot-pending"></i>Pending review</span><strong data-testid="pending-count">{{ store.summary().pending }}</strong><small>Awaiting a decision</small></div>
      <div class="metric"><span><i class="dot dot-suspended"></i>Suspended</span><strong data-testid="suspended-count">{{ store.summary().suspended }}</strong><small>Requires follow-up</small></div>
    </div>
  `,
})
export class VendorSummary {
  readonly store = inject(VendorStore);
}
