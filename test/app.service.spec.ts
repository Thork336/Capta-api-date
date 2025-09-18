import { AppService } from 'src/modules/app.service';

describe('AppService - calculateBusinessDate', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('✅ Suma 6 horas y 1 día desde viernes 15:00', () => {
    const input = '2025-09-19T15:00:00Z'; // viernes 10:00 AM Bogotá
    const result = service.calculateBusinessDate(1, 6, input);
    expect(result).toBe('2025-09-22T17:00:00-05:00'); // lunes 08:00 + 6h
  });

  it('✅ Suma 3 horas desde sábado 14:00', () => {
    const input = '2025-09-20T19:00:00Z'; // sábado 14:00 Bogotá
    const result = service.calculateBusinessDate(0, 3, input);
    expect(result).toBe('2025-09-22T11:00:00-05:00'); // lunes 08:00 + 3h
  });

  it('✅ Suma 1 día y 4 horas desde martes 15:00', () => {
    const input = '2025-09-16T20:00:00Z'; // martes 15:00 Bogotá
    const result = service.calculateBusinessDate(1, 4, input);
    expect(result).toBe('2025-09-18T10:00:00-05:00'); // jueves 08:00 + 4h
  });

  it('✅ Suma 1 día desde domingo 18:00', () => {
    const input = '2025-09-21T23:00:00Z'; // domingo 18:00 Bogotá
    const result = service.calculateBusinessDate(1, 0, input);
    expect(result).toBe('2025-09-22T17:00:00-05:00'); // lunes 08:00
  });

  it('✅ Suma 8 horas desde día laboral 08:00', () => {
    const input = '2025-09-16T13:00:00Z'; // martes 08:00 Bogotá
    const result = service.calculateBusinessDate(0, 8, input);
    expect(result).toBe('2025-09-16T17:00:00-05:00'); // martes 17:00 Bogotá
  });

  it('✅ Suma 1 día desde 08:00', () => {
    const input = '2025-09-16T13:00:00Z'; // martes 08:00 Bogotá
    const result = service.calculateBusinessDate(1, 0, input);
    expect(result).toBe('2025-09-16T17:00:00-05:00'); // miércoles 08:00 Bogotá
  });

  it('✅ Suma 1 día desde 12:30', () => {
    const input = '2025-09-16T17:30:00Z'; // martes 12:30 Bogotá
    const result = service.calculateBusinessDate(1, 0, input);
    expect(result).toBe('2025-09-17T12:00:00-05:00'); // miércoles 08:00 Bogotá
  });

  it('✅ Suma 3 horas desde 11:30', () => {
    const input = '2025-09-16T16:30:00Z'; // martes 11:30 Bogotá
    const result = service.calculateBusinessDate(0, 3, input);
    expect(result).toBe('2025-09-16T15:30:00-05:00'); // martes 14:30 Bogotá
  });

  it('✅ Suma 5 días y 4 horas considerando festivos', () => {
    // suponiendo que 2025-04-17 y 2025-04-18 son festivos
    const input = '2025-04-10T15:00:00Z'; // jueves
    const result = service.calculateBusinessDate(5, 4, input);
    expect(result).toBe('2025-04-21T15:00:00-05:00'); // lunes 15:00 Bogotá + 4h
  });
});