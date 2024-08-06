import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ErrorLogType } from 'error-logs/error-logs.entity';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { InventoryService } from 'inventory/inventory.service';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';
import { ProductsService } from 'products/products.service';
import { ReviewInvitationService } from 'review-invitation/review-invitation.service';
import { ShopifyService } from 'shopify/shopify.service';
import { TrustpilotService } from 'trustpilot/trustpilot.service';
import { WebAutomationService } from 'web-automation/web-automation.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    private readonly webAutomationService: WebAutomationService,
    private readonly errorLogsService: ErrorLogsService,
    private readonly reviewInvitationService: ReviewInvitationService,
    private readonly truspilotService: TrustpilotService,
    private readonly productOrderCountService: ProductOrderCountService,
    private readonly shopifyService: ShopifyService,
  ) {}

  @Cron('0 22 * * *')
  async handleSyncProductCountsFromOrders() {
    try {
      await this.productOrderCountService.syncDaysProductsCount();
    } catch (e) {
      this.logger.debug(
        'Something went wrong when syncing product order counts',
      );
      this.errorLogsService.create({
        type: ErrorLogType.ProductOrderCountSync,
        description: JSON.stringify(e),
      });
    }
  }

  @Cron('5 * * * *')
  async handleSyncProducts() {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('cron jobs are not executed in development envs');
      return;
    }
    const now = Date.now();
    this.logger.debug(`Product Sync began at: ${now}`);
    try {
      await this.webAutomationService.getLatestPowerbodyProductFile();
      await this.webAutomationService.getLatestPrometeusFile();
      await this.productsService.syncProducts();
      await this.inventoryService.adjustInventory();
      await this.productsService.syncProductsPopularity();
      await this.shopifyService.syncInventory();
    } catch (e) {
      this.logger.debug('Something went wrong when syncing products');
      this.errorLogsService.create({
        type: ErrorLogType.ProductSync,
        description: JSON.stringify(e),
      });
    }
  }

  @Cron('0 21 * * *')
  async handleSendServiceReview() {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('cron jobs are not executed in development envs');
      return;
    }
    const now = Date.now();
    this.logger.debug(`Service Review Invitation task began at: ${now}`);
    try {
      await this.reviewInvitationService.sendServiceReviewLinks();
      await this.reviewInvitationService.sendProductReviewLinks();
    } catch (e) {
      this.logger.debug('Something went wrong when sending review links');
      this.errorLogsService.create({
        type: ErrorLogType.TrustpilotReviewLinks,
        description: JSON.stringify(e),
      });
    }
  }
  @Cron('0 20 * * *')
  async handleSyncProductsWithTruspilot() {
    if (process.env.ENVIRONMENT === 'development') {
      console.info('cron jobs are not executed in development envs');
      return;
    }
    const now = Date.now();
    this.logger.debug(`Sync Trustpilot Products task began at: ${now}`);
    try {
      await this.truspilotService.syncProducts();
    } catch (e) {
      this.logger.debug('Something went wrong when syncing Truspilot products');
      this.errorLogsService.create({
        type: ErrorLogType.TrustpilotProductSync,
        description: JSON.stringify(e),
      });
    }
  }
}
