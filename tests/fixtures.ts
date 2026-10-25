import { Vendor } from '../src/app/vendors/vendor.model';

export function makeVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: 'v-001', name: 'Acme Electrical', category: 'Electrical', contact: 'Jordan Ellis',
    email: 'acme@vendors.example', status: 'active', annualSpend: 128000, note: '',
    updatedAt: '2026-10-01T12:00:00.000Z', ...overrides,
  };
}
