import { TestBed } from '@angular/core/testing';
import { StatusBadge } from './status-badge';
import { VendorStatus } from './vendor.model';

describe('StatusBadge', () => {
  it.each<[VendorStatus, string]>([
    ['active', 'Active'], ['pending', 'Pending review'], ['suspended', 'Suspended'],
  ])('renders the %s label using template control flow', async (status, label) => {
    await TestBed.configureTestingModule({ imports: [StatusBadge] }).compileComponents();
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(label);
  });
});
