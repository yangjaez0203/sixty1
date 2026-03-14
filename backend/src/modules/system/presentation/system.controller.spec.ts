import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';

describe('SystemController', () => {
  let controller: SystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  describe('GET /system/health', () => {
    it('should return status OK', () => {
      expect(controller.health()).toEqual({ status: 'OK' });
    });
  });
});
