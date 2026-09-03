<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Empleado;
use Illuminate\Http\Request;

$controller = new App\Http\Controllers\EmpleadoController();
try {
    $res = $controller->destroy('emp-2');
    echo "Respuesta del controlador destroy:\n";
    print_r($res);
} catch (\Throwable $e) {
    echo "Error en destroy: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString();
}
