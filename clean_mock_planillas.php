<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== LIMPIANDO PLANILLAS DE PRUEBA DE MYSQL ===\n\n";

$delBol = DB::table('boletas_pago')->delete();
echo "✔ Boletas de pago eliminadas: {$delBol} filas.\n";

$delDet = DB::table('planillas_detalles')->delete();
echo "✔ Detalles de planilla eliminados: {$delDet} filas.\n";

$delCab = DB::table('planillas_mensuales')->delete();
echo "✔ Cabeceras de planilla eliminadas: {$delCab} filas.\n";

echo "\n=== LIMPIEZA FINALIZADA ===\n";
