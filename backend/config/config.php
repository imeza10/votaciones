<?php
/**
 * Configuración de Base de Datos
 * Sistema Electoral Colombia
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'u649057458_eleccionesv2');
define('DB_USER', 'u649057458_eleccionesv2');
define('DB_PASS', ':9iM+PWkXT');
define('DB_CHARSET', 'utf8mb4');

// Configuración de JWT
define('JWT_SECRET', 'TU_CLAVE_SECRETA_AQUI_CAMBIAR_EN_PRODUCCION');
define('JWT_EXPIRATION', 3600); // 1 hora en segundos
define('JWT_REFRESH_EXPIRATION', 604800); // 7 días en segundos

// Configuración de CORS
define('ALLOWED_ORIGINS', [
    'https://imc-st.com',
    'http://localhost:4200',
    'http://localhost:4201'
]);

// Configuración de la aplicación
define('APP_ENV', 'production'); // development | production
define('APP_DEBUG', false);
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 5242880); // 5MB

// Zona horaria
date_default_timezone_set('America/Bogota');

// Manejo de errores
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Conexión a la base de datos
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
} catch (PDOException $e) {
    if (APP_DEBUG) {
        die(json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos: ' . $e->getMessage()
        ]));
    } else {
        die(json_encode([
            'success' => false,
            'message' => 'Error de conexión a la base de datos'
        ]));
    }
}

// Headers CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
