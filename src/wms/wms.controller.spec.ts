import { Test, TestingModule } from '@nestjs/testing';
import { WmsController } from './wms.controller';
import { WmsService } from './wms.service';

describe.skip('WmsController', () => {
  let controller: WmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WmsController],
      providers: [WmsService],
    }).compile();

    controller = module.get<WmsController>(WmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
