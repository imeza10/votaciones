<?php
/**
 * Configuración CORS para el Sistema Electoral Colombia
 * Maneja headers CORS y peticiones preflight (OPTIONS)
 */

// Orígenes permitidos
$allowed_origins = [
    'https://imc-st.com',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:4202'
];

// Obtener el origen de la petición
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Verificar si el origen está permitido
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Por defecto permitir localhost para desarrollo
    if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

// Headers CORS necesarios
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 3600"); // Cache preflight por 1 hora

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
