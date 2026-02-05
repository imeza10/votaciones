# Backend PHP - Sistema Electoral

Backend API REST para el Sistema de Gestión Electoral de Colombia.

## Configuración

### Requisitos
- PHP 8.2+
- MySQL 8.0+
- Apache/Nginx con mod_rewrite

### Instalación

1. **Importar base de datos**:
```bash
mysql -u root -p < database.sql
```

2. **Configurar conexión**:
Editar `config/config.php` con tus credenciales:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'electoral_db');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_password');
```

3. **Configurar JWT Secret**:
```php
define('JWT_SECRET', 'tu_clave_secreta_segura_aqui');
```

4. **Configurar CORS**:
```php
define('ALLOWED_ORIGINS', [
    'http://localhost:4200',  // Angular dev
    'https://tu-dominio.com'  // Producción
]);
```

5. **Permisos de carpetas**:
```bash
chmod 755 uploads/
chmod 644 config/config.php
```

## Estructura

```
backend/
├── api/
│   ├── auth/
│   │   └── login.php
│   ├── votantes/
│   │   └── index.php
│   ├── usuarios/
│   └── reportes/
├── config/
│   └── config.php
├── includes/
│   └── functions.php
├── uploads/
└── database.sql
```

## Endpoints API

### Autenticación
- `POST /api/auth/login.php` - Login

### Votantes
- `GET /api/votantes/` - Listar votantes
- `POST /api/votantes/` - Crear votante
- `PUT /api/votantes/` - Actualizar votante
- `DELETE /api/votantes/` - Eliminar votante

## Configuración Apache (.htaccess)

Crear archivo `.htaccess` en la raíz del backend:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.+)$ api/$1 [L]

# CORS Headers
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"
```

## Seguridad

- Todas las contraseñas se hashean con `password_hash()` usando bcrypt
- Validación y sanitización de todos los inputs
- Prepared statements para prevenir SQL injection
- Headers CORS configurables
- Registro de auditoría en todas las operaciones críticas

## Usuario de Prueba

**Documento**: 1234567890  
**Password**: admin123  
**Rol**: superadmin

**IMPORTANTE**: Cambiar esta contraseña en producción.

## Desarrollo

Para desarrollo local con PHP built-in server:

```bash
cd backend
php -S localhost:8000
```

La API estará disponible en `http://localhost:8000`
