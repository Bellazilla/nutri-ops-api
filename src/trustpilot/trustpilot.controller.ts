import { Controller, Get } from '@nestjs/common';
import { TrustpilotService } from './trustpilot.service';

@Controller('trustpilot')
export class TrustpilotController {
  constructor(private readonly trustpilotService: TrustpilotService) {}

  @Get('get-access-token')
  getAccessToken() {
    return this.trustpilotService.getAccessToken();
  }

  @Get('get-products')
  async getProducts() {
    return await this.trustpilotService.getProducts([
      '5065004115155',
      '0733739032577',
    ]);
  }

  @Get('generate-products-review-link')
  async generateProductsReviewLink() {
    const mockProductIds = [
      '6536f5d763300896321212c6',
      '63b83bbc015dae44c3cd4397',
    ];
    const mockEmail = 'shahali.arya@gmail.com';
    const mockName = 'Arya Shahali';
    const mockReferenceId = 'mock-ref';
    return await this.trustpilotService.generateProductsReviewLink(
      mockProductIds,
      mockEmail,
      mockName,
      mockReferenceId,
    );
  }

  @Get('sync-products')
  async syncProducts() {
    return await this.trustpilotService.syncProducts();
  }
}
