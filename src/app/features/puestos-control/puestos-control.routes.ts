import { Routes } from '@angular/router';

export const PUESTOS_CONTROL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () => import('./lista/lista.component').then(m => m.ListaPuestosComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroPuestosComponent)
  },
  {
    path: 'asistencia',
    loadComponent: () => import('./asistencia/asistencia.component').then(m => m.AsistenciaComponent)
  }
];
