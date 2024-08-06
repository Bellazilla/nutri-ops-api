import { Controller, Get } from '@nestjs/common';
import { PrestaProductService } from './presta-product.service';

@Controller('presta-products')
export class PrestaProductController {
  constructor(private readonly productsService: PrestaProductService) {}

  @Get()
  findAll() {
    return this.productsService.getPrestaProducts();
  }
}
