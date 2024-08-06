import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductOrderCount } from './product-order-count.entity';
import { WmsService } from 'wms/wms.service';

@Injectable()
export class ProductOrderCountService {
  constructor(
    @InjectRepository(ProductOrderCount)
    private readonly productOrderCountRepository: Repository<ProductOrderCount>,
    private readonly wmsService: WmsService,
  ) {}

  async syncDaysProductsCount() {
    try {
      const today = new Date();

      today.setDate(today.getDate() - 1);

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
      const day = String(today.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;
      const products = await this.wmsService.getMostPopularProducts(
        formattedDate,
        1,
      );
      for (const product of products) {
        await this.productOrderCountRepository.save({
          product: product,
          count: product.numberOfTimeOrdered,
        });
      }

      return 'Product counts synced succesfully';
    } catch (e) {
      console.error('Product counts sync failed');
    }
  }

  async countByGivenDate(dateTo: Date): Promise<ProductOrderCount[]> {
    const date = new Date(dateTo);
    date.setHours(0, 0, 0);

    const entries = await this.productOrderCountRepository.find({
      where: { createdAt: MoreThanOrEqual(date) },
      relations: ['product', 'product.supplier'],
      order: { product: { warehouse_stock: 'asc' } },
    });

    return entries;
  }

  calculateProductNumberOfOrders = (
    entries: ProductOrderCount[],
    productId: number,
  ): { productId: number; totalCount: number } => {
    let totalCount = 0;
    for (const entry of entries) {
      if (entry.product.id === productId) {
        totalCount += entry.count;
      }
    }

    return { productId, totalCount };
  };

  async getTrendingProductsWithinRange(
    dateTo: Date,
    targetNumberOfOrders: number,
  ) {
    const entries = await this.countByGivenDate(dateTo);
    const visitedIds = new Set();
    const filteredData = [];
    for (const entry of entries) {
      const productCount = this.calculateProductNumberOfOrders(
        entries,
        entry.product.id,
      );
      if (
        !visitedIds.has(entry.product.id) &&
        productCount.totalCount >= targetNumberOfOrders
      ) {
        visitedIds.add(entry.product.id);
        filteredData.push({
          product: entry.product,
          count: productCount.totalCount,
        });
      }
    }

    return filteredData;
  }
}
