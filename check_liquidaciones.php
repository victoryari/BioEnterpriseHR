<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$liqs = DB::table('liquidaciones_cese')->get();
echo "Total liquidaciones en DB: " . $liqs->count() . "\n";
foreach ($liqs as $l) {
    echo "ID: {$l->id} | EmpID: {$l->empleado_id} | Nombre: {$l->nombre_empleado} | FechaCese: {$l->fecha_cese} | Motivo: {$l->motivo_cese}\n";
}
