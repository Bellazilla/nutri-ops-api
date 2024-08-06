import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './purchase-orders.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder])],
  exports: [TypeOrmModule],
})
export class PurchaseOrdersModule {}
