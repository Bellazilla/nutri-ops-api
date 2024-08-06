import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrderCreateDTO } from './dto/create-purchase-order-dto';
import {
  PurchaseOrderStatus,
  PurchaseOrdersQueryParams,
} from './purchase-orders.entity';
import { PurchaseOrderUpdateDTO } from './dto/update-purchase-order-dto';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  findAll(@Query() queryParams: PurchaseOrdersQueryParams) {
    return this.purchaseOrdersService.query(queryParams);
  }

  @Post()
  create(@Body() createDto: PurchaseOrderCreateDTO) {
    return this.purchaseOrdersService.create(createDto);
  }

  @Put()
  update(@Body() updateDto: PurchaseOrderUpdateDTO) {
    return this.purchaseOrdersService.update(updateDto);
  }

  @Put('publish')
  publish(@Body() updateDto: PurchaseOrderUpdateDTO) {
    return this.purchaseOrdersService.publish(updateDto);
  }

  @Get('/create-smart-purchase-oder')
  createPurchaseSmartPurchaseOrder() {
    return this.purchaseOrdersService.createSmartPurchaseOrder();
  }

  @Get(':id') // Add ':id' to the route path
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(parseInt(id)); // Pass the 'id' as a parameter
  }

  @Get('/create-wms-purchase-oder/:id')
  createWmsPurchaseOrder(@Param('id') id: string) {
    return this.purchaseOrdersService.createOrUpdateWmsPurchaseOrder(
      parseInt(id),
    );
  }

  @Get('/:id/export')
  async exportPurchaseOrder(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.purchaseOrdersService.exportPurchaseOrder(
      parseInt(id),
    );
    if (filePath) {
      res.setHeader('Content-Disposition', `attachment;`);
      res.setHeader('Content-Type', 'application/txt');

      const fileStream = fs.createReadStream(filePath);

      fileStream.pipe(res);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.purchaseOrdersService.remove(id);
  }

  @Post('status-webhook-handler')
  handleStatusChangeWebhook(@Body() body: any) {
    const statusCode = body.purchaseOrderStatus.number;
    const reference = body.purchaseOrderNumber;

    if (statusCode === 100) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WmsNotified,
      );
    }

    if (statusCode === 200) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WmsArrival,
      );
    }

    if (statusCode === 300) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WmsInbound,
      );
    }

    if (statusCode === 400) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WmsDeflection,
      );
    }

    if (statusCode === 500) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WmsReceived,
      );
    }

    if (statusCode === 900) {
      return this.purchaseOrdersService.setStatus(
        reference,
        PurchaseOrderStatus.WMsCancelled,
      );
    }
  }
}
