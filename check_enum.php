<?php
require_once 'c:\laragon\www\bioenterprise_api\vendor\autoload.php';
$app = require_once 'c:\laragon\www\bioenterprise_api\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$result = Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM marcaciones_asistencia WHERE Field='metodo_verificacion'");
echo $result[0]->Type . "\n";

$result2 = Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM marcaciones_asistencia WHERE Field='tipo'");
echo $result2[0]->Type . "\n";
