import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorEditor } from '../../src/app/vendors/vendor-editor';
import { makeVendor } from '../fixtures';

describe('Acceptance: vendor status editing', () => {
  let fixture: ComponentFixture<VendorEditor>;
  let editor: VendorEditor;
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [VendorEditor], providers: [provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VendorEditor);
    fixture.componentRef.setInput('vendor', makeVendor());
    fixture.detectChanges();
    await fixture.whenStable();
    editor = fixture.componentInstance;
  });
  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('validates a suspension note before making a request', () => {
    editor.form.setValue({ status: 'suspended', note: '          ' });
    editor.save();
    http.expectNone((req) => req.method === 'PATCH');
    expect(editor.form.invalid).toBe(true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Explain the suspension');
  });
  it('rejects a note longer than 200 characters', () => {
    editor.form.setValue({ status: 'active', note: 'x'.repeat(201) });
    editor.save();
    http.expectNone((req) => req.method === 'PATCH');
    expect(editor.form.invalid).toBe(true);
  });
  it('sends a valid trimmed update and emits the server response', () => {
    const saved = jest.fn();
    editor.saved.subscribe(saved);
    editor.form.setValue({ status: 'suspended', note: '  Required documents are missing  ' });
    editor.save();
    const request = http.expectOne('/api/vendors/v-001');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'suspended', note: 'Required documents are missing' });
    const result = makeVendor({ status: 'suspended', note: 'Required documents are missing', updatedAt: '2026-10-22T18:00:00.000Z' });
    request.flush(result);
    expect(saved).toHaveBeenCalledWith(result);
    expect(editor.saving()).toBe(false);
  });
  it('allows an empty note for a non-suspended status', () => {
    editor.form.setValue({ status: 'pending', note: '' });
    editor.save();
    http.expectOne('/api/vendors/v-001').flush(makeVendor({ status: 'pending' }));
    expect(editor.error()).toBeNull();
  });
  it('prevents duplicate submissions and shows a disabled save button', () => {
    editor.form.setValue({ status: 'pending', note: '' });
    editor.save(); editor.save();
    const requests = http.match('/api/vendors/v-001');
    fixture.detectChanges();
    const buttonDisabled = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-testid="save-button"]')?.disabled;
    requests.forEach((request) => request.flush(makeVendor({ status: 'pending' })));
    expect(requests).toHaveLength(1);
    expect(buttonDisabled).toBe(true);
  });
  it('keeps user input after a failed save, emits no success, and supports retry', async () => {
    const saved = jest.fn();
    editor.saved.subscribe(saved);
    editor.form.setValue({ status: 'suspended', note: 'Required documents [fail]' });
    editor.save();
    http.expectOne('/api/vendors/v-001').flush({ message: 'Not saved' }, { status: 503, statusText: 'Service Unavailable' });
    expect(editor.saving()).toBe(false);
    expect(editor.error()).toBeTruthy();
    expect(saved).not.toHaveBeenCalled();
    expect(editor.form.controls.note.value).toBe('Required documents [fail]');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('[data-testid="save-error"]')?.textContent).toBeTruthy();
    editor.form.controls.note.setValue('Required documents are missing');
    editor.save();
    http.expectOne('/api/vendors/v-001').flush(makeVendor({ status: 'suspended', note: 'Required documents are missing' }));
    expect(editor.error()).toBeNull();
    expect(saved).toHaveBeenCalledTimes(1);
  });
  it('cancels a pending client subscription when the editor is destroyed', () => {
    editor.form.setValue({ status: 'pending', note: '' });
    editor.save();
    const request = http.expectOne('/api/vendors/v-001');
    fixture.destroy();
    expect(request.cancelled).toBe(true);
  });
});
