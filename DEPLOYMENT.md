# 📦 GUÍA DE DEPLOYMENT - Sistema Electoral Colombia

## 🎯 URL del Proyecto
**Frontend**: https://imc-st.com/elecciones/v2/
**Backend API**: https://imc-st.com/elecciones/v2/backend/api/

---

## 📂 ESTRUCTURA DE CARPETAS A SUBIR

### 1️⃣ BACKEND (PHP)
**📁 Carpeta a subir**: `backend/`

Subir al servidor en la ruta:
```
/public_html/elecciones/v2/backend/
```

**Archivos incluidos**:
```
backend/
├── .htaccess          ✅ Configuración Apache (CORS, seguridad)
├── config/
│   └── config.php     ✅ Configuración de BD (credenciales configuradas)
├── includes/
│   └── functions.php  ✅ Funciones de utilidad
├── api/
│   ├── auth/
│   │   └── login.php  ✅ Login endpoint
│   ├── votantes/
│   │   └── index.php  ✅ CRUD votantes
│   ├── usuarios/
│   └── reportes/
├── uploads/           ⚠️  Crear con permisos 755
└── database.sql       📋 Script de creación de BD
```

**⚙️ Configuración actual**:
- **Base de datos**: u649057458_eleccionesv2
- **Usuario**: u649057458_eleccionesv2
- **Contraseña**: :9iM+PWkXT
- **Modo**: PRODUCCIÓN (errores ocultos)
- **CORS**: Configurado para imc-st.com

---

### 2️⃣ FRONTEND (Angular)
**📁 Carpeta a subir**: `dist/frontend/`

**⚠️ IMPORTANTE**: Primero debes compilar el proyecto para producción.

**Pasos para compilar**:
```bash
# En tu computadora, ejecuta:
npm run build
```

Esto generará la carpeta `dist/frontend/` con los archivos optimizados.

**Subir al servidor en la ruta**:
```
/public_html/elecciones/v2/
```

**Archivos que se generarán** (después del build):
```
dist/frontend/
├── index.html
├── main-XXXX.js
├── styles-XXXX.css
├── chunk-XXXX.js
└── ... (otros archivos compilados)
```

---

## 🚀 PASOS DE INSTALACIÓN

### PASO 1: Preparar Base de Datos
1. Accede a phpMyAdmin de tu hosting
2. Selecciona la BD: `u649057458_eleccionesv2`
3. Importa el archivo: `backend/database.sql`
4. Verifica que las tablas se crearon correctamente

### PASO 2: Subir Backend
1. Conecta por FTP/cPanel File Manager
2. Navega a: `/public_html/elecciones/v2/`
3. Sube toda la carpeta `backend/`
4. Establece permisos:
   - `backend/uploads/` → **755** (lectura/escritura)
   - `backend/config/config.php` → **644** (solo lectura)

### PASO 3: Compilar y Subir Frontend
1. En tu computadora local:
   ```bash
   npm run build
   ```
2. Espera a que termine la compilación
3. Sube el contenido de `dist/frontend/` a:
   ```
   /public_html/elecciones/v2/
   ```
4. Crea el archivo `.htaccess` en la raíz (ver abajo)

### PASO 4: Configurar .htaccess del Frontend
Crea el archivo `/public_html/elecciones/v2/.htaccess` con:

```apache
# Angular routing - Todas las rutas van a index.html
RewriteEngine On
RewriteBase /elecciones/v2/

# Si el archivo existe, servirlo directamente
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Redirigir todo a index.html
RewriteRule ^ index.html [L]

# Habilitar compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache para archivos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## ✅ VERIFICACIÓN

### Backend
Prueba el endpoint de login:
```
https://imc-st.com/elecciones/v2/backend/api/auth/login.php
```

Debería devolver error JSON si no envías datos (es correcto).

### Frontend
Accede a:
```
https://imc-st.com/elecciones/v2/
```

Deberías ver la pantalla de login del sistema.

---

## 🔑 CREDENCIALES DE PRUEBA

**Usuario**: 1102840654
**Contraseña**: admin123

⚠️ **IMPORTANTE**: Cambiar estas credenciales después de la primera instalación.

---

## 📁 RESUMEN - QUÉ SUBIR

### ✅ AL SERVIDOR
```
/public_html/elecciones/v2/
│
├── backend/              ← Subir carpeta completa
│   ├── .htaccess
│   ├── api/
│   ├── config/
│   ├── includes/
│   └── uploads/
│
├── index.html           ← De dist/frontend/
├── main-XXXX.js         ← De dist/frontend/
├── styles-XXXX.css      ← De dist/frontend/
├── chunk-XXXX.js        ← De dist/frontend/
├── ... archivos .js     ← De dist/frontend/
└── .htaccess            ← Crear manualmente (ver arriba)
```

### ❌ NO SUBIR
- `node_modules/`
- `src/`
- `.git/`
- `.angular/`
- `package.json`, `tsconfig.json`, etc.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error 500 en Backend
- Verifica permisos de `uploads/` (755)
- Revisa que las credenciales de BD sean correctas en `config.php`
- Activa temporalmente `APP_DEBUG = true` para ver errores

### Frontend muestra página en blanco
- Verifica que el `.htaccess` esté en la raíz
- Revisa la consola del navegador (F12)
- Verifica que la ruta base sea `/elecciones/v2/`

### Error de CORS
- Verifica que el dominio esté en `ALLOWED_ORIGINS` en `config.php`
- Revisa que el `.htaccess` del backend tenga las cabeceras CORS

---

## 📞 SOPORTE

Si algo no funciona:
1. Activa modo debug: `APP_DEBUG = true` en `config.php`
2. Revisa logs del servidor
3. Verifica consola del navegador (F12)

---

**¡Listo para deployment! 🚀**
