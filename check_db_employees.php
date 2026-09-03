<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Empleado;

$emps = Empleado::all();
echo "Total empleados en DB: " . $emps->count() . "\n";
foreach ($emps as $e) {
    echo "ID: {$e->id} | DNI: {$e->numero_documento} | Nombre: {$e->nombre_completo} | Estado: {$e->estado}\n";
}
