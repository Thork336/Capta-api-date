import { Injectable } from '@nestjs/common';
import { addDays, addHours, addMinutes, differenceInMinutes, format, formatISO, parseISO, setHours, setMinutes, setSeconds } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { COLOMBIA_HOLIDAYS } from '../common/constant';

@Injectable()
export class AppService {
  private readonly timeZone = 'America/Bogota';
  private WORK_START = 8;   // 08:00
  private LUNCH_START = 12; // 12:00
  private LUNCH_END = 13;   // 13:00
  private WORK_END = 17;    // 17:00

  /**
   * Calcula la fecha hábil sumando días y horas.
   * @param days Días hábiles (1 día = 8 horas hábiles)
   * @param hours Horas hábiles
   * @param utcDate Fecha inicial en UTC (opcional)
   */
  calculateBusinessDate(days: number, hours: number, utcDate?: string): string {
    // 1. Punto de inicio
    const startUtc: Date = utcDate ? parseISO(utcDate) : new Date();
    let current = utcToZonedTime(startUtc, this.timeZone);

    // 2. Normalizar fecha si cae fuera de horario laboral o en festivo
    current = this.adjustToBusinessStart(current);

    // 3. Convertir días a horas (1 día = 8 horas hábiles)
    let totalHours = days * 8 + hours;

    // 4. Avanzar horas hábiles
    current = this.addBusinessHours(current, totalHours);

    // 5. Convertir de nuevo a UTC y devolver en ISO con Z
    const resultUtc = zonedTimeToUtc(current, this.timeZone);
    return formatISO(resultUtc, { representation: 'complete' });
  }

  /**
   * Ajusta la fecha inicial al rango laboral más cercano.
   * @param date 
   * @returns 
   */
  private adjustToBusinessStart(date: Date): Date {
    let adjusted = new Date(date);

    // Saltar hasta siguiente día hábil si cae en festivo o fin de semana
    while (this.isWeekend(adjusted) || this.isHoliday(adjusted)) {
      adjusted = addDays(adjusted, 1);
      adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.WORK_START);
    }

    const hour = adjusted.getHours();

    // Antes de las 08:00 → 08:00
    if (hour < this.WORK_START) {
      adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.WORK_START);
    }
    // Almuerzo (12–13) → 13:00
    else if (hour >= this.LUNCH_START && hour < this.LUNCH_END) {
      adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.LUNCH_END);
    }
    // Después de 17:00 → siguiente hábil 08:00
    else if (hour >= this.WORK_END) {
      do {
        adjusted = addDays(adjusted, 1);
      } while (this.isWeekend(adjusted) || this.isHoliday(adjusted));
      adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.WORK_START);
    }

    return adjusted;
  }

  /**
   * Suma horas hábiles, respetando almuerzo, fin de jornada, fines de semana y festivos.
   * @param date 
   * @param hours 
   * @returns 
   */
  private addBusinessHours(date: Date, hours: number): Date {
    let adjusted = this.adjustToBusinessStart(date);
    let remaining = hours * 60; // trabajamos en minutos

    while (remaining > 0) {
      const hour = adjusted.getHours();

      // --- Caso: mañana (08–12)
      if (hour >= this.WORK_START && hour < this.LUNCH_START) {
        const limit = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.LUNCH_START);
        const available = differenceInMinutes(limit, adjusted);

        if (remaining <= available) {
          return addMinutes(adjusted, remaining);
        }

        // gastar la mañana completa
        remaining -= available;
        adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.LUNCH_END);
      }

      // --- Caso: tarde (13–17)
      else if (hour >= this.LUNCH_END && hour < this.WORK_END) {
        const limit = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.WORK_END);
        const available = differenceInMinutes(limit, adjusted);

        if (remaining <= available) {
          return addMinutes(adjusted, remaining);
        }

        // gastar la tarde completa
        remaining -= available;

        // pasar al siguiente día hábil 08:00
        do {
          adjusted = addDays(adjusted, 1);
        } while (this.isWeekend(adjusted) || this.isHoliday(adjusted));

        adjusted = setHours(setMinutes(setSeconds(adjusted, 0), 0), this.WORK_START);
      }

      // --- Caso: fuera de jornada (normalizar)
      else {
        adjusted = this.adjustToBusinessStart(adjusted);
      }
    }

    return adjusted;
  }


  private isWeekend(date: Date): boolean {
    const day = date.getDay(); // 0 = domingo, 6 = sábado
    return day === 0 || day === 6;
  }

  private isHoliday(date: Date): boolean {
    const key = format(date, 'yyyy-MM-dd');
    return COLOMBIA_HOLIDAYS.includes(key);
  }
}