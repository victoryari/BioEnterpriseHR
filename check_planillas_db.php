<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$plas = DB::table('planillas_mensuales')->get();
echo "Total planillas mensuales en DB: " . $plas->count() . "\n";
foreach ($plas as $p) {
    echo "ID: {$p->id} | Periodo: {$p->periodo} | Empresa: {$p->empresa} | Neto: {$p->total_neto_pagar}\n";
}

$dets = DB::table('planilla_detalles')->get();
echo "\nTotal planilla detalles en DB: " . $dets->count() . "\n";
foreach ($dets as $d) {
    echo "ID: {$d->id} | PlanillaID: {$d->planilla_id} | EmpID: {$d->empleado_id} | Nombre: {$d->nombre_empleado} | DNI: {$d->numero_documento}\n";
}
