import { Test, TestingModule } from '@nestjs/testing';
import { TrustpilotController } from './trustpilot.controller';
import { TrustpilotService } from './trustpilot.service';

describe.skip('TrustpilotController', () => {
  let controller: TrustpilotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrustpilotController],
      providers: [TrustpilotService],
    }).compile();

    controller = module.get<TrustpilotController>(TrustpilotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
