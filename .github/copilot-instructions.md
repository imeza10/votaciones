# Sistema de Gestión Electoral Multi-Candidato - Angular 21 + PHP + MySQL

## Project Overview
Electoral management system for Colombian political campaigns allowing multiple candidates to manage teams, register voters, track votes, and control election day operations.

## Tech Stack
- **Frontend**: Angular 21 (standalone components), Angular Material, PrimeNG, Tailwind CSS
- **Backend**: PHP 8.2+ with simple file structure (no framework)
- **Database**: MySQL 8.0+
- **Real-time**: Socket.io
- **Maps**: Leaflet
- **Charts**: Chart.js

## Workspace Setup Progress

- [x] Verify copilot-instructions.md file created
- [x] Clarify project requirements (provided by user)
- [x] Scaffold the Angular 21 project
- [x] Install required dependencies
- [x] Create folder structure (core, shared, features, layout)
- [x] Configure CSS variables with Colombia theme
- [x] Set up environment files
- [x] Create PHP backend structure
- [x] Compile and verify the project
- [x] Create development task
- [x] Complete documentation

## Colombia Theme Colors
- Yellow: #FCD116
- Blue: #003893
- Red: #CE1126
- Dark Gray: #1a1a2e
- White: #FFFFFF
- Success Green: #4CAF50
- Warning Orange: #FF9800

## Key Features
- Multi-tenant system for multiple candidates
- Voter registration with duplicate detection
- Real-time vote confirmation
- Messaging system (SMS/WhatsApp integration)
- Transport management
- Expense control
- Advanced reporting and statistics
- Geographic location integration (Colombia data)

## Development Guidelines
- Use Spanish for variables and comments (Colombian context)
- Implement standalone components
- Follow Angular style guide
- Use SCSS for styling with CSS variables
- Implement lazy loading for feature modules
- Use signals for state management
- Implement proper error handling
- Add audit logging for critical operations

## Sistema Implementado

### ✅ Completado
- **Arquitectura Base**: Guards, Interceptors, Services
- **Autenticación**: Login component con validaciones y diseño Colombia
- **Layouts**: Auth layout y Admin layout con sidebar responsive
- **Dashboard**: Vista principal con tarjetas estadísticas y accesos rápidos
- **Routing**: Sistema completo de rutas con lazy loading
- **Módulos Placeholder**: Todos los módulos tienen componentes base
- **Módulo de Votantes**: CRUD completo (Ver MODULO_VOTANTES_COMPLETADO.md)
  - Backend API completa con filtros y paginación
  - Frontend con lista, registro y edición
  - Validación de duplicados
  - Integración con ubicaciones (departamentos, municipios, barrios)
- **Módulo de Usuarios**: CRUD completo (Ver MODULO_USUARIOS_COMPLETADO.md)
  - Gestión de Coordinadores
  - Gestión de Líderes
  - Gestión de Digitadores
  - Backend API con roles y jerarquías
  - Frontend con interfaces separadas por rol
  - Sistema de validaciones y permisos

### 🚀 Próximos Pasos
1. ✅ Implementar CRUD completo de Votantes - **COMPLETADO**
2. ✅ Implementar gestión de Usuarios (Coordinadores, Líderes, Digitadores) - **COMPLETADO**
3. Sistema de Confirmación de Votos en tiempo real - **SIGUIENTE**
4. Integración de autenticación JWT completa
5. Sistema de mensajería SMS/WhatsApp
6. Gestión de Transportes
7. Control de Gastos
8. Reportes y estadísticas con gráficos
9. Dashboard en tiempo real con websockets

### 📱 Acceso al Sistema
- **URL**: http://localhost:4201
- **Usuario Demo**: 1102840654
- **Password**: admin123
- **Backend API**: http://localhost/elecciones/backend/api/
