import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users/users.controller';
import { UsersModule } from 'modules/user';
import { dataSourceOptions } from '../db/data-source';
import { SuppliersService } from './suppliers/suppliers.service';
import { SuppliersController } from 'suppliers/suppliers.controller';
import { SupplierModule } from 'modules/supplier';
import { ProductsModule } from './products/products.module';
import { ProductsService } from 'products/products.service';
import { ProductsController } from 'products/products.controller';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { PurchaseOrdersService } from 'purchase-orders/purchase-orders.service';
import { PurchaseOrdersController } from 'purchase-orders/purchase-orders.controller';
import { PurchaseOrderLineItemsModule } from './purchase-order-line-items/purchase-order-line-items.module';
import { PurchaseOrderLineItemsController } from 'purchase-order-line-items/purchase-order-line-items.controller';
import { PurchaseOrderLineItemsService } from 'purchase-order-line-items/purchase-order-line-items.service';
import { WmsController } from 'wms/wms.controller';
import { WmsService } from 'wms/wms.service';
import { StatisticsController } from './statistics/statistics.controller';
import { StatisticsService } from './statistics/statistics.service';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/task.service';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryController } from 'inventory/inventory.controller';
import { InventoryService } from 'inventory/inventory.service';
import { prestaShopDataSource } from '../db/presta-shop-data-source';
import { PrestaProductModule } from 'presta_product/presta-product.module';
import { PrestaProductController } from 'presta_product/presta-product.controller';
import { PrestaProductService } from 'presta_product/presta-product.service';
import { PrestaStockAvailabletModule } from 'presta_stock_available/presta-stock-available.module';
import { PrestaProductAttributeModule } from 'presta_product_attribute/presta-product-attribute.module';
import { WebAutomationService } from './web-automation/web-automation.service';
import { WebAutomationController } from './web-automation/web-automation.controller';
import { WebAutomationModule } from './web-automation/web-automation.module';
import { ErrorLogsModule } from './error-logs/error-logs.module';
import { ErrorLogsController } from 'error-logs/error-logs.controller';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { EmailServiceModule } from './email-service/email-service.module';
import { EmailServiceController } from 'email-service/email-service.controller';
import { EmailServiceService } from 'email-service/email-service.service';
import { PrestaOrdersController } from 'presta_orders/presta_orders.controller';
import { PrestaOrdersService } from 'presta_orders/presta_orders.service';
import { PrestaOrderstModule } from 'presta_orders/presta_orders.module';
import { TrustpilotService } from 'trustpilot/trustpilot.service';
import { TrustpilotController } from 'trustpilot/trustpilot.controller';
import { ReviewInvitationModule } from './review-invitation/review-invitation.module';
import { ReviewInvitationController } from 'review-invitation/review-invitation.controller';
import { ReviewInvitationService } from 'review-invitation/review-invitation.service';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';
import { ProductOrderCountController } from 'product-order-count/product-order-count.controller';
import { ProductOrderCountModule } from 'product-order-count/product-order-count.module';
import { ShopifyService } from './shopify/shopify.service';
import { ShopifyController } from './shopify/shopify.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forRoot(prestaShopDataSource),
    UsersModule,
    SupplierModule,
    ProductsModule,
    PurchaseOrdersModule,
    PurchaseOrderLineItemsModule,
    AuthModule,
    InventoryModule,
    PrestaProductModule,
    PrestaStockAvailabletModule,
    PrestaProductAttributeModule,
    WebAutomationModule,
    ErrorLogsModule,
    EmailServiceModule,
    PrestaOrderstModule,
    ReviewInvitationModule,
    ProductOrderCountModule,
  ],

  controllers: [
    AppController,
    UsersController,
    SuppliersController,
    ProductsController,
    PurchaseOrdersController,
    PurchaseOrderLineItemsController,
    WmsController,
    InventoryController,
    ErrorLogsController,
    PrestaProductController,
    StatisticsController,
    EmailServiceController,
    WebAutomationController,
    PrestaOrdersController,
    TrustpilotController,
    ReviewInvitationController,
    ProductOrderCountController,
    ShopifyController,
  ],

  providers: [
    AppService,
    SuppliersService,
    PurchaseOrdersService,
    ProductsService,
    ProductOrderCountService,
    PurchaseOrderLineItemsService,
    WmsService,
    StatisticsService,
    TasksService,
    InventoryService,
    PrestaProductService,
    WebAutomationService,
    ErrorLogsService,
    EmailServiceService,
    PrestaOrdersService,
    TrustpilotService,
    ReviewInvitationService,
    ShopifyService,
  ],
})
export class AppModule {}
