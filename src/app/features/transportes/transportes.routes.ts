import { Routes } from '@angular/router';

export const TRANSPORTES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'vehiculos',
    pathMatch: 'full'
  },
  {
    path: 'vehiculos',
    loadComponent: () => import('./vehiculos/vehiculos.component').then(m => m.VehiculosComponent)
  },
  {
    path: 'viajes',
    loadComponent: () => import('./viajes/viajes.component').then(m => m.ViajesComponent)
  }
];
