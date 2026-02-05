import { Routes } from '@angular/router';

export const GASTOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroGastosComponent)
  },
  {
    path: 'lista',
    loadComponent: () => import('./lista/lista.component').then(m => m.ListaGastosComponent)
  },
  {
    path: 'aprobacion',
    loadComponent: () => import('./aprobacion/aprobacion.component').then(m => m.AprobacionComponent)
  }
];
