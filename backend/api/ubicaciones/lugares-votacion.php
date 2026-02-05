<?php
/**
 * API de Lugares de Votación
 * GET /api/ubicaciones/lugares-votacion/:municipio_id - Listar lugares de votación de un municipio
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

// Extraer municipio_id de la URL
$requestUri = $_SERVER['REQUEST_URI'];
$uriParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));
$municipioId = end($uriParts);

if (!is_numeric($municipioId)) {
    jsonResponse(false, null, 'ID de municipio inválido', 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, nombre, direccion, municipio_id, zona, num_mesas
        FROM lugares_votacion 
        WHERE municipio_id = ? AND activo = 1 
        ORDER BY nombre ASC
    ");
    $stmt->execute([intval($municipioId)]);
    $lugares = $stmt->fetchAll();
    
    jsonResponse(true, $lugares);
    
} catch (PDOException $e) {
    jsonResponse(false, null, APP_DEBUG ? $e->getMessage() : 'Error al consultar lugares de votación', 500);
}
