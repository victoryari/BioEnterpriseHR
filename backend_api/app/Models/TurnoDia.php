<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoDia extends Model
{
    protected $table = 'turnos_dias';
    public $timestamps = false;

    protected $fillable = [
        'turno_id',
        'dia_semana',
        'nombre_dia',
        'horario_id',
        'es_laborable',
    ];

    protected $casts = [
        'dia_semana' => 'integer',
        'es_laborable' => 'boolean',
    ];

    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id', 'id');
    }
}
