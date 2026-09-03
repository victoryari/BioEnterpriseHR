<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CREANDO TABLAS DE UTILIDADES EN MYSQL ===\n";

DB::statement("
CREATE TABLE IF NOT EXISTS utilidades_anuales (
    id VARCHAR(100) PRIMARY KEY,
    ejercicio_fiscal INT NOT NULL,
    empresa VARCHAR(150) NOT NULL,
    renta_neta_empresa DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    porcentaje_sector DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    monto_total_distribuir DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    monto_50_dias DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    monto_50_remuneraciones DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    total_dias_empresa INT NOT NULL DEFAULT 0,
    total_remuneraciones_empresa DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    factor_dias DECIMAL(14,6) NOT NULL DEFAULT 0.000000,
    factor_remuneraciones DECIMAL(14,6) NOT NULL DEFAULT 0.000000,
    conteo_trabajadores INT NOT NULL DEFAULT 0,
    estado VARCHAR(50) NOT NULL DEFAULT 'Procesado',
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

DB::statement("
CREATE TABLE IF NOT EXISTS utilidades_detalles (
    id VARCHAR(100) PRIMARY KEY,
    utilidad_id VARCHAR(100) NOT NULL,
    empleado_id VARCHAR(50) NOT NULL,
    nombre_empleado VARCHAR(200) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    cargo VARCHAR(100) NULL,
    dias_laborados_trabajador INT NOT NULL DEFAULT 0,
    monto_por_dias DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    remuneracion_anual_trabajador DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    monto_por_remuneracion DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    utilidad_bruta DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    excedente_tope_18_sueldos DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    utilidad_computable DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    descuento_ir5ta DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    utilidad_neta_pagar DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    banco_abono VARCHAR(50) NULL,
    numero_cuenta_abono VARCHAR(50) NULL,
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilidad_id) REFERENCES utilidades_anuales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

echo "TABLAS DE UTILIDADES CREADAS EN MYSQL EXITOSAMENTE.\n";
