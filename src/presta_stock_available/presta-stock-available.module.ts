import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PS_Stock_Available], 'presta')],
  exports: [TypeOrmModule],
})
export class PrestaStockAvailabletModule {}
