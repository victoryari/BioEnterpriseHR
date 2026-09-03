<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarcacionAsistencia extends Model
{
    protected $table = 'marcaciones_asistencia';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'fecha',
        'hora',
        'fecha_hora',
        'empleado_id',
        'nombre_empleado',
        'pin',
        'numero_tarjeta',
        'dispositivo_id',
        'nombre_dispositivo',
        'tipo',
        'estado',
        'metodo_verificacion',
        'es_error',
        'trama_cruda',
    ];

    protected $casts = [
        'es_error' => 'boolean',
    ];
}
