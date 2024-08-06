import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PurchaseOrderLineItemsService } from './purchase-order-line-items.service';
import { PurchaseOrderLineItemQueryParams } from './purchase-ordier-line-items.entity';
import { UpdatePurchaseOrderLineItemDto } from './dto/update-purchase-order-line-item-dto';
import {
  CreatePurchaseOrderLineItemDto,
  GeneratePurchaseOrderLineItemsDto,
} from './dto/create-purchase-order-line-item-dto';

@Controller('purchase-order-line-items')
export class PurchaseOrderLineItemsController {
  constructor(
    private readonly purchaseOrderLineItemsService: PurchaseOrderLineItemsService,
  ) {}

  @Get()
  query(@Query() queryParams: PurchaseOrderLineItemQueryParams) {
    return this.purchaseOrderLineItemsService.query(queryParams);
  }

  @Put()
  update(@Body() updateDto: UpdatePurchaseOrderLineItemDto) {
    return this.purchaseOrderLineItemsService.update(updateDto);
  }

  @Post()
  create(@Body() createDto: CreatePurchaseOrderLineItemDto) {
    return this.purchaseOrderLineItemsService.create(createDto);
  }

  @Post('generate')
  generateLineItemsBasedOnWmsOrders(
    @Body() generateLineItemsDto: GeneratePurchaseOrderLineItemsDto,
  ) {
    return this.purchaseOrderLineItemsService.generateLineItemsBasedOnWmsOrders(
      generateLineItemsDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.purchaseOrderLineItemsService.remove(id);
  }
}
