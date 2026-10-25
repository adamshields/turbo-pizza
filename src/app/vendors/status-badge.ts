import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VendorStatus } from './vendor.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (status()) {
      @case ('active') { <span class="badge badge-active"><span aria-hidden="true"></span>Active</span> }
      @case ('pending') { <span class="badge badge-pending"><span aria-hidden="true"></span>Pending review</span> }
      @case ('suspended') { <span class="badge badge-suspended"><span aria-hidden="true"></span>Suspended</span> }
    }
  `,
})
export class StatusBadge {
  readonly status = input.required<VendorStatus>();
}
