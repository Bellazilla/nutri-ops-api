import { Test, TestingModule } from '@nestjs/testing';
import { ReviewInvitationController } from './review-invitation.controller';
import { ReviewInvitationService } from './review-invitation.service';

describe.skip('ReviewInvitationController', () => {
  let controller: ReviewInvitationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewInvitationController],
      providers: [ReviewInvitationService],
    }).compile();

    controller = module.get<ReviewInvitationController>(
      ReviewInvitationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
