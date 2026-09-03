<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispositivo extends Model
{
    protected $table = 'dispositivos';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'numero_serie',
        'nombre',
        'ubicacion',
        'sede_id',
        'direccion_ip',
        'puerto',
        'protocolo',
        'soporta_huella',
        'soporta_tarjeta_rfid',
        'soporta_pin',
        'estado',
        'ultimo_pulso',
        'conteo_usuarios',
        'conteo_registros',
        'version_firmware',
    ];

    protected $casts = [
        'puerto' => 'integer',
        'soporta_huella' => 'boolean',
        'soporta_tarjeta_rfid' => 'boolean',
        'soporta_pin' => 'boolean',
        'conteo_usuarios' => 'integer',
        'conteo_registros' => 'integer',
        'sede_id' => 'integer',
    ];
}
