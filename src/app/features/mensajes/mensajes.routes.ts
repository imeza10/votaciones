import { Routes } from '@angular/router';

export const MENSAJES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'enviar',
    pathMatch: 'full'
  },
  {
    path: 'enviar',
    loadComponent: () => import('./enviar/enviar.component').then(m => m.EnviarComponent)
  },
  {
    path: 'historial',
    loadComponent: () => import('./historial/historial.component').then(m => m.HistorialComponent)
  },
  {
    path: 'plantillas',
    loadComponent: () => import('./plantillas/plantillas.component').then(m => m.PlantillasComponent)
  }
];
