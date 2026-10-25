import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { makeVendor } from '../../../tests/fixtures';
import { VendorEditor } from './vendor-editor';

describe('VendorEditor baseline', () => {
  let fixture: ComponentFixture<VendorEditor>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VendorEditor], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    fixture = TestBed.createComponent(VendorEditor);
    fixture.componentRef.setInput('vendor', makeVendor({ status: 'pending', note: 'Needs review' }));
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('displays the selected vendor and initializes the form', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Acme Electrical');
    expect(fixture.componentInstance.form.getRawValue()).toEqual({ status: 'pending', note: 'Needs review' });
  });
  it('emits close when Cancel is clicked', () => {
    const closed = jest.fn();
    fixture.componentInstance.closed.subscribe(closed);
    const cancel = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.button-secondary');
    cancel?.click();
    expect(closed).toHaveBeenCalledTimes(1);
  });
  it('resets the form when the selected input record changes', async () => {
    fixture.componentInstance.form.controls.note.setValue('Unsaved draft');
    fixture.componentRef.setInput('vendor', makeVendor({ id: 'v-002', name: 'Acme Plumbing', status: 'active', note: '' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.form.getRawValue()).toEqual({ status: 'active', note: '' });
  });
});
