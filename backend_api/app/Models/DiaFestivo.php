<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiaFestivo extends Model
{
    protected $table = 'dias_festivos';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    protected $fillable = [
        'nombre',
        'fecha_festivo',
        'es_recurrente',
    ];

    protected $casts = [
        'es_recurrente' => 'boolean',
    ];
}
