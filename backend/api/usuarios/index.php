<?php
/**
 * API de Usuarios - Sistema Electoral Colombia
 * Gestiona coordinadores, líderes, digitadores y transportadores
 * 
 * Endpoints:
 * - GET    /api/usuarios          - Listar usuarios con filtros
 * - GET    /api/usuarios/:id      - Obtener un usuario
 * - POST   /api/usuarios          - Crear usuario
 * - PUT    /api/usuarios/:id      - Actualizar usuario
 * - DELETE /api/usuarios/:id      - Eliminar usuario (soft delete)
 * - PATCH  /api/usuarios/:id/estado   - Cambiar estado
 * - PATCH  /api/usuarios/:id/password - Resetear contraseña
 * - GET    /api/usuarios/verificar-duplicado - Verificar documento duplicado
 */

// Incluir configuración CORS (debe ser lo primero)
require_once __DIR__ . '/../../includes/cors.php';

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');

// Obtener método HTTP y ruta
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = explode('/', trim($uri, '/'));

// Extraer ID de la URL si existe
$id = null;
$action = null;
if (isset($uri_parts[2]) && is_numeric($uri_parts[2])) {
    $id = (int)$uri_parts[2];
    if (isset($uri_parts[3])) {
        $action = $uri_parts[3]; // estado, password, etc.
    }
}

// Verificar autenticación (simulado por ahora)
// TODO: Implementar verificación JWT cuando esté listo el módulo de auth
$tenant_id = 1; // Hardcoded para desarrollo
$candidato_id = 1; // Hardcoded para desarrollo

try {
    switch ($method) {
        case 'GET':
            if ($uri_parts[2] === 'verificar-duplicado' || (isset($uri_parts[3]) && $uri_parts[3] === 'verificar-duplicado')) {
                verificarDocumentoDuplicado($pdo, $tenant_id);
            } elseif ($id) {
                obtenerUsuario($pdo, $id, $tenant_id);
            } else {
                listarUsuarios($pdo, $tenant_id);
            }
            break;

        case 'POST':
            crearUsuario($pdo, $tenant_id, $candidato_id);
            break;

        case 'PUT':
            if (!$id) {
                throw new Exception('ID de usuario requerido');
            }
            actualizarUsuario($pdo, $id, $tenant_id);
            break;

        case 'DELETE':
            if (!$id) {
                throw new Exception('ID de usuario requerido');
            }
            eliminarUsuario($pdo, $id, $tenant_id);
            break;

        case 'PATCH':
            if (!$id) {
                throw new Exception('ID de usuario requerido');
            }
            if ($action === 'estado') {
                cambiarEstado($pdo, $id, $tenant_id);
            } elseif ($action === 'password') {
                resetearPassword($pdo, $id, $tenant_id);
            } else {
                throw new Exception('Acción no válida');
            }
            break;

        default:
            throw new Exception('Método no permitido');
    }

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// ==================== FUNCIONES ====================

/**
 * Listar usuarios con filtros y paginación
 */
function listarUsuarios($pdo, $tenant_id) {
    $busqueda = $_GET['busqueda'] ?? '';
    $rol = $_GET['rol'] ?? '';
    $coordinador_id = $_GET['coordinador_id'] ?? '';
    $activo = $_GET['activo'] ?? '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $per_page = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
    
    $offset = ($page - 1) * $per_page;

    // Query base
    $sql = "SELECT 
                u.id,
                u.tenant_id,
                u.candidato_id,
                u.coordinador_id,
                u.nombre,
                u.apellidos,
                u.documento,
                u.email,
                u.telefono,
                u.rol,
                u.activo,
                u.ultimo_acceso,
                u.created_at,
                u.updated_at,
                CONCAT(c.nombre, ' ', c.apellidos) as coordinador_nombre,
                (SELECT COUNT(*) FROM usuarios WHERE coordinador_id = u.id AND deleted_at IS NULL) as total_lideres
            FROM usuarios u
            LEFT JOIN usuarios c ON u.coordinador_id = c.id
            WHERE u.tenant_id = :tenant_id 
            AND u.deleted_at IS NULL
            AND u.rol IN ('coordinador', 'lider', 'digitador', 'transportador')";

    $params = ['tenant_id' => $tenant_id];

    // Filtros
    if (!empty($busqueda)) {
        $sql .= " AND (u.documento LIKE :busqueda 
                  OR u.nombre LIKE :busqueda 
                  OR u.apellidos LIKE :busqueda
                  OR u.email LIKE :busqueda
                  OR u.telefono LIKE :busqueda)";
        $params['busqueda'] = "%$busqueda%";
    }

    if (!empty($rol)) {
        $sql .= " AND u.rol = :rol";
        $params['rol'] = $rol;
    }

    if (!empty($coordinador_id)) {
        $sql .= " AND u.coordinador_id = :coordinador_id";
        $params['coordinador_id'] = $coordinador_id;
    }

    if ($activo !== '') {
        $sql .= " AND u.activo = :activo";
        $params['activo'] = (int)$activo;
    }

    // Contar total
    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM ($sql) as subquery");
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Agregar orden y paginación
    $sql .= " ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset";
    $params['limit'] = $per_page;
    $params['offset'] = $offset;

    $stmt = $pdo->prepare($sql);
    
    // Bind parametros
    foreach ($params as $key => $value) {
        $type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
        $stmt->bindValue(":$key", $value, $type);
    }
    
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatear datos
    foreach ($usuarios as &$usuario) {
        $usuario['id'] = (int)$usuario['id'];
        $usuario['tenant_id'] = (int)$usuario['tenant_id'];
        $usuario['candidato_id'] = $usuario['candidato_id'] ? (int)$usuario['candidato_id'] : null;
        $usuario['coordinador_id'] = $usuario['coordinador_id'] ? (int)$usuario['coordinador_id'] : null;
        $usuario['activo'] = (bool)$usuario['activo'];
        $usuario['total_lideres'] = (int)$usuario['total_lideres'];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'usuarios' => $usuarios,
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => ceil($total / $per_page)
        ]
    ]);
}

/**
 * Obtener usuario por ID
 */
function obtenerUsuario($pdo, $id, $tenant_id) {
    $sql = "SELECT 
                u.*,
                CONCAT(c.nombre, ' ', c.apellidos) as coordinador_nombre,
                (SELECT COUNT(*) FROM usuarios WHERE coordinador_id = u.id AND deleted_at IS NULL) as total_lideres
            FROM usuarios u
            LEFT JOIN usuarios c ON u.coordinador_id = c.id
            WHERE u.id = :id 
            AND u.tenant_id = :tenant_id 
            AND u.deleted_at IS NULL";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $id, 'tenant_id' => $tenant_id]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        throw new Exception('Usuario no encontrado', 404);
    }

    // Formatear
    $usuario['id'] = (int)$usuario['id'];
    $usuario['tenant_id'] = (int)$usuario['tenant_id'];
    $usuario['candidato_id'] = $usuario['candidato_id'] ? (int)$usuario['candidato_id'] : null;
    $usuario['coordinador_id'] = $usuario['coordinador_id'] ? (int)$usuario['coordinador_id'] : null;
    $usuario['activo'] = (bool)$usuario['activo'];
    $usuario['total_lideres'] = (int)$usuario['total_lideres'];
    
    // No enviar password
    unset($usuario['password']);

    echo json_encode([
        'success' => true,
        'data' => $usuario
    ]);
}

/**
 * Crear nuevo usuario
 */
function crearUsuario($pdo, $tenant_id, $candidato_id) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validaciones
    $required = ['nombre', 'apellidos', 'documento', 'password', 'rol'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("El campo '$field' es requerido", 400);
        }
    }

    // Validar rol
    $roles_validos = ['coordinador', 'lider', 'digitador', 'transportador'];
    if (!in_array($data['rol'], $roles_validos)) {
        throw new Exception('Rol no válido', 400);
    }

    // Validar documento único
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE documento = :documento AND tenant_id = :tenant_id AND deleted_at IS NULL");
    $stmt->execute(['documento' => $data['documento'], 'tenant_id' => $tenant_id]);
    if ($stmt->fetch()) {
        throw new Exception('El documento ya está registrado', 400);
    }

    // Validar email único si se proporciona
    if (!empty($data['email'])) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email AND tenant_id = :tenant_id AND deleted_at IS NULL");
        $stmt->execute(['email' => $data['email'], 'tenant_id' => $tenant_id]);
        if ($stmt->fetch()) {
            throw new Exception('El email ya está registrado', 400);
        }
    }

    // Hashear password
    $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);

    // Insertar
    $sql = "INSERT INTO usuarios (
                tenant_id, candidato_id, coordinador_id,
                nombre, apellidos, documento, email, telefono,
                password, rol, activo, created_at, updated_at
            ) VALUES (
                :tenant_id, :candidato_id, :coordinador_id,
                :nombre, :apellidos, :documento, :email, :telefono,
                :password, :rol, :activo, NOW(), NOW()
            )";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'tenant_id' => $tenant_id,
        'candidato_id' => $candidato_id,
        'coordinador_id' => $data['coordinador_id'] ?? null,
        'nombre' => $data['nombre'],
        'apellidos' => $data['apellidos'],
        'documento' => $data['documento'],
        'email' => $data['email'] ?? null,
        'telefono' => $data['telefono'] ?? null,
        'password' => $password_hash,
        'rol' => $data['rol'],
        'activo' => $data['activo'] ?? 1
    ]);

    if (!$result) {
        throw new Exception('Error al crear el usuario', 500);
    }

    $nuevo_id = $pdo->lastInsertId();

    // Registrar auditoría
    registrarAuditoria($pdo, 1, 'crear', 'usuarios', $nuevo_id, null, $data);

    echo json_encode([
        'success' => true,
        'message' => 'Usuario creado exitosamente',
        'data' => ['id' => (int)$nuevo_id]
    ]);
}

/**
 * Actualizar usuario
 */
function actualizarUsuario($pdo, $id, $tenant_id) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Verificar que existe
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id AND tenant_id = :tenant_id AND deleted_at IS NULL");
    $stmt->execute(['id' => $id, 'tenant_id' => $tenant_id]);
    $usuario_actual = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario_actual) {
        throw new Exception('Usuario no encontrado', 404);
    }

    // Validar documento único (excluyendo el actual)
    if (!empty($data['documento']) && $data['documento'] !== $usuario_actual['documento']) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE documento = :documento AND tenant_id = :tenant_id AND id != :id AND deleted_at IS NULL");
        $stmt->execute(['documento' => $data['documento'], 'tenant_id' => $tenant_id, 'id' => $id]);
        if ($stmt->fetch()) {
            throw new Exception('El documento ya está registrado', 400);
        }
    }

    // Validar email único (excluyendo el actual)
    if (!empty($data['email']) && $data['email'] !== $usuario_actual['email']) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email AND tenant_id = :tenant_id AND id != :id AND deleted_at IS NULL");
        $stmt->execute(['email' => $data['email'], 'tenant_id' => $tenant_id, 'id' => $id]);
        if ($stmt->fetch()) {
            throw new Exception('El email ya está registrado', 400);
        }
    }

    // Construir UPDATE dinámico
    $campos = [];
    $params = ['id' => $id, 'tenant_id' => $tenant_id];

    $campos_permitidos = ['nombre', 'apellidos', 'documento', 'email', 'telefono', 'rol', 'coordinador_id', 'activo'];
    
    foreach ($campos_permitidos as $campo) {
        if (array_key_exists($campo, $data)) {
            $campos[] = "$campo = :$campo";
            $params[$campo] = $data[$campo];
        }
    }

    // Si se proporciona nueva contraseña
    if (!empty($data['password'])) {
        $campos[] = "password = :password";
        $params['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    }

    if (empty($campos)) {
        throw new Exception('No hay campos para actualizar', 400);
    }

    $campos[] = "updated_at = NOW()";
    $sql = "UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id = :id AND tenant_id = :tenant_id";

    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);

    if (!$result) {
        throw new Exception('Error al actualizar el usuario', 500);
    }

    // Registrar auditoría
    registrarAuditoria($pdo, 1, 'actualizar', 'usuarios', $id, $usuario_actual, $data);

    echo json_encode([
        'success' => true,
        'message' => 'Usuario actualizado exitosamente'
    ]);
}

/**
 * Eliminar usuario (soft delete)
 */
function eliminarUsuario($pdo, $id, $tenant_id) {
    // Verificar que existe
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id AND tenant_id = :tenant_id AND deleted_at IS NULL");
    $stmt->execute(['id' => $id, 'tenant_id' => $tenant_id]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        throw new Exception('Usuario no encontrado', 404);
    }

    // Verificar si tiene líderes asignados
    if ($usuario['rol'] === 'coordinador') {
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM usuarios WHERE coordinador_id = :id AND deleted_at IS NULL");
        $stmt->execute(['id' => $id]);
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        if ($total > 0) {
            throw new Exception('No se puede eliminar un coordinador con líderes asignados. Reasigne o elimine los líderes primero.', 400);
        }
    }

    // Soft delete
    $sql = "UPDATE usuarios SET deleted_at = NOW(), activo = 0 WHERE id = :id AND tenant_id = :tenant_id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute(['id' => $id, 'tenant_id' => $tenant_id]);

    if (!$result) {
        throw new Exception('Error al eliminar el usuario', 500);
    }

    // Registrar auditoría
    registrarAuditoria($pdo, 1, 'eliminar', 'usuarios', $id, $usuario, null);

    echo json_encode([
        'success' => true,
        'message' => 'Usuario eliminado exitosamente'
    ]);
}

/**
 * Verificar si existe un documento duplicado
 */
function verificarDocumentoDuplicado($pdo, $tenant_id) {
    $documento = $_GET['documento'] ?? '';
    $exclude_id = isset($_GET['exclude_id']) ? (int)$_GET['exclude_id'] : null;

    if (empty($documento)) {
        throw new Exception('Documento requerido', 400);
    }

    $sql = "SELECT id FROM usuarios WHERE documento = :documento AND tenant_id = :tenant_id AND deleted_at IS NULL";
    $params = ['documento' => $documento, 'tenant_id' => $tenant_id];

    if ($exclude_id) {
        $sql .= " AND id != :exclude_id";
        $params['exclude_id'] = $exclude_id;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $existe = $stmt->fetch() !== false;

    echo json_encode([
        'success' => true,
        'data' => ['existe' => $existe]
    ]);
}

/**
 * Cambiar estado de un usuario
 */
function cambiarEstado($pdo, $id, $tenant_id) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['activo'])) {
        throw new Exception('Estado requerido', 400);
    }

    $sql = "UPDATE usuarios SET activo = :activo, updated_at = NOW() WHERE id = :id AND tenant_id = :tenant_id AND deleted_at IS NULL";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'activo' => (int)$data['activo'],
        'id' => $id,
        'tenant_id' => $tenant_id
    ]);

    if (!$result) {
        throw new Exception('Error al cambiar el estado', 500);
    }

    // Registrar auditoría
    registrarAuditoria($pdo, 1, 'cambiar_estado', 'usuarios', $id, null, $data);

    echo json_encode([
        'success' => true,
        'message' => 'Estado actualizado exitosamente'
    ]);
}

/**
 * Resetear contraseña
 */
function resetearPassword($pdo, $id, $tenant_id) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['password'])) {
        throw new Exception('Nueva contraseña requerida', 400);
    }

    $password_hash = password_hash($data['password'], PASSWORD_BCRYPT);

    $sql = "UPDATE usuarios SET password = :password, updated_at = NOW() WHERE id = :id AND tenant_id = :tenant_id AND deleted_at IS NULL";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        'password' => $password_hash,
        'id' => $id,
        'tenant_id' => $tenant_id
    ]);

    if (!$result) {
        throw new Exception('Error al resetear la contraseña', 500);
    }

    // Registrar auditoría (sin incluir la contraseña por seguridad)
    registrarAuditoria($pdo, 1, 'resetear_password', 'usuarios', $id, null, ['password' => '***']);

    echo json_encode([
        'success' => true,
        'message' => 'Contraseña actualizada exitosamente'
    ]);
}
