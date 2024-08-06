import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../suppliers/suppliers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  exports: [TypeOrmModule],
})
export class SupplierModule {}
