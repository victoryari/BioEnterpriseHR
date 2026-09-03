<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== LIMPIANDO REGISTROS DE PRUEBA DE UTILIDADES (D.L. 892) ===\n\n";

$deletedDet = DB::table('utilidades_detalles')->delete();
echo "✔ Detalles de utilidades eliminados: {$deletedDet} filas.\n";

$deletedCab = DB::table('utilidades_anuales')->delete();
echo "✔ Cabeceras de utilidades eliminadas: {$deletedCab} filas.\n";

echo "\n=== LIMPIEZA FINALIZADA ===\n";
