import { Routes } from '@angular/router';

export const VOTANTES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () => import('./lista/lista.component').then(m => m.ListaComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./editar/editar.component').then(m => m.EditarComponent)
  }
];
