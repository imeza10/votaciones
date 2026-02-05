<?php
/**
 * Generador de hash para contraseña
 * Ejecutar este archivo y copiar el hash generado
 */

$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Contraseña: $password\n";
echo "Hash generado: $hash\n\n";

echo "SQL para actualizar:\n";
echo "UPDATE usuarios SET password = '$hash' WHERE documento = '1102840654';\n\n";

// Verificar que funciona
if (password_verify($password, $hash)) {
    echo "✓ Verificación exitosa: El hash es válido\n";
} else {
    echo "✗ Error: El hash no es válido\n";
}
?>
