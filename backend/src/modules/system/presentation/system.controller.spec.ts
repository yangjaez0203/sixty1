import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';
import { ApiResponse } from '../../../common/dto/api-response.dto';

describe('SystemController', () => {
  let controller: SystemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
    }).compile();

    controller = module.get<SystemController>(SystemController);
  });

  describe('GET /system/health', () => {
    it('should return status OK wrapped in ApiResponse', () => {
      expect(controller.health()).toEqual(ApiResponse.of({ status: 'OK' }));
    });
  });
});
