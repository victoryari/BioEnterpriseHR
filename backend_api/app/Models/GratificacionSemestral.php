<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GratificacionSemestral extends Model
{
    protected $table = 'gratificaciones_legales';
    public $incrementing = false;
    protected $keyType = 'string';
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'id',
        'periodo_semestral',
        'empresa',
        'conteo_trabajadores',
        'total_gratificacion_bruta',
        'total_bonificacion_ley',
        'total_neto_pagado',
        'estado',
    ];

    public function detalles()
    {
        return $this->hasMany(GratificacionDetalle::class, 'gratificacion_id', 'id');
    }
}