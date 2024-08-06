import { Test, TestingModule } from '@nestjs/testing';
import { WmsService } from './wms.service';

describe.skip('WmsService', () => {
  let service: WmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WmsService],
    }).compile();

    service = module.get<WmsService>(WmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
