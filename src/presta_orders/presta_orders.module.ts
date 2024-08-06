import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PS_Orders } from 'presta_entities/presta_order.ps-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PS_Orders], 'presta')],
  exports: [TypeOrmModule],
})
export class PrestaOrderstModule {}
