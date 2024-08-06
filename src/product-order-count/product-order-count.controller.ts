import { Controller, Get, Query } from '@nestjs/common';
import { ProductOrderCountService } from './product-order-count.service';

@Controller('product-order-count')
export class ProductOrderCountController {
  constructor(
    private readonly productOrderCountService: ProductOrderCountService,
  ) {}

  @Get('sync')
  syncDaysProductsCount() {
    return this.productOrderCountService.syncDaysProductsCount();
  }

  @Get('count-by-given-date')
  countbyGivenDate(@Query('date') date: Date) {
    return this.productOrderCountService.getTrendingProductsWithinRange(
      date,
      10,
    );
  }
}
