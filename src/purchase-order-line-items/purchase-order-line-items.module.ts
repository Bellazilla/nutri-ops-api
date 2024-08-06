import { Module } from '@nestjs/common';

import { PurchaseOrderLineItem } from './purchase-ordier-line-items.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrderLineItem])],
  exports: [TypeOrmModule],
})
export class PurchaseOrderLineItemsModule {}
