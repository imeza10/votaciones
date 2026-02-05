<?php
/**
 * Funciones de utilidad
 */

/**
 * Respuesta JSON estándar
 */
function jsonResponse($success, $data = null, $message = '', $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Validar token JWT
 */
function validateToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (empty($authHeader)) {
        jsonResponse(false, null, 'Token no proporcionado', 401);
    }
    
    $token = str_replace('Bearer ', '', $authHeader);
    
    try {
        // Aquí implementar validación JWT real
        // Por ahora, validación simple
        if (empty($token)) {
            jsonResponse(false, null, 'Token inválido', 401);
        }
        
        return true;
    } catch (Exception $e) {
        jsonResponse(false, null, 'Token expirado o inválido', 401);
    }
}

/**
 * Obtener usuario del token
 */
function getUserFromToken() {
    // Implementar extracción de datos del usuario desde el token JWT
    return [
        'id' => 1,
        'tenant_id' => 1,
        'rol' => 'admin_candidato'
    ];
}

/**
 * Validar permisos
 */
function checkRole($allowedRoles) {
    $user = getUserFromToken();
    if (!in_array($user['rol'], $allowedRoles)) {
        jsonResponse(false, null, 'No tiene permisos para esta acción', 403);
    }
}

/**
 * Sanitizar entrada
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validar documento colombiano
 */
function validarDocumento($documento) {
    return preg_match('/^[0-9]{6,10}$/', $documento);
}

/**
 * Validar teléfono colombiano
 */
function validarTelefono($telefono) {
    return preg_match('/^3[0-9]{9}$/', $telefono);
}

/**
 * Generar UUID
 */
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Registrar auditoría
 */
function registrarAuditoria($pdo, $usuario_id, $accion, $tabla, $registro_id = null, $datos_anteriores = null, $datos_nuevos = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO auditoria 
            (usuario_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $usuario_id,
            $accion,
            $tabla,
            $registro_id,
            json_encode($datos_anteriores),
            json_encode($datos_nuevos),
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    } catch (PDOException $e) {
        // Log error pero no detener ejecución
        error_log('Error auditoría: ' . $e->getMessage());
    }
}
