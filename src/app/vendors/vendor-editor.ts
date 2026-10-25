import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StatusBadge } from './status-badge';
import { Vendor, VendorStatus, VENDOR_STATUSES } from './vendor.model';

@Component({
  selector: 'app-vendor-editor',
  standalone: true,
  imports: [ReactiveFormsModule, StatusBadge],
  templateUrl: './vendor-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorEditor {
  readonly vendor = input.required<Vendor>();
  readonly saved = output<Vendor>();
  readonly closed = output<void>();
  readonly statuses = VENDOR_STATUSES;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = new FormGroup({
    status: new FormControl<VendorStatus>('pending', { nonNullable: true }),
    note: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const vendor = this.vendor();
      this.form.reset({ status: vendor.status, note: vendor.note });
      this.error.set(null);
      this.submitted.set(false);
    });
  }

  save(): void {
    // Implement the status-update ticket in CANDIDATE.md.
    this.submitted.set(true);
    this.error.set('Status updates have not been implemented yet.');
  }
}
