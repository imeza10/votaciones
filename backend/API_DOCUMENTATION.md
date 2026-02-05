# API de Votantes - Sistema Electoral Colombia

## Endpoints Implementados

### 🗳️ Votantes

#### 1. Listar Votantes
```http
GET /api/votantes
```

**Query Parameters:**
- `page` (opcional): Página actual (default: 1)
- `per_page` (opcional): Registros por página (default: 10)
- `search` (opcional): Buscar por documento, nombres o apellidos
- `departamento_id` (opcional): Filtrar por departamento
- `municipio_id` (opcional): Filtrar por municipio
- `lider_id` (opcional): Filtrar por líder
- `coordinador_id` (opcional): Filtrar por coordinador
- `voto_confirmado` (opcional): 1 o 0

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "votantes": [
      {
        "id": 1,
        "documento": "1102840654",
        "nombres": "Juan",
        "apellidos": "Pérez",
        "telefono": "3001234567",
        "municipio_nombre": "Cali",
        "lider_nombres": "Pedro",
        "lider_apellidos": "Gómez",
        "voto_confirmado": 1
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 10,
      "total": 50,
      "last_page": 5
    }
  }
}
```

#### 2. Obtener Votante por ID
```http
GET /api/votantes/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "documento": "1102840654",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "direccion": "Calle 5 # 10-20",
    "departamento_id": 76,
    "municipio_id": 1,
    "barrio_id": 5,
    "lugar_votacion_id": 10,
    "mesa": "123",
    "zona": "urbana",
    "es_jurado": 0,
    "lider_id": 5
  }
}
```

#### 3. Crear Votante
```http
POST /api/votantes
```

**Body (JSON):**
```json
{
  "documento": "1102840654",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "telefono": "3001234567",
  "direccion": "Calle 5 # 10-20",
  "departamento_id": 76,
  "municipio_id": 1,
  "barrio_id": 5,
  "comuna": "Comuna 1",
  "lugar_votacion_id": 10,
  "mesa": "123",
  "zona": "urbana",
  "es_jurado": 0,
  "lider_id": 5,
  "observaciones": "Ninguna"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "Votante registrado exitosamente"
}
```

#### 4. Actualizar Votante
```http
PUT /api/votantes/:id
```

**Body (JSON):** Igual que crear, pero solo campos a actualizar

**Respuesta:**
```json
{
  "success": true,
  "message": "Votante actualizado exitosamente"
}
```

#### 5. Eliminar Votante (Soft Delete)
```http
DELETE /api/votantes/:id
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Votante eliminado exitosamente"
}
```

#### 6. Verificar Duplicado
```http
GET /api/votantes/verificar-duplicado?documento=1102840654
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "duplicado": false
  },
  "message": "Documento disponible"
}
```

---

### 📍 Ubicaciones

#### 1. Listar Departamentos
```http
GET /api/ubicaciones/departamentos
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 76,
      "codigo": "76",
      "nombre": "Valle del Cauca"
    }
  ]
}
```

#### 2. Listar Municipios por Departamento
```http
GET /api/ubicaciones/municipios/:departamento_id
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "departamento_id": 76,
      "codigo": "76001",
      "nombre": "Cali"
    }
  ]
}
```

#### 3. Listar Barrios por Municipio
```http
GET /api/ubicaciones/barrios/:municipio_id
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "municipio_id": 1,
      "nombre": "San Antonio",
      "comuna": "Comuna 3"
    }
  ]
}
```

#### 4. Listar Lugares de Votación por Municipio
```http
GET /api/ubicaciones/lugares-votacion/:municipio_id
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "nombre": "Colegio Santa Librada",
      "direccion": "Calle 5 # 10-20",
      "municipio_id": 1,
      "zona": "urbana",
      "num_mesas": 15
    }
  ]
}
```

---

## 🔒 Autenticación

Todos los endpoints requieren autenticación mediante token JWT.

**Header requerido:**
```http
Authorization: Bearer {token}
```

---

## ⚠️ Códigos de Respuesta

- `200` - OK
- `201` - Created
- `400` - Bad Request (validación fallida)
- `401` - Unauthorized (token inválido o ausente)
- `403` - Forbidden (sin permisos)
- `404` - Not Found
- `409` - Conflict (duplicado)
- `500` - Internal Server Error

---

## 📋 Validaciones

### Votantes
- **documento**: Requerido, 6-10 dígitos
- **nombres**: Requerido, mínimo 2 caracteres
- **apellidos**: Requerido, mínimo 2 caracteres
- **telefono**: Opcional, formato colombiano (3XXXXXXXXX)
- **departamento_id**: Requerido
- **municipio_id**: Requerido
- **lider_id**: Requerido

### Detección de Duplicados
El sistema valida automáticamente que no exista otro votante con el mismo documento en el mismo tenant antes de crear o actualizar.

---

## � Usuarios (Coordinadores, Líderes, Digitadores)

### 1. Listar Usuarios
```http
GET /api/usuarios
```

**Query Parameters:**
- `page` (opcional): Página actual (default: 1)
- `per_page` (opcional): Registros por página (default: 20)
- `busqueda` (opcional): Buscar por documento, nombres, apellidos, email o teléfono
- `rol` (opcional): Filtrar por rol (coordinador, lider, digitador, transportador)
- `coordinador_id` (opcional): Filtrar por coordinador
- `activo` (opcional): 1 o 0

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": 5,
        "documento": "1234567890",
        "nombre": "Juan",
        "apellidos": "Pérez",
        "email": "juan@correo.com",
        "telefono": "3001234567",
        "rol": "lider",
        "coordinador_id": 3,
        "coordinador_nombre": "Pedro García",
        "total_lideres": 0,
        "activo": true,
        "created_at": "2026-02-05T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  }
}
```

### 2. Obtener Usuario por ID
```http
GET /api/usuarios/:id
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "documento": "1234567890",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@correo.com",
    "telefono": "3001234567",
    "rol": "lider",
    "coordinador_id": 3,
    "coordinador_nombre": "Pedro García",
    "total_lideres": 0,
    "activo": true,
    "ultimo_acceso": "2026-02-05T10:00:00Z",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-05T10:00:00Z"
  }
}
```

### 3. Crear Usuario
```http
POST /api/usuarios
```

**Body (JSON):**
```json
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "documento": "1234567890",
  "email": "juan@correo.com",
  "telefono": "3001234567",
  "password": "contraseña123",
  "rol": "lider",
  "coordinador_id": 3,
  "activo": 1
}
```

**Roles Válidos:**
- `coordinador`: Coordina grupos de líderes
- `lider`: Gestiona votantes
- `digitador`: Digita información
- `transportador`: Gestiona transporte

**Validaciones:**
- Documento único por tenant
- Email único por tenant (si se proporciona)
- Contraseña mínimo 6 caracteres
- Documento debe tener 6-10 dígitos
- Teléfono debe tener 10 dígitos

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 25
  }
}
```

### 4. Actualizar Usuario
```http
PUT /api/usuarios/:id
```

**Body (JSON):** Campos opcionales a actualizar
```json
{
  "nombre": "Juan Actualizado",
  "telefono": "3009876543",
  "email": "nuevo@email.com",
  "password": "nuevaContraseña",
  "activo": 1
}
```

**Nota:** Si no se envía `password`, se mantiene la contraseña actual.

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente"
}
```

### 5. Eliminar Usuario (Soft Delete)
```http
DELETE /api/usuarios/:id
```

**Validación:** No se puede eliminar un coordinador con líderes asignados.

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

### 6. Verificar Documento Duplicado
```http
GET /api/usuarios/verificar-duplicado?documento=1234567890&exclude_id=5
```

**Query Parameters:**
- `documento` (requerido): Documento a verificar
- `exclude_id` (opcional): ID a excluir en la validación (útil para edición)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "existe": false
  }
}
```

### 7. Cambiar Estado de Usuario
```http
PATCH /api/usuarios/:id/estado
```

**Body (JSON):**
```json
{
  "activo": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente"
}
```

### 8. Resetear Contraseña
```http
PATCH /api/usuarios/:id/password
```

**Body (JSON):**
```json
{
  "password": "nuevaContraseña123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

## �🔍 Auditoría

Todas las operaciones (crear, actualizar, eliminar) se registran en la tabla `auditoria`:
- Usuario que realizó la acción
- Fecha y hora
- Valores anteriores y nuevos
- Tabla y registro afectado

---

## 🚀 Despliegue

### Producción
- **URL**: https://imc-st.com/elecciones/v2/api/
- **Base de datos**: u649057458_eleccionesv2

### Configuración .htaccess
Las rutas están configuradas para soportar:
- URLs amigables sin .php
- CORS habilitado
- Manejo de métodos HTTP (GET, POST, PUT, DELETE)
- Rutas dinámicas con parámetros
