export const VENDOR_STATUSES = ['active', 'pending', 'suspended'] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];
export type StatusFilter = VendorStatus | 'all';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  status: VendorStatus;
  annualSpend: number;
  note: string;
  updatedAt: string;
}

export interface VendorUpdate {
  status: VendorStatus;
  note: string;
}

export function isStatusFilter(value: string): value is StatusFilter {
  return value === 'all' || VENDOR_STATUSES.some((status) => status === value);
}
