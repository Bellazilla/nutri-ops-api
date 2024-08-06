import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory])],
  exports: [TypeOrmModule],
})
export class InventoryModule {}
