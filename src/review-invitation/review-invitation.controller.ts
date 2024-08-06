import { Controller, Get } from '@nestjs/common';
import { ReviewInvitationService } from './review-invitation.service';

@Controller('review-invitation')
export class ReviewInvitationController {
  constructor(
    private readonly reviewInvitationService: ReviewInvitationService,
  ) {}

  @Get('send-service-reviews')
  sendReviewLinks() {
    return this.reviewInvitationService.sendServiceReviewLinks();
  }
  @Get('send-product-reviews')
  sendProductReviewLinks() {
    return this.reviewInvitationService.sendProductReviewLinks();
  }
}
