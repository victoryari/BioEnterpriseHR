<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$deleted = DB::table('liquidaciones_cese')->where('empleado_id', 'emp-4')->delete();
echo "✔ Registro de cese de prueba de Victor Antonio Mamani Yaringaño eliminado: {$deleted} filas.\n";
