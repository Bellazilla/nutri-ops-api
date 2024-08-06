import { Controller, Get } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('shopify')
export class ShopifyController {
  constructor(private readonly service: ShopifyService) {}

  @Get('products')
  getProducts() {
    return this.service.getProducts();
  }

  @Get('sync-inventory')
  syncInventory() {
    return this.service.syncInventory();
  }
}
