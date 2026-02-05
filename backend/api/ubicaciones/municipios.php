<?php
/**
 * API de Municipios
 * GET /api/ubicaciones/municipios/:departamento_id - Listar municipios de un departamento
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

// Extraer departamento_id de la URL
$requestUri = $_SERVER['REQUEST_URI'];
$uriParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));
$departamentoId = end($uriParts);

if (!is_numeric($departamentoId)) {
    jsonResponse(false, null, 'ID de departamento inválido', 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, codigo, nombre, departamento_id
        FROM municipios 
        WHERE departamento_id = ? AND activo = 1 
        ORDER BY nombre ASC
    ");
    $stmt->execute([intval($departamentoId)]);
    $municipios = $stmt->fetchAll();
    
    jsonResponse(true, $municipios);
    
} catch (PDOException $e) {
    jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al consultar municipios', 500);
}
