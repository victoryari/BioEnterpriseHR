<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$dets = DB::table('planillas_detalles')->get();
echo "Total planilla detalles en DB: " . $dets->count() . "\n";
foreach ($dets as $d) {
    echo "ID: {$d->id} | PlanillaID: {$d->planilla_id} | EmpID: {$d->empleado_id} | Nombre: {$d->nombre_empleado} | DNI: {$d->numero_documento}\n";
}
