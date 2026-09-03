<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$cab = DB::table('utilidades_anuales')->get();
echo "Total cabeceras utilidades: " . $cab->count() . "\n";
print_r($cab);

$det = DB::table('utilidad_detalles')->get();
echo "\nTotal detalles utilidades: " . $det->count() . "\n";
print_r($det);
