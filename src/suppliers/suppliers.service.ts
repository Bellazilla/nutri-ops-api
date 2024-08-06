import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './suppliers.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(supplierId: number): Promise<Supplier | null> {
    return await this.supplierRepository.findOne({ where: { id: supplierId } });
  }

  async activateSupplier(supplierId: number): Promise<boolean> {
    const supplier = await this.findOne(supplierId);
    if (supplier) {
      supplier.is_active = true;
      await this.supplierRepository.save(supplier);
      return true;
    }
    return false;
  }

  async deactivateSupplier(supplierId: number): Promise<boolean> {
    const supplier = await this.findOne(supplierId);
    if (supplier) {
      supplier.is_active = false;
      await this.supplierRepository.save(supplier);
      return true;
    }
    return false;
  }
}
