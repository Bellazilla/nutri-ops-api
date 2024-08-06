import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { Product, ProductPopularity } from 'products/products.entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { Supplier } from 'suppliers/suppliers.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly errorLogsService: ErrorLogsService,
  ) {}

  async getTopSellingProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { popularity: ProductPopularity.high },
    });
  }

  async getStatistics(): Promise<any> {
    const activePurchaseOrders = await this.purchaseOrderRepository.count();
    const products = await this.productRepository.count();
    const suppliersData = await this.supplierRepository.find();
    const todaysErrors = await this.errorLogsService.getTodaysErrors();

    const suppliers: any[] = [];
    await Promise.all(
      suppliersData.map(async (supplier) => {
        const productsCount = await this.productRepository.count({
          where: { supplier: { id: supplier.id } },
        });
        suppliers.push({
          supplier: supplier,
          productsCount: productsCount,
        });
      }),
    );

    return {
      purchaseOrders: activePurchaseOrders,
      products: products,
      suppliers,
      todaysErrors,
    };
  }
}
