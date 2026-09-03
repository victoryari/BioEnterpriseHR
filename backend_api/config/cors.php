<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:8080'),
        env('FRONTEND_URL_MOBILE', 'http://10.0.2.2:8080'),
        'http://192.168.10.188:8080',
    ],

    'allowed_origins_patterns' => ['#^http://localhost:\d+$#', '#^http://192\.168\.10\.188:\d+$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
