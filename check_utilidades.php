<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$cab = DB::table('utilidades_anuales')->get();
echo "Total cabeceras utilidades: " . $cab->count() . "\n";
foreach ($cab as $c) {
    echo "ID: {$c->id} | Anio: {$c->anio} | Empresa: {$c->empresa} | RentaNeta: {$c->renta_neta_imponible} | Pozo: {$c->pozo_total}\n";
}

$det = DB::table('utilidad_detalles')->get();
echo "\nTotal detalles utilidades: " . $det->count() . "\n";
foreach ($det as $d) {
    echo "ID: {$d->id} | EmpID: {$d->empleado_id} | Nombre: {$d->nombre_empleado} | UtilidadBruta: {$d->utilidad_bruta}\n";
}
