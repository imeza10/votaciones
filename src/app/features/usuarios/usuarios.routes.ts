import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lideres',
    pathMatch: 'full'
  },
  {
    path: 'coordinadores',
    loadComponent: () => import('./coordinadores/coordinadores.component').then(m => m.CoordinadoresComponent)
  },
  {
    path: 'lideres',
    loadComponent: () => import('./lideres/lideres.component').then(m => m.LideresComponent)
  },
  {
    path: 'digitadores',
    loadComponent: () => import('./digitadores/digitadores.component').then(m => m.DigitadoresComponent)
  }
];
