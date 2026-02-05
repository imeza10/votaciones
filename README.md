# Sistema de Gestión Electoral Multi-Candidato 🇨🇴

Sistema completo de gestión electoral para campañas políticas en Colombia. Permite a múltiples candidatos gestionar equipos, registrar votantes, realizar seguimiento de votos y controlar operaciones el día de las elecciones.

## 🚀 Stack Tecnológico

### Frontend
- **Angular 21** (Standalone Components)
- **Angular Material** - Componentes UI
- **PrimeNG** - Componentes avanzados
- **Chart.js** - Gráficos y visualizaciones
- **Leaflet** - Mapas interactivos
- **Socket.io-client** - Actualizaciones en tiempo real
- **SCSS** - Estilos

### Backend
- **PHP 8.2+** - Sin framework (archivos simples)
- **MySQL 8.0+** - Base de datos
- **PDO** - Conexión a BD
- **JWT** - Autenticación (a implementar)

## 📁 Estructura del Proyecto

```
elecciones/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── core/                # Servicios core, guards, interceptors
│   │   ├── shared/              # Componentes compartidos
│   │   ├── features/            # Módulos de funcionalidades
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── votantes/        # Gestión de votantes
│   │   │   ├── usuarios/        # Gestión de usuarios
│   │   │   ├── puestos-control/ # Puestos de control
│   │   │   ├── confirmacion-votos/
│   │   │   ├── mensajes/        # Sistema de mensajería
│   │   │   ├── transportes/     # Gestión de transportes
│   │   │   ├── gastos/          # Control de gastos
│   │   │   ├── reportes/        # Reportes
│   │   │   └── estadisticas/    # Estadísticas y gráficos
│   │   └── layout/              # Layouts de la aplicación
│   ├── environments/            # Configuración de ambientes
│   └── assets/                  # Recursos estáticos
│
└── backend/                     # Backend PHP
    ├── config/
    │   └── config.php          # Configuración de BD y constantes
    ├── includes/
    │   └── functions.php       # Funciones de utilidad
    ├── api/
    │   ├── auth/               # APIs de autenticación
    │   ├── votantes/           # APIs de votantes
    │   ├── usuarios/           # APIs de usuarios
    │   └── reportes/           # APIs de reportes
    ├── uploads/                # Archivos subidos
    ├── database.sql            # Script de creación de BD
    └── README.md               # Documentación del backend
```

## 🛠️ Instalación

### Requisitos Previos
- Node.js 20+ y npm
- PHP 8.2+
- MySQL 8.0+
- Git

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd elecciones
```

### 2. Instalar Dependencias del Frontend
```bash
npm install
```

### 3. Configurar Base de Datos

**Crear la base de datos:**
```bash
mysql -u root -p < backend/database.sql
```

**Configurar conexión:**
Editar `backend/config/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'electoral_db');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
```

### 4. Configurar Frontend

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost/elecciones-api', // URL de tu backend PHP
  // ... otras configuraciones
};
```

## 🚀 Ejecución

### Desarrollo Frontend
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200`

### Desarrollo Backend
```bash
cd backend
php -S localhost:8000
```
La API estará disponible en `http://localhost:8000`

### Build Producción
```bash
npm run build
```
Los archivos compilados estarán en `dist/frontend/`

## 🎨 Tema Colombia

El sistema usa los colores oficiales de la bandera de Colombia:

- **Amarillo**: `#FCD116`
- **Azul**: `#003893`
- **Rojo**: `#CE1126`
- **Gris Oscuro**: `#1a1a2e`
- **Verde Éxito**: `#4CAF50`
- **Naranja Alerta**: `#FF9800`

## 📝 Credenciales de Prueba

**Usuario**: 1234567890  
**Contraseña**: admin123  
**Rol**: Superadmin

> ⚠️ **IMPORTANTE**: Cambiar estas credenciales en producción.

## 🔑 Funcionalidades Principales

### ✅ Implementado
- [x] Estructura del proyecto (Frontend + Backend)
- [x] Modelos de datos TypeScript
- [x] Servicios de autenticación y tenant
- [x] Configuración de ambientes
- [x] Base de datos con schema completo
- [x] API PHP con config.php
- [x] Sistema de auditoría
- [x] Detección de duplicados

### 🚧 En Desarrollo
- [ ] Sistema de autenticación completo con JWT
- [ ] CRUD de votantes
- [ ] CRUD de usuarios (coordinadores, líderes, digitadores)
- [ ] Confirmación de votos en tiempo real
- [ ] Sistema de mensajería (SMS/WhatsApp)
- [ ] Gestión de puestos de control
- [ ] Control de transportes
- [ ] Gestión de gastos
- [ ] Reportes y exportación
- [ ] Dashboard con gráficos
- [ ] Mapas interactivos
- [ ] Integración con APIs externas

## 📚 Documentación Adicional

- [Backend README](backend/README.md) - Documentación completa del backend PHP
- [Database Schema](backend/database.sql) - Estructura completa de la base de datos

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Prepared statements para prevenir SQL injection
- Sanitización de inputs
- Validación de datos
- Sistema de auditoría completo
- Control de acceso por roles
- CORS configurado

## 📈 Próximos Pasos

### Fase 1: Autenticación y Usuarios (Semana 1-2)
- Implementar login/logout completo
- Sistema de permisos por rol
- Gestión de usuarios

### Fase 2: Votantes (Semana 3-4)
- CRUD completo de votantes
- Importación masiva desde Excel/CSV
- Búsqueda avanzada
- Detección de duplicados

### Fase 3: Funcionalidades Avanzadas (Semana 5-8)
- Confirmación de votos en tiempo real
- Sistema de mensajería
- Puestos de control
- Transportes y gastos

### Fase 4: Reportes y Estadísticas (Semana 9-10)
- Dashboard interactivo
- Reportes personalizados
- Gráficos y visualizaciones
- Exportación a PDF/Excel

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Sistema desarrollado para gestión de campañas electorales en Colombia.

---

**¡Construyendo democracia digital! 🇨🇴**
