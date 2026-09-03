<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Empleado;

$e = Empleado::find('emp-4');
if ($e) {
    echo "ID: {$e->id}\n";
    echo "Nombre: {$e->nombre_completo}\n";
    echo "DNI: {$e->numero_documento}\n";
    echo "Estado: {$e->estado}\n";
    echo "Empresa: '{$e->empresa}'\n";
} else {
    echo "Empleado emp-4 no encontrado\n";
}
