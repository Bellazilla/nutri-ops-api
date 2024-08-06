import { Injectable } from '@nestjs/common';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrdersQueryParams,
} from './purchase-orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrderCreateDTO } from './dto/create-purchase-order-dto';
import { Product } from 'products/products.entity';
import { Supplier } from 'suppliers/suppliers.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { PurchaseOrderLineItemsService } from 'purchase-order-line-items/purchase-order-line-items.service';
import { PurchaseOrderUpdateDTO } from './dto/update-purchase-order-dto';
import { WmsService } from 'wms/wms.service';
import { exportPurchaseOrder as exportPowerbodyPurchaseOrder } from 'utilities/supplier-adapters/powerbody/export-purchase-order';
import { exportPurchaseOrder as exportPrometeusPurchaseOrder } from 'utilities/supplier-adapters/prometues/export-purchase-order';
import { exportPurchaseOrder as exportVitamin360PurchaseOrder } from 'utilities/supplier-adapters/vitamin360/export-purchase-order';
import { exportPurchaseOrder as exportDsnGroupPurchaseOrder } from 'utilities/supplier-adapters/dsn-groups/export-purchase-order';
import { exportPurchaseOrder as exportSwedishSupplementsPurchaseOrder } from 'utilities/supplier-adapters/swedish-supplements/export-purchase-order';
import { exportPurchaseOrder as exportBiouPurchaseOrder } from 'utilities/supplier-adapters/biou/export-purchase-order';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';
import { PurchaseOrderLineItemDto } from 'purchase-order-line-items/dto/create-purchase-order-line-item-dto';

type Paginate = {
  data: PurchaseOrder[];
  count: number;
};

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrderLineItem)
    private readonly purchaseOrderLineItemRepository: Repository<PurchaseOrderLineItem>,
    private readonly purchaseOrderLineItemService: PurchaseOrderLineItemsService,
    private readonly wmsService: WmsService,
    private readonly analyticsService: ProductOrderCountService,
  ) {}

  async setStatus(
    reference: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrder | string> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { reference: reference },
    });
    if (purchaseOrder?.id) {
      const updatePurchaseOrderResponse = await this.update({
        id: purchaseOrder.id,
        status,
      });

      return updatePurchaseOrderResponse;
    }

    return 'purchase order not found';
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find();
  }

  async findOne(id: number): Promise<PurchaseOrder | null> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier'],
    });
    return purchaseOrder;
  }

  async getProductsBytIds(productIds: number[]): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .whereInIds(productIds)
      .getMany();
  }

  async getPurchaseOrderLineItems(
    purchaseOrderId: number,
  ): Promise<PurchaseOrderLineItem[]> {
    return await this.purchaseOrderLineItemRepository.find({
      where: { purchaseOrder: { id: purchaseOrderId } },
      relations: ['productId'],
    });
  }

  async publish(
    updateDto: PurchaseOrderUpdateDTO,
  ): Promise<PurchaseOrder | string> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id: updateDto.id },
      });
      if (purchaseOrder?.id) {
        purchaseOrder.status = PurchaseOrderStatus.Created;
        purchaseOrder.reference = updateDto.reference;
        const updatedPurchaseOrder =
          await this.purchaseOrderRepository.save(purchaseOrder);
        await this.createOrUpdateWmsPurchaseOrder(purchaseOrder.id);
        return updatedPurchaseOrder;
      }
    } catch (e) {
      throw e;
    }
    return 'Something went wrong while updating the purchase order';
  }

  async update(
    updateDto: Partial<PurchaseOrderUpdateDTO>,
  ): Promise<PurchaseOrder | string> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: updateDto.id },
    });
    try {
      if (purchaseOrder?.id) {
        purchaseOrder.status = updateDto.status as PurchaseOrderStatus;
        const updatedPurchaseOrder =
          await this.purchaseOrderRepository.save(purchaseOrder);
        return updatedPurchaseOrder;
      }
    } catch (e) {
      throw e;
    }
    return 'Something went wrong while updating the purchase order';
  }

  async create(
    createDto: PurchaseOrderCreateDTO,
  ): Promise<PurchaseOrder | string> {
    const supplier = await this.supplierRepository.findOneBy({
      id: createDto.supplierId,
    });
    if (supplier?.id) {
      const purchaseOrder = new PurchaseOrder();
      purchaseOrder.reference = createDto.reference;
      purchaseOrder.supplier = supplier;
      purchaseOrder.status = PurchaseOrderStatus.Draft;
      const newPurchaseOrder =
        await this.purchaseOrderRepository.save(purchaseOrder);

      if (createDto.lineItems?.length) {
        await this.purchaseOrderLineItemService.createPurchaseOrderLineItems(
          newPurchaseOrder,
          createDto.lineItems,
        );
      }

      if (createDto.autoGenerateLineItems === true) {
        await this.purchaseOrderLineItemService.generateLineItemsBasedOnWmsOrders(
          { purchaseOrderId: newPurchaseOrder.id },
        );
      }

      return newPurchaseOrder;
    }

    return 'Given supplier does not exist in the system';
  }

  async createOrUpdateWmsPurchaseOrder(purchaseOrderId: number) {
    return await this.wmsService.putPurchaseOrder(purchaseOrderId);
  }

  async createSmartPurchaseOrder() {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    const products = await this.analyticsService.getTrendingProductsWithinRange(
      date,
      10,
    );
    const supplierIds = new Set();
    for (const p of products) {
      const productSupplierId = p.product.supplier.id;
      if (!supplierIds.has(productSupplierId)) {
        supplierIds.add(productSupplierId);
      }
    }

    for (const supplierId of supplierIds) {
      const supplierProducts = products.filter(
        (product) => product.product.supplier.id === supplierId,
      );
      const purchaseOrderLineItems: PurchaseOrderLineItemDto[] =
        supplierProducts.map((product) => ({
          productId: product.product.id,
          quantity: 20,
        }));
      this.create({
        supplierId: Number(supplierId),
        lineItems: purchaseOrderLineItems,
        autoGenerateLineItems: false,
        reference: 'auto-generated-po',
      });
    }
  }

  async exportPurchaseOrder(
    purchaseOrderId: number,
  ): Promise<string | undefined> {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id: purchaseOrderId },
        relations: ['supplier'],
      });
      if (purchaseOrder?.id) {
        const lineItems = await this.purchaseOrderLineItemRepository.find({
          where: { purchaseOrder: { id: purchaseOrderId } },
          relations: ['product'],
          order: { quantity: 'DESC' },
        });

        switch (purchaseOrder?.supplier?.name.toLowerCase()) {
          case 'powerbody':
            return await exportPowerbodyPurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.csv`,
            );
          case 'prometeus':
            return await exportPrometeusPurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.txt`,
            );
          case 'vitamin360':
            return await exportVitamin360PurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.csv`,
            );
          case 'dsn-group':
            return await exportDsnGroupPurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.csv`,
            );
          case 'swedishsupplements':
            return await exportSwedishSupplementsPurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.csv`,
            );
          case 'biou':
            return await exportBiouPurchaseOrder(
              lineItems,
              `${purchaseOrder.supplier.name}-${purchaseOrder?.id}.csv`,
            );
          default:
          // code block
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async query(queryParams: PurchaseOrdersQueryParams): Promise<Paginate> {
    const pageSize = queryParams.pageSize || 25;
    const pageNumber = queryParams.pageNumber || 1;
    const skip = (pageNumber - 1) * pageSize;

    const [data, count] = await this.purchaseOrderRepository.findAndCount({
      relations: ['supplier'],
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip,
    });

    return { data, count };
  }

  async remove(id: number) {
    try {
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id },
      });

      if (!purchaseOrder) {
        return {
          status: 404,
          message: `Purchase order with ID ${id} not found`,
        };
      }

      await this.purchaseOrderRepository.remove(purchaseOrder);

      return {
        status: 200,
        message: `Successfully deleted purchase order with ID ${id}`,
      };
    } catch (e) {
      return {
        status: 400,
        message: 'Something went wrong',
        error: e,
      };
    }
  }
}
