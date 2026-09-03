<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AsignacionTurno extends Model
{
    protected $table = 'asignaciones_turnos';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null;

    protected $fillable = [
        'id',
        'empleado_id',
        'turno_id',
        'fecha_inicio',
        'fecha_fin',
    ];
}
