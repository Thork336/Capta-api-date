import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly dateService: AppService) {}

  /**
   * Endpoint principal de la prueba técnica.
   * Recibe parámetros days, hours y date (opcional).
   * Devuelve una fecha en formato UTC (ISO8601 con Z).
   */
  @Get('calculate')
  calculate(
    @Query('days') days?: string,
    @Query('hours') hours?: string,
    @Query('date') date?: string,
  ) {
    const daysInt = days ? parseInt(days, 10) : 0;
    const hoursInt = hours ? parseInt(hours, 10) : 0;

    if ((!days || isNaN(daysInt)) && (!hours || isNaN(hoursInt))) {
      throw new BadRequestException({
        error: 'InvalidParameters',
        message: 'Debe proporcionar al menos uno de los parámetros: days u hours',
      });
    }

    const resultUtc = this.dateService.calculateBusinessDate(
      daysInt,
      hoursInt,
      date,
    );

    return { date: resultUtc };
  }
}
