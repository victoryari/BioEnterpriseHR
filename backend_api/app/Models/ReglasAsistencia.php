<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReglasAsistencia extends Model
{
    protected $table = 'reglas_asistencia_empresa';

    const CREATED_AT = null;
    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'minutos_gracia_ingreso',
        'tolerancia_maxima_minutos',
        'sobretasa_he_primeras_dos',
        'sobretasa_he_restantes',
        'sobretasa_feriado_domingo',
        'dias_vacaciones_anuales',
        'minimo_dias_bloque_vacaciones',
        'minimo_dias_fraccionados',
        'inicio_jornada_nocturna',
        'fin_jornada_nocturna',
        'sobretasa_nocturna',
        'remuneracion_minima_vital',
        'piso_minimo_nocturno',
    ];

    protected $casts = [
        'minutos_gracia_ingreso' => 'integer',
        'tolerancia_maxima_minutos' => 'integer',
        'sobretasa_he_primeras_dos' => 'float',
        'sobretasa_he_restantes' => 'float',
        'sobretasa_feriado_domingo' => 'float',
        'dias_vacaciones_anuales' => 'integer',
        'minimo_dias_bloque_vacaciones' => 'integer',
        'minimo_dias_fraccionados' => 'integer',
        'sobretasa_nocturna' => 'float',
        'remuneracion_minima_vital' => 'float',
        'piso_minimo_nocturno' => 'float',
    ];
}
