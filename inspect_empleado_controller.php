<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ref = new ReflectionClass(App\Http\Controllers\EmpleadoController::class);
echo "Métodos de EmpleadoController:\n";
foreach ($ref->getMethods(ReflectionMethod::IS_PUBLIC) as $m) {
    if ($m->class === App\Http\Controllers\EmpleadoController::class) {
        echo " - " . $m->getName() . "\n";
    }
}

echo "\nRutas registradas para /api/empleados:\n";
$routes = Illuminate\Support\Facades\Route::getRoutes();
foreach ($routes as $route) {
    if (str_contains($route->uri(), 'empleados')) {
        echo " " . implode('|', $route->methods()) . " " . $route->uri() . " -> " . $route->getActionName() . "\n";
    }
}
