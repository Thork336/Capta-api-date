import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'src/modules/app.controller';
import { AppService } from 'src/modules/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('calculate', () => {
    it('👉 debería calcular con days=1', () => {
      const result = appController.calculate('1', undefined, '2025-09-16T08:00:00-05:00');
      expect(result).toHaveProperty('date');
    });

    it('👉 debería lanzar error si no se pasa ni days ni hours', () => {
      expect(() => appController.calculate(undefined, undefined, '2025-09-16T08:00:00-05:00'))
        .toThrow('Debe proporcionar al menos uno de los parámetros');
    });
  });
});
