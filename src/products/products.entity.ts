import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Supplier } from 'suppliers/suppliers.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { ProductOrderCount } from 'product-order-count/product-order-count.entity';

export enum ProductPopularity {
  high = 'high',
  medium = 'medium',
  low = 'low',
  not_sold = 'not_sold',
}
@Entity()
@Unique(['sku'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  product: string;

  @Column({ nullable: true })
  rrp: string;

  @Column({ nullable: true })
  wholesalePrice: string;

  @Column({ nullable: true })
  wholesalePriceWithPromo: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  ean: string;

  @Column({ nullable: true })
  ean_original: string;

  @Column({ nullable: true })
  quantity: string;

  @Column({ nullable: true })
  productUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  popularity: ProductPopularity;

  @Column({ nullable: true })
  warehouse_stock: number;

  @Column({ nullable: true })
  minimumReorderAmount: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
    default: 0,
  })
  price: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.products)
  supplier: Supplier;

  @OneToMany(() => PurchaseOrderLineItem, (lineItem) => lineItem.product)
  purchaseOrderLineItems: PurchaseOrderLineItem[];

  @OneToMany(() => ProductOrderCount, (orderCount) => orderCount.product)
  orderCounts: ProductOrderCount[];
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
}

export type ProductsQueryParams = {
  pageNumber: number;
  pageSize: number;
  supplierId?: number;
  sku?: string;
  productName?: string;
  ean?: string;
  brand?: string;
  popularity?: ProductPopularity;
  stockStatus?: StockStatus;
  orderRange?: Date;
};
