import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsQueryParams } from './products.entity';
import { AuthGuard } from 'auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() queryParams: ProductsQueryParams) {
    return this.productsService.query(queryParams);
  }

  @Get('insuficient-products')
  getInsuficientProducts() {
    return this.productsService.getOutOfStockProducts();
  }

  @Get('reset-products-quantity')
  resetProductsQuantity() {
    return this.productsService.resetProductsQuantity();
  }

  @Get('get-trending-products')
  getTrendingProducts(@Query('date') date: Date) {
    return this.productsService.getTrendingProducts(date);
  }

  @Get('sync-products-popularity')
  syncProductsPopularity() {
    return this.productsService.syncProductsPopularity();
  }

  // @UseGuards(AuthGuard)
  @Get('sync')
  async sync() {
    try {
      const response = await this.productsService.syncProducts();
      return {
        status: 200,
        message: response,
      };
    } catch (e) {
      return {
        status: 500,
        error: e || 'Internal Server Error',
      };
    }
  }
}
