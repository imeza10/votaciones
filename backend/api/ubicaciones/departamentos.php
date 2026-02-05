<?php
/**
 * API de Departamentos
 * GET /api/ubicaciones/departamentos - Listar departamentos de Colombia
 */

// Incluir configuración CORS
require_once '../../includes/cors.php';

require_once '../../config/config.php';
require_once '../../includes/functions.php';

header('Content-Type: application/json; charset=utf-8');

validateToken();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

try {
    $stmt = $pdo->query("
        SELECT id, codigo, nombre 
        FROM departamentos 
        WHERE activo = 1 
        ORDER BY nombre ASC
    ");
    $departamentos = $stmt->fetchAll();
    
    jsonResponse(true, $departamentos);
    
} catch (PDOException $e) {
    jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al consultar departamentos', 500);
}
