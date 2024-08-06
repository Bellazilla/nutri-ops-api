import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PS_Product } from '../presta_entities/presta-product.ps-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PS_Product], 'presta')],
  exports: [TypeOrmModule],
})
export class PrestaProductModule {}
