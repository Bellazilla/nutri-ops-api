import { Test, TestingModule } from '@nestjs/testing';
import { TrustpilotService } from './trustpilot.service';

describe.skip('TrustpilotService', () => {
  let service: TrustpilotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrustpilotService],
    }).compile();

    service = module.get<TrustpilotService>(TrustpilotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
