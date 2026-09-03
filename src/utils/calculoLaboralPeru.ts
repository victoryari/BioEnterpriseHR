/**
 * Módulo de Cálculos Laborales según la Legislación Laboral del Perú (D. Leg. 728 / D. Leg. 854)
 * 
 * Reglas de Jornada Nocturna y Horas Extras (2026):
 * 1. La jornada nocturna está comprendida entre las 22:00 y las 06:00 horas.
 * 2. La Remuneración Mínima Nocturna (piso legal) equivale a la RMV + 35% de sobretasa.
 *    En 2026: RMV S/ 1,130.00 + 35% (S/ 395.50) = Piso S/ 1,525.50.
 * 3. Si el sueldo base es <= S/ 1,525.50, se paga la sobretasa hasta alcanzar dicho piso.
 * 4. Si el sueldo base es > S/ 1,525.50, no hay obligación de adicional sobre el básico.
 * 5. Las Horas Extras Nocturnas se calculan sobre el valor de la hora ordinaria nocturna (+25% y +35%).
 */

export interface ResultadoCalculoNocturno {
  sueldoBase: number;
  rmv: number;
  sobretasaPorcentaje: number;
  pisoMinimoNocturno: number;
  aplicaReintegroPiso: boolean;
  montoReintegro: number;
  sueldoEfectivoNocturno: number;
  valorHoraOrdinariaNocturna: number;
  explicacionLegal: string;
}

export interface ResultadoHorasExtrasNocturnas {
  horasExtrasTotales: number;
  horasAl25: number;
  horasAl35: number;
  valorHoraBaseNocturna: number;
  montoHorasAl25: number;
  montoHorasAl35: number;
  totalPagoHorasExtras: number;
}

/**
 * Calcula el piso legal de la remuneración mínima nocturna en Perú
 */
export function calcularPisoMinimoNocturno(
  rmv: number = 1130.00,
  sobretasaPorcentaje: number = 35.00
): number {
  return Number((rmv * (1 + sobretasaPorcentaje / 100)).toFixed(2));
}

/**
 * Evalúa si un trabajador en jornada nocturna requiere reintegro al piso legal de S/ 1,525.50
 */
export function evaluarCompensacionNocturna(
  sueldoBase: number,
  rmv: number = 1130.00,
  sobretasaPorcentaje: number = 35.00,
  horasMensualesJornada: number = 240
): ResultadoCalculoNocturno {
  const pisoMinimoNocturno = calcularPisoMinimoNocturno(rmv, sobretasaPorcentaje);
  const aplicaReintegroPiso = sueldoBase < pisoMinimoNocturno;
  const montoReintegro = aplicaReintegroPiso
    ? Number((pisoMinimoNocturno - sueldoBase).toFixed(2))
    : 0.00;
  const sueldoEfectivoNocturno = aplicaReintegroPiso ? pisoMinimoNocturno : sueldoBase;
  const valorHoraOrdinariaNocturna = Number(
    (sueldoEfectivoNocturno / horasMensualesJornada).toFixed(4)
  );

  const explicacionLegal = aplicaReintegroPiso
    ? `Sueldo de S/ ${sueldoBase.toFixed(2)} es menor al piso legal nocturno de S/ ${pisoMinimoNocturno.toFixed(2)}. Se aplica reintegro de S/ ${montoReintegro.toFixed(2)}.`
    : `Sueldo de S/ ${sueldoBase.toFixed(2)} supera el piso mínimo legal de S/ ${pisoMinimoNocturno.toFixed(2)}. No requiere adicional sobre el básico contractual.`;

  return {
    sueldoBase,
    rmv,
    sobretasaPorcentaje,
    pisoMinimoNocturno,
    aplicaReintegroPiso,
    montoReintegro,
    sueldoEfectivoNocturno,
    valorHoraOrdinariaNocturna,
    explicacionLegal,
  };
}

/**
 * Calcula las Horas Extras en Jornada Nocturna con base en la hora ordinaria nocturna
 * - Primeras 2 horas: Recargo del 25%
 * - A partir de la 3ra hora: Recargo del 35%
 */
export function calcularHorasExtrasNocturnas(
  sueldoBase: number,
  horasExtras: number,
  rmv: number = 1130.00,
  sobretasaNocturna: number = 35.00,
  tasaHe1y2: number = 25.00,
  tasaHeResto: number = 35.00,
  horasMensualesJornada: number = 240
): ResultadoHorasExtrasNocturnas {
  const evaluacion = evaluarCompensacionNocturna(
    sueldoBase,
    rmv,
    sobretasaNocturna,
    horasMensualesJornada
  );
  const valorHoraBase = evaluacion.valorHoraOrdinariaNocturna;

  const horasAl25 = Math.min(horasExtras, 2);
  const horasAl35 = Math.max(0, horasExtras - 2);

  const valorHoraAl25 = valorHoraBase * (1 + tasaHe1y2 / 100);
  const valorHoraAl35 = valorHoraBase * (1 + tasaHeResto / 100);

  const montoHorasAl25 = Number((horasAl25 * valorHoraAl25).toFixed(2));
  const montoHorasAl35 = Number((horasAl35 * valorHoraAl35).toFixed(2));
  const totalPagoHorasExtras = Number((montoHorasAl25 + montoHorasAl35).toFixed(2));

  return {
    horasExtrasTotales: horasExtras,
    horasAl25,
    horasAl35,
    valorHoraBaseNocturna: Number(valorHoraBase.toFixed(2)),
    montoHorasAl25,
    montoHorasAl35,
    totalPagoHorasExtras,
  };
}

/**
 * Formatea un número como moneda peruana en Soles (S/.)
 */
export function formatoSoles(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
