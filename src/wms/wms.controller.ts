import { Controller, Get } from '@nestjs/common';
import { WmsService } from './wms.service';

@Controller('wms')
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  @Get('get-products-with-low-stock')
  getProductsWithLowStock() {
    return this.wmsService.getProductsWithLowStock();
  }

  // @Get('get-most-popular-products')
  // getMostPopularProducts(): Promise<PopularProduct[]> {
  //   return this.wmsService.getMostPopularProducts();
  // }
}
