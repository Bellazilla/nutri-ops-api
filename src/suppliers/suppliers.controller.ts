import { Body, Controller, Get, Put } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly supplierService: SuppliersService) {}

  @Get()
  findAll() {
    return this.supplierService.findAll();
  }

  @Put('activate')
  activateSupplier(@Body('id') id: number) {
    return this.supplierService.activateSupplier(id);
  }
  @Put('deactivate')
  deactivateSupplier(@Body('id') id: number) {
    return this.supplierService.deactivateSupplier(id);
  }
}
