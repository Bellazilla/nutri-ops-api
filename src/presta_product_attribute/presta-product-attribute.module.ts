import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PS_Product_Attribute], 'presta')],
  exports: [TypeOrmModule],
})
export class PrestaProductAttributeModule {}
