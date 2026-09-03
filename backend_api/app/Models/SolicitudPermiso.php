<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudPermiso extends Model
{
    protected $table = 'solicitudes_permisos';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'empleado_id',
        'nombre_empleado',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'motivo',
        'nombre_documento',
        'ruta_documento',
        'estado',
        'revisado_por',
        'notas_revision',
        'fecha_solicitud',
    ];

    protected $casts = [
        'revisado_por' => 'integer',
    ];
}
