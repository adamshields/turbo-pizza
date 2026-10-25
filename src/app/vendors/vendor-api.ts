import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Vendor, VendorUpdate } from './vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorApi {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>('/api/vendors', { params: { q: query } });
  }

  update(id: string, update: VendorUpdate): Observable<Vendor> {
    return this.http.patch<Vendor>(`/api/vendors/${encodeURIComponent(id)}`, update);
  }
}
