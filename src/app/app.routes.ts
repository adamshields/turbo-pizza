import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'vendors' },
  { path: 'vendors', loadComponent: () => import('./vendors/vendor-page').then((m) => m.VendorPage) },
  { path: '**', redirectTo: 'vendors' },
];
