<?php
/**
 * API de Votantes
 * Endpoints: GET (listar), GET/:id (obtener), POST (crear), PUT/:id (actualizar), DELETE/:id (eliminar)
 * Endpoint especial: GET verificar-duplicado
 */

// Incluir configuración CORS (debe ser lo primero)
require_once '../../includes/cors.php';

require_once '../../config/config.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');

// Validar autenticación
validateToken();
$currentUser = getUserFromToken();

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Extraer el ID o acción de la URL
$uriParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));
$action = end($uriParts);

// Ruta especial: verificar duplicado
if ($method === 'GET' && $action === 'verificar-duplicado') {
    verificarDuplicado();
    exit;
}

// Verificar si hay un ID en la URL
$votanteId = null;
if (is_numeric($action)) {
    $votanteId = intval($action);
}

switch ($method) {
    case 'GET':
        if ($votanteId) {
            obtenerVotante($votanteId);
        } else {
            listarVotantes();
        }
        break;
    case 'POST':
        crearVotante();
        break;
    case 'PUT':
        if ($votanteId) {
            actualizarVotante($votanteId);
        } else {
            jsonResponse(false, null, 'ID de votante requerido', 400);
        }
        break;
    case 'DELETE':
        if ($votanteId) {
            eliminarVotante($votanteId);
        } else {
            jsonResponse(false, null, 'ID de votante requerido', 400);
        }
        break;
    default:
        jsonResponse(false, null, 'Método no permitido', 405);
}

/**
 * Listar votantes con filtros y paginación
 */
function listarVotantes() {
    global $pdo, $currentUser;
    
    try {
        $page = intval($_GET['page'] ?? 1);
        $perPage = intval($_GET['per_page'] ?? 10);
        $offset = ($page - 1) * $perPage;
        
        $where = ["v.tenant_id = ?"];
        $params = [$currentUser['tenant_id']];
        
        // Filtros opcionales
        if (!empty($_GET['lider_id'])) {
            $where[] = "v.lider_id = ?";
            $params[] = intval($_GET['lider_id']);
        }
        
        if (!empty($_GET['coordinador_id'])) {
            $where[] = "v.coordinador_id = ?";
            $params[] = intval($_GET['coordinador_id']);
        }
        
        if (!empty($_GET['departamento_id'])) {
            $where[] = "v.departamento_id = ?";
            $params[] = intval($_GET['departamento_id']);
        }
        
        if (!empty($_GET['municipio_id'])) {
            $where[] = "v.municipio_id = ?";
            $params[] = intval($_GET['municipio_id']);
        }
        
        if (!empty($_GET['voto_confirmado'])) {
            $where[] = "v.voto_confirmado = ?";
            $params[] = intval($_GET['voto_confirmado']);
        }
        
        // Búsqueda por texto
        if (!empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $where[] = "(v.documento LIKE ? OR v.nombres LIKE ? OR v.apellidos LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Total de registros
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as total FROM votantes v WHERE $whereClause");
        $stmtCount->execute($params);
        $total = $stmtCount->fetch()['total'];
        
        // Datos paginados
        $sql = "
            SELECT v.*, 
                   l.nombres as lider_nombres, l.apellidos as lider_apellidos,
                   c.nombres as coordinador_nombres, c.apellidos as coordinador_apellidos,
                   d.nombre as departamento_nombre,
                   m.nombre as municipio_nombre,
                   lv.nombre as lugar_votacion_nombre
            FROM votantes v
            LEFT JOIN usuarios l ON v.lider_id = l.id
            LEFT JOIN usuarios c ON v.coordinador_id = c.id
            LEFT JOIN departamentos d ON v.departamento_id = d.id
            LEFT JOIN municipios m ON v.municipio_id = m.id
            LEFT JOIN lugares_votacion lv ON v.lugar_votacion_id = lv.id
            WHERE $whereClause
            ORDER BY v.created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        $params[] = (int)$perPage;
        $params[] = (int)$offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $votantes = $stmt->fetchAll();
        
        jsonResponse(true, [
            'votantes' => $votantes,
            'meta' => [
                'current_page' => (int)$page,
                'per_page' => (int)$perPage,
                'total' => (int)$total,
                'last_page' => ceil($total / $perPage)
            ]
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al consultar votantes', 500);
    }
}

/**
 * Obtener un votante por ID
 */
function obtenerVotante($id) {
    global $pdo, $currentUser;
    
    try {
        $stmt = $pdo->prepare("
            SELECT v.*, 
                   l.nombres as lider_nombres, l.apellidos as lider_apellidos,
                   c.nombres as coordinador_nombres, c.apellidos as coordinador_apellidos,
                   d.nombre as departamento_nombre,
                   m.nombre as municipio_nombre,
                   b.nombre as barrio_nombre,
                   lv.nombre as lugar_votacion_nombre
            FROM votantes v
            LEFT JOIN usuarios l ON v.lider_id = l.id
            LEFT JOIN usuarios c ON v.coordinador_id = c.id
            LEFT JOIN departamentos d ON v.departamento_id = d.id
            LEFT JOIN municipios m ON v.municipio_id = m.id
            LEFT JOIN barrios b ON v.barrio_id = b.id
            LEFT JOIN lugares_votacion lv ON v.lugar_votacion_id = lv.id
            WHERE v.id = ? AND v.tenant_id = ?
        ");
        $stmt->execute([$id, $currentUser['tenant_id']]);
        $votante = $stmt->fetch();
        
        if (!$votante) {
            jsonResponse(false, null, 'Votante no encontrado', 404);
        }
        
        jsonResponse(true, $votante);
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al obtener votante', 500);
    }
}

/**
 * Crear nuevo votante
 */
function crearVotante() {
    global $pdo, $currentUser;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validaciones básicas
    $required = ['documento', 'nombres', 'apellidos', 'departamento_id', 'municipio_id', 'lider_id'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            jsonResponse(false, null, "El campo $field es requerido", 400);
        }
    }
    
    // Validar formato documento
    if (!validarDocumento($input['documento'])) {
        jsonResponse(false, null, 'Documento inválido (debe tener 6-10 dígitos)', 400);
    }
    
    // Validar teléfono si se proporciona
    if (!empty($input['telefono']) && !validarTelefono($input['telefono'])) {
        jsonResponse(false, null, 'Teléfono inválido (formato: 3XXXXXXXXX)', 400);
    }
    
    try {
        // Verificar duplicado
        $stmt = $pdo->prepare("
            SELECT id, candidato_id FROM votantes 
            WHERE documento = ? AND tenant_id = ?
        ");
        $stmt->execute([$input['documento'], $currentUser['tenant_id']]);
        $existente = $stmt->fetch();
        
        if ($existente) {
            jsonResponse(false, [
                'duplicado' => true,
                'votante_existente' => $existente
            ], 'Ya existe un votante con este documento', 409);
        }
        
        // Insertar votante
        $stmt = $pdo->prepare("
            INSERT INTO votantes (
                tenant_id, candidato_id, lider_id, coordinador_id, 
                documento, nombres, apellidos, telefono, direccion,
                departamento_id, municipio_id, barrio_id, comuna,
                lugar_votacion_id, mesa, zona, es_jurado, observaciones,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $currentUser['tenant_id'],
            $currentUser['candidato_id'] ?? null,
            $input['lider_id'],
            $input['coordinador_id'] ?? null,
            $input['documento'],
            $input['nombres'],
            $input['apellidos'],
            $input['telefono'] ?? null,
            $input['direccion'] ?? null,
            $input['departamento_id'],
            $input['municipio_id'],
            $input['barrio_id'] ?? null,
            $input['comuna'] ?? null,
            $input['lugar_votacion_id'] ?? null,
            $input['mesa'] ?? null,
            $input['zona'] ?? null,
            $input['es_jurado'] ?? 0,
            $input['observaciones'] ?? null,
            $currentUser['id']
        ]);
        
        $votanteId = $pdo->lastInsertId();
        
        // Registrar auditoría
        registrarAuditoria($pdo, $currentUser['id'], 'votantes', $votanteId, 'crear', null, $input);
        
        jsonResponse(true, ['id' => $votanteId], 'Votante registrado exitosamente', 201);
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al crear votante', 500);
    }
}

/**
 * Actualizar votante
 */
function actualizarVotante($id) {
    global $pdo, $currentUser;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Verificar que el votante existe y pertenece al tenant
        $stmt = $pdo->prepare("SELECT * FROM votantes WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$id, $currentUser['tenant_id']]);
        $votanteAnterior = $stmt->fetch();
        
        if (!$votanteAnterior) {
            jsonResponse(false, null, 'Votante no encontrado', 404);
        }
        
        // Si se cambia el documento, verificar duplicados
        if (isset($input['documento']) && $input['documento'] !== $votanteAnterior['documento']) {
            if (!validarDocumento($input['documento'])) {
                jsonResponse(false, null, 'Documento inválido', 400);
            }
            
            $stmt = $pdo->prepare("
                SELECT id FROM votantes 
                WHERE documento = ? AND tenant_id = ? AND id != ?
            ");
            $stmt->execute([$input['documento'], $currentUser['tenant_id'], $id]);
            
            if ($stmt->fetch()) {
                jsonResponse(false, null, 'Ya existe otro votante con este documento', 409);
            }
        }
        
        // Validar teléfono si se proporciona
        if (isset($input['telefono']) && !empty($input['telefono']) && !validarTelefono($input['telefono'])) {
            jsonResponse(false, null, 'Teléfono inválido', 400);
        }
        
        // Construir UPDATE dinámico solo con campos proporcionados
        $fields = [];
        $values = [];
        $allowedFields = [
            'lider_id', 'coordinador_id', 'documento', 'nombres', 'apellidos', 
            'telefono', 'direccion', 'departamento_id', 'municipio_id', 'barrio_id',
            'comuna', 'lugar_votacion_id', 'mesa', 'zona', 'es_jurado', 'observaciones'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $values[] = $input[$field];
            }
        }
        
        if (empty($fields)) {
            jsonResponse(false, null, 'No hay campos para actualizar', 400);
        }
        
        $fields[] = "updated_by = ?";
        $values[] = $currentUser['id'];
        $values[] = $id;
        $values[] = $currentUser['tenant_id'];
        
        $sql = "UPDATE votantes SET " . implode(', ', $fields) . " WHERE id = ? AND tenant_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        // Registrar auditoría
        registrarAuditoria($pdo, $currentUser['id'], 'votantes', $id, 'actualizar', $votanteAnterior, $input);
        
        jsonResponse(true, null, 'Votante actualizado exitosamente');
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al actualizar votante', 500);
    }
}

/**
 * Eliminar votante (soft delete)
 */
function eliminarVotante($id) {
    global $pdo, $currentUser;
    
    try {
        // Verificar que el votante existe
        $stmt = $pdo->prepare("SELECT * FROM votantes WHERE id = ? AND tenant_id = ?");
        $stmt->execute([$id, $currentUser['tenant_id']]);
        $votante = $stmt->fetch();
        
        if (!$votante) {
            jsonResponse(false, null, 'Votante no encontrado', 404);
        }
        
        // Soft delete
        $stmt = $pdo->prepare("
            UPDATE votantes 
            SET deleted_at = NOW(), deleted_by = ? 
            WHERE id = ? AND tenant_id = ?
        ");
        $stmt->execute([$currentUser['id'], $id, $currentUser['tenant_id']]);
        
        // Registrar auditoría
        registrarAuditoria($pdo, $currentUser['id'], 'votantes', $id, 'eliminar', $votante, null);
        
        jsonResponse(true, null, 'Votante eliminado exitosamente');
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al eliminar votante', 500);
    }
}

/**
 * Verificar si existe un documento duplicado
 */
function verificarDuplicado() {
    global $pdo, $currentUser;
    
    $documento = $_GET['documento'] ?? '';
    
    if (empty($documento)) {
        jsonResponse(false, null, 'Documento requerido', 400);
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT v.id, v.documento, v.nombres, v.apellidos, v.telefono,
                   c.nombre as candidato_nombre
            FROM votantes v
            LEFT JOIN usuarios c ON v.candidato_id = c.id
            WHERE v.documento = ? AND v.tenant_id = ? AND v.deleted_at IS NULL
        ");
        $stmt->execute([$documento, $currentUser['tenant_id']]);
        $votante = $stmt->fetch();
        
        if ($votante) {
            jsonResponse(true, [
                'duplicado' => true,
                'votante' => $votante
            ], 'Ya existe un votante con este documento');
        } else {
            jsonResponse(true, [
                'duplicado' => false
            ], 'Documento disponible');
        }
        
    } catch (PDOException $e) {
        jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al verificar duplicado', 500);
    }
}

/**
 * Registrar auditoría
 */
function registrarAuditoria($pdo, $userId, $tabla, $registroId, $accion, $valorAnterior, $valorNuevo) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO auditoria (usuario_id, tabla, registro_id, accion, valor_anterior, valor_nuevo)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $tabla,
            $registroId,
            $accion,
            json_encode($valorAnterior),
            json_encode($valorNuevo)
        ]);
    } catch (PDOException $e) {
        // Log error but don't stop execution
        error_log("Error auditoría: " . $e->getMessage());
    }
}
