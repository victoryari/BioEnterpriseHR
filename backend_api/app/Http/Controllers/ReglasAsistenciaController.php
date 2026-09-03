<?php

namespace App\Http\Controllers;

use App\Models\ReglasAsistencia;
use Illuminate\Http\Request;

class ReglasAsistenciaController extends Controller
{
    public function index(Request $request)
    {
        $reglas = ReglasAsistencia::first();
        if (!$reglas) {
            $reglas = ReglasAsistencia::create([
                'minutos_gracia_ingreso' => 10,
                'tolerancia_maxima_minutos' => 45,
                'sobretasa_he_primeras_dos' => 25.00,
                'sobretasa_he_restantes' => 35.00,
                'sobretasa_feriado_domingo' => 100.00,
                'dias_vacaciones_anuales' => 30,
                'minimo_dias_bloque_vacaciones' => 7,
                'minimo_dias_fraccionados' => 1,
                'inicio_jornada_nocturna' => '22:00:00',
                'fin_jornada_nocturna' => '06:00:00',
                'sobretasa_nocturna' => 35.00,
                'remuneracion_minima_vital' => 1130.00,
                'piso_minimo_nocturno' => 1525.50,
            ]);
        }
        return response()->json($reglas);
    }

    public function update(Request $request)
    {
        $reglas = ReglasAsistencia::first();
        if (!$reglas) {
            $reglas = new ReglasAsistencia();
        }

        $reglas->fill([
            'minutos_gracia_ingreso' => $request->input('minutosGraciaIngreso', $reglas->minutos_gracia_ingreso ?? 10),
            'tolerancia_maxima_minutos' => $request->input('toleranciaMaximaMinutos', $reglas->tolerancia_maxima_minutos ?? 45),
            'sobretasa_he_primeras_dos' => $request->input('sobretasaHePrimerasDos', $reglas->sobretasa_he_primeras_dos ?? 25.00),
            'sobretasa_he_restantes' => $request->input('sobretasaHeRestantes', $reglas->sobretasa_he_restantes ?? 35.00),
            'sobretasa_feriado_domingo' => $request->input('sobretasaFeriadoDomingo', $reglas->sobretasa_feriado_domingo ?? 100.00),
            'dias_vacaciones_anuales' => $request->input('diasVacacionesAnuales', $reglas->dias_vacaciones_anuales ?? 30),
            'minimo_dias_bloque_vacaciones' => $request->input('minimoDiasBloqueVacaciones', $reglas->minimo_dias_bloque_vacaciones ?? 7),
            'minimo_dias_fraccionados' => $request->input('minimoDiasFraccionados', $reglas->minimo_dias_fraccionados ?? 1),
            'inicio_jornada_nocturna' => $request->input('inicioJornadaNocturna', $reglas->inicio_jornada_nocturna ?? '22:00:00'),
            'fin_jornada_nocturna' => $request->input('finJornadaNocturna', $reglas->fin_jornada_nocturna ?? '06:00:00'),
            'sobretasa_nocturna' => $request->input('sobretasaNocturna', $reglas->sobretasa_nocturna ?? 35.00),
            'remuneracion_minima_vital' => $request->input('remuneracionMinimaVital', $reglas->remuneracion_minima_vital ?? 1130.00),
            'piso_minimo_nocturno' => $request->input('pisoMinimoNocturno', $reglas->piso_minimo_nocturno ?? 1525.50),
        ]);

        $reglas->save();

        return response()->json([
            'success' => true,
            'message' => 'Reglas de asistencia actualizadas en MySQL',
            'data' => $reglas,
        ]);
    }
}
