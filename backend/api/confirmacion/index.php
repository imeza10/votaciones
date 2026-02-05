<?php
/**
 * API de Confirmación de Votos
 * Endpoints: 
 * - GET: Listar votantes con estado de confirmación
 * - GET /estadisticas: Obtener estadísticas de confirmación
 * - POST: Confirmar un voto
 * - PUT/:id: Actualizar confirmación existente
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

// Ruta especial: estadísticas
if ($method === 'GET' && $action === 'estadisticas') {
    obtenerEstadisticas();
    exit;
}

// Verificar si hay un ID en la URL
$confirmacionId = null;
if (is_numeric($action)) {
    $confirmacionId = intval($action);
}

switch ($method) {
    case 'GET':
        listarConfirmaciones();
        break;
    case 'POST':
        confirmarVoto();
        break;
    case 'PUT':
        if ($confirmacionId) {
            actualizarConfirmacion($confirmacionId);
        } else {
            jsonResponse(false, null, 'ID de confirmación requerido', 400);
        }
        break;
    default:
        jsonResponse(false, null, 'Método no permitido', 405);
}

/**
 * Listar votantes con su estado de confirmación
 */
function listarConfirmaciones() {
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
        
        if (!empty($_GET['barrio_id'])) {
            $where[] = "v.barrio_id = ?";
            $params[] = intval($_GET['barrio_id']);
        }
        
        // Filtro por estado de confirmación
        if (isset($_GET['confirmado'])) {
            if ($_GET['confirmado'] === 'true' || $_GET['confirmado'] === '1') {
                $where[] = "cv.id IS NOT NULL";
            } else {
                $where[] = "cv.id IS NULL";
            }
        }
        
        // Filtro por voto (solo si confirmado)
        if (isset($_GET['voto']) && ($_GET['voto'] === 'true' || $_GET['voto'] === 'false')) {
            $where[] = "cv.voto = ?";
            $params[] = $_GET['voto'] === 'true' ? 1 : 0;
        }
        
        // Búsqueda por texto
        if (!empty($_GET['search'])) {
            $search = '%' . $_GET['search'] . '%';
            $where[] = "(CONCAT(v.nombres, ' ', v.apellidos) LIKE ? OR v.documento LIKE ? OR v.telefono LIKE ?)";
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }
        
        $whereClause = implode(' AND ', $where);
        
        // Consulta principal con JOIN a confirmacion_votos
        $sql = "
            SELECT 
                v.id,
                v.documento,
                v.nombres,
                v.apellidos,
                v.telefono,
                v.direccion,
                v.mesa,
                v.lugar_votacion_id,
                d.nombre AS departamento,
                m.nombre AS municipio,
                b.nombre AS barrio,
                l.nombre AS lider,
                c.nombre AS coordinador,
                lv.nombre AS lugar_votacion,
                lv.direccion AS lugar_votacion_direccion,
                cv.id AS confirmacion_id,
                cv.voto,
                cv.hora_confirmacion,
                cv.observaciones AS confirmacion_observaciones,
                u.nombres AS confirmado_por
            FROM votantes v
            LEFT JOIN confirmacion_votos cv ON v.id = cv.votante_id
            LEFT JOIN departamentos d ON v.departamento_id = d.id
            LEFT JOIN municipios m ON v.municipio_id = m.id
            LEFT JOIN barrios b ON v.barrio_id = b.id
            LEFT JOIN usuarios l ON v.lider_id = l.id
            LEFT JOIN usuarios c ON v.coordinador_id = c.id
            LEFT JOIN lugares_votacion lv ON v.lugar_votacion_id = lv.id
            LEFT JOIN usuarios u ON cv.confirmado_por_id = u.id
            WHERE $whereClause
            ORDER BY 
                CASE 
                    WHEN cv.id IS NULL THEN 0 
                    ELSE 1 
                END, 
                v.apellidos, 
                v.nombres
            LIMIT $perPage OFFSET $offset
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $votantes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear datos
        foreach ($votantes as &$votante) {
            $votante['confirmado'] = !is_null($votante['confirmacion_id']);
            $votante['voto'] = $votante['voto'] ? true : false;
        }
        
        // Contar total de registros
        $countSql = "
            SELECT COUNT(*) as total
            FROM votantes v
            LEFT JOIN confirmacion_votos cv ON v.id = cv.votante_id
            WHERE $whereClause
        ";
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $response = [
            'data' => $votantes,
            'pagination' => [
                'total' => intval($total),
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ]
        ];
        
        jsonResponse(true, $response);
        
    } catch (PDOException $e) {
        error_log("Error al listar confirmaciones: " . $e->getMessage());
        jsonResponse(false, null, 'Error al obtener confirmaciones', 500);
    }
}

/**
 * Confirmar un voto
 */
function confirmarVoto() {
    global $pdo, $currentUser;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validaciones
        if (!isset($input['votante_id'])) {
            jsonResponse(false, null, 'ID de votante requerido', 400);
        }
        
        $votanteId = intval($input['votante_id']);
        $voto = isset($input['voto']) ? (bool)$input['voto'] : false;
        $observaciones = $input['observaciones'] ?? null;
        
        // Verificar que el votante existe y pertenece al tenant
        $stmt = $pdo->prepare("
            SELECT id FROM votantes 
            WHERE id = ? AND tenant_id = ?
        ");
        $stmt->execute([$votanteId, $currentUser['tenant_id']]);
        
        if (!$stmt->fetch()) {
            jsonResponse(false, null, 'Votante no encontrado', 404);
        }
        
        // Verificar si ya existe una confirmación
        $stmt = $pdo->prepare("
            SELECT id FROM confirmacion_votos WHERE votante_id = ?
        ");
        $stmt->execute([$votanteId]);
        $existente = $stmt->fetch();
        
        $pdo->beginTransaction();
        
        if ($existente) {
            // Actualizar confirmación existente
            $stmt = $pdo->prepare("
                UPDATE confirmacion_votos 
                SET voto = ?,
                    hora_confirmacion = NOW(),
                    confirmado_por_id = ?,
                    observaciones = ?,
                    updated_at = NOW()
                WHERE votante_id = ?
            ");
            $stmt->execute([
                $voto ? 1 : 0,
                $currentUser['id'],
                $observaciones,
                $votanteId
            ]);
            $confirmacionId = $existente['id'];
            
        } else {
            // Crear nueva confirmación
            $stmt = $pdo->prepare("
                INSERT INTO confirmacion_votos (
                    votante_id,
                    voto,
                    hora_confirmacion,
                    confirmado_por_id,
                    observaciones
                ) VALUES (?, ?, NOW(), ?, ?)
            ");
            $stmt->execute([
                $votanteId,
                $voto ? 1 : 0,
                $currentUser['id'],
                $observaciones
            ]);
            $confirmacionId = $pdo->lastInsertId();
        }
        
        // Registrar en auditoría
        registrarAuditoria(
            $currentUser['tenant_id'],
            $currentUser['id'],
            'confirmacion_votos',
            $confirmacionId,
            $existente ? 'update' : 'insert',
            null,
            json_encode([
                'votante_id' => $votanteId,
                'voto' => $voto,
                'observaciones' => $observaciones
            ])
        );
        
        $pdo->commit();
        
        // Obtener el registro completo
        $stmt = $pdo->prepare("
            SELECT 
                cv.*,
                v.nombres,
                v.apellidos,
                v.documento,
                u.nombres AS confirmado_por
            FROM confirmacion_votos cv
            INNER JOIN votantes v ON cv.votante_id = v.id
            LEFT JOIN usuarios u ON cv.confirmado_por_id = u.id
            WHERE cv.id = ?
        ");
        $stmt->execute([$confirmacionId]);
        $confirmacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $confirmacion, 'Voto confirmado exitosamente', 201);
        
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Error al confirmar voto: " . $e->getMessage());
        jsonResponse(false, null, 'Error al confirmar voto', 500);
    }
}

/**
 * Actualizar confirmación existente
 */
function actualizarConfirmacion($confirmacionId) {
    global $pdo, $currentUser;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Verificar que la confirmación existe y pertenece al tenant
        $stmt = $pdo->prepare("
            SELECT cv.id, cv.votante_id 
            FROM confirmacion_votos cv
            INNER JOIN votantes v ON cv.votante_id = v.id
            WHERE cv.id = ? AND v.tenant_id = ?
        ");
        $stmt->execute([$confirmacionId, $currentUser['tenant_id']]);
        $existente = $stmt->fetch();
        
        if (!$existente) {
            jsonResponse(false, null, 'Confirmación no encontrada', 404);
        }
        
        $voto = isset($input['voto']) ? (bool)$input['voto'] : false;
        $observaciones = $input['observaciones'] ?? null;
        
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            UPDATE confirmacion_votos 
            SET voto = ?,
                observaciones = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $voto ? 1 : 0,
            $observaciones,
            $confirmacionId
        ]);
        
        // Registrar en auditoría
        registrarAuditoria(
            $currentUser['tenant_id'],
            $currentUser['id'],
            'confirmacion_votos',
            $confirmacionId,
            'update',
            null,
            json_encode($input)
        );
        
        $pdo->commit();
        
        // Obtener el registro actualizado
        $stmt = $pdo->prepare("
            SELECT 
                cv.*,
                v.nombres,
                v.apellidos,
                v.documento,
                u.nombres AS confirmado_por
            FROM confirmacion_votos cv
            INNER JOIN votantes v ON cv.votante_id = v.id
            LEFT JOIN usuarios u ON cv.confirmado_por_id = u.id
            WHERE cv.id = ?
        ");
        $stmt->execute([$confirmacionId]);
        $confirmacion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        jsonResponse(true, $confirmacion, 'Confirmación actualizada exitosamente');
        
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Error al actualizar confirmación: " . $e->getMessage());
        jsonResponse(false, null, 'Error al actualizar confirmación', 500);
    }
}

/**
 * Obtener estadísticas de confirmación
 */
function obtenerEstadisticas() {
    global $pdo, $currentUser;
    
    try {
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
        
        $whereClause = implode(' AND ', $where);
        
        // Estadísticas generales
        $sql = "
            SELECT 
                COUNT(v.id) AS total_votantes,
                COUNT(cv.id) AS total_confirmados,
                COUNT(CASE WHEN cv.voto = 1 THEN 1 END) AS votos_favor,
                COUNT(CASE WHEN cv.voto = 0 THEN 1 END) AS votos_contra,
                COUNT(CASE WHEN cv.id IS NULL THEN 1 END) AS pendientes
            FROM votantes v
            LEFT JOIN confirmacion_votos cv ON v.id = cv.votante_id
            WHERE $whereClause
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Calcular porcentajes
        $total = intval($stats['total_votantes']);
        $confirmados = intval($stats['total_confirmados']);
        $votos_favor = intval($stats['votos_favor']);
        $votos_contra = intval($stats['votos_contra']);
        $pendientes = intval($stats['pendientes']);
        
        $porcentaje_confirmacion = $total > 0 ? round(($confirmados / $total) * 100, 2) : 0;
        $porcentaje_favor = $confirmados > 0 ? round(($votos_favor / $confirmados) * 100, 2) : 0;
        $porcentaje_contra = $confirmados > 0 ? round(($votos_contra / $confirmados) * 100, 2) : 0;
        
        // Estadísticas por municipio
        $sqlMunicipios = "
            SELECT 
                m.nombre AS municipio,
                COUNT(v.id) AS total,
                COUNT(cv.id) AS confirmados,
                COUNT(CASE WHEN cv.voto = 1 THEN 1 END) AS votos_favor
            FROM votantes v
            LEFT JOIN confirmacion_votos cv ON v.id = cv.votante_id
            INNER JOIN municipios m ON v.municipio_id = m.id
            WHERE $whereClause
            GROUP BY m.id, m.nombre
            ORDER BY confirmados DESC
            LIMIT 10
        ";
        
        $stmtMunicipios = $pdo->prepare($sqlMunicipios);
        $stmtMunicipios->execute($params);
        $por_municipio = $stmtMunicipios->fetchAll(PDO::FETCH_ASSOC);
        
        // Estadísticas por hora (últimas 24 horas)
        $sqlPorHora = "
            SELECT 
                HOUR(cv.hora_confirmacion) AS hora,
                COUNT(*) AS confirmaciones
            FROM confirmacion_votos cv
            INNER JOIN votantes v ON cv.votante_id = v.id
            WHERE v.tenant_id = ? 
                AND cv.hora_confirmacion >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY HOUR(cv.hora_confirmacion)
            ORDER BY hora
        ";
        
        $stmtHora = $pdo->prepare($sqlPorHora);
        $stmtHora->execute([$currentUser['tenant_id']]);
        $por_hora = $stmtHora->fetchAll(PDO::FETCH_ASSOC);
        
        // Top confirmadores
        $sqlConfirmadores = "
            SELECT 
                u.nombres,
                u.apellidos,
                COUNT(cv.id) AS total_confirmaciones
            FROM confirmacion_votos cv
            INNER JOIN votantes v ON cv.votante_id = v.id
            INNER JOIN usuarios u ON cv.confirmado_por_id = u.id
            WHERE v.tenant_id = ?
            GROUP BY u.id, u.nombres, u.apellidos
            ORDER BY total_confirmaciones DESC
            LIMIT 10
        ";
        
        $stmtConfirmadores = $pdo->prepare($sqlConfirmadores);
        $stmtConfirmadores->execute([$currentUser['tenant_id']]);
        $confirmadores = $stmtConfirmadores->fetchAll(PDO::FETCH_ASSOC);
        
        $response = [
            'resumen' => [
                'total_votantes' => $total,
                'total_confirmados' => $confirmados,
                'votos_favor' => $votos_favor,
                'votos_contra' => $votos_contra,
                'pendientes' => $pendientes,
                'porcentaje_confirmacion' => $porcentaje_confirmacion,
                'porcentaje_favor' => $porcentaje_favor,
                'porcentaje_contra' => $porcentaje_contra,
            ],
            'por_municipio' => $por_municipio,
            'por_hora' => $por_hora,
            'top_confirmadores' => $confirmadores
        ];
        
        jsonResponse(true, $response);
        
    } catch (PDOException $e) {
        error_log("Error al obtener estadísticas: " . $e->getMessage());
        jsonResponse(false, null, 'Error al obtener estadísticas', 500);
    }
}
