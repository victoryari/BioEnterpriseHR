<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    protected $table = 'horarios';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'nombre',
        'hora_entrada',
        'ventana_entrada_desde',
        'ventana_entrada_hasta',
        'hora_salida',
        'ventana_salida_desde',
        'ventana_salida_hasta',
        'minutos_tolerancia',
        'inicio_refrigerio',
        'fin_refrigerio',
        'minutos_refrigerio',
        'marcado_refrigerio_obligatorio',
        'color_tag',
    ];

    protected $casts = [
        'minutos_tolerancia' => 'integer',
        'minutos_refrigerio' => 'integer',
        'marcado_refrigerio_obligatorio' => 'boolean',
    ];
}