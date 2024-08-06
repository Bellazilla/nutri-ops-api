import { Test, TestingModule } from '@nestjs/testing';
import { ReviewInvitationService } from './review-invitation.service';

describe.skip('ReviewInvitationService', () => {
  let service: ReviewInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewInvitationService],
    }).compile();

    service = module.get<ReviewInvitationService>(ReviewInvitationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
