<?php
/**
 * API de Autenticación
 * Login de usuarios
 */

// Incluir configuración CORS (debe ser lo primero)
require_once '../../includes/cors.php';

require_once '../../config/config.php';
require_once '../../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, null, 'Método no permitido', 405);
}

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);
$documento = sanitizeInput($input['documento'] ?? '');
$password = $input['password'] ?? '';

// Validaciones
if (empty($documento) || empty($password)) {
    jsonResponse(false, null, 'Documento y contraseña son requeridos', 400);
}

try {
    // Buscar usuario
    $stmt = $pdo->prepare("
        SELECT u.*, c.nombre as candidato_nombre 
        FROM usuarios u
        LEFT JOIN candidatos c ON u.candidato_id = c.id
        WHERE u.documento = ? AND u.activo = 1
    ");
    $stmt->execute([$documento]);
    $usuario = $stmt->fetch();
    
    if (!$usuario) {
        jsonResponse(false, null, 'Credenciales inválidas', 401);
    }
    
    // Verificar contraseña
    if (!password_verify($password, $usuario['password'])) {
        jsonResponse(false, null, 'Credenciales inválidas', 401);
    }
    
    // Generar tokens (simplificado, implementar JWT real)
    $token = base64_encode($usuario['id'] . ':' . time());
    $refreshToken = base64_encode($usuario['id'] . ':' . (time() + JWT_REFRESH_EXPIRATION));
    
    // Actualizar último acceso
    $stmt = $pdo->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
    $stmt->execute([$usuario['id']]);
    
    // Registrar auditoría
    registrarAuditoria($pdo, $usuario['id'], 'login', 'usuarios', $usuario['id']);
    
    // Preparar respuesta
    unset($usuario['password']);
    
    jsonResponse(true, [
        'token' => $token,
        'refreshToken' => $refreshToken,
        'usuario' => $usuario
    ], 'Login exitoso');
    
} catch (PDOException $e) {
    if (APP_DEBUG) {
        jsonResponse(false, null, 'Error: ' . $e->getMessage(), 500);
    } else {
        jsonResponse(false, null, 'Error al procesar la solicitud', 500);
    }
}
