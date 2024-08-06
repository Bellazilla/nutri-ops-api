import { Controller, Get } from '@nestjs/common';
import { PrestaOrdersService } from './presta_orders.service';

@Controller('presta-orders')
export class PrestaOrdersController {
  constructor(private readonly prestaOrdersService: PrestaOrdersService) {}

  @Get()
  findAll() {
    return this.prestaOrdersService.getRecordsFromTenDaysAgo();
  }
}
