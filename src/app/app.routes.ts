import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Ruta por defecto - redirigir a dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Rutas de autenticación (sin guard)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Rutas protegidas (con guard)
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'votantes',
        loadChildren: () => import('./features/votantes/votantes.routes').then(m => m.VOTANTES_ROUTES)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
      },
      {
        path: 'puestos-control',
        loadChildren: () => import('./features/puestos-control/puestos-control.routes').then(m => m.PUESTOS_CONTROL_ROUTES)
      },
      {
        path: 'confirmacion-votos',
        loadComponent: () => import('./features/confirmacion-votos/confirmacion-votos.component').then(m => m.ConfirmacionVotosComponent)
      },
      {
        path: 'mensajes',
        loadChildren: () => import('./features/mensajes/mensajes.routes').then(m => m.MENSAJES_ROUTES)
      },
      {
        path: 'transportes',
        loadChildren: () => import('./features/transportes/transportes.routes').then(m => m.TRANSPORTES_ROUTES)
      },
      {
        path: 'gastos',
        loadChildren: () => import('./features/gastos/gastos.routes').then(m => m.GASTOS_ROUTES)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./features/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
      }
    ]
  },

  // Ruta 404
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
