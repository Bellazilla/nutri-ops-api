import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from 'base-entity/base-entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { Product } from 'products/products.entity';

@Entity()
export class PurchaseOrderLineItem extends BaseEntity {
  @ManyToOne(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.lineItems, {
    onDelete: 'CASCADE',
  })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, (product) => product.purchaseOrderLineItems)
  product: Product;

  @Column()
  quantity: number;
}

export type PurchaseOrderLineItemQueryParams = {
  pageNumber: number;
  pageSize: number;
  purchaseOrderId: number;
  ean: string;
  sku: string;
  brand: string;
  productName: string;
};
