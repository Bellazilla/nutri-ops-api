import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductOrderCount } from './product-order-count.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrderCount])],
  exports: [TypeOrmModule],
})
export class ProductOrderCountModule {}
