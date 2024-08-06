import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Supplier } from 'suppliers/suppliers.entity';
import { BaseEntity } from 'base-entity/base-entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

export enum PurchaseOrderStatus {
  Draft = 'draft',
  Created = 'created',
  Cancelled = 'cancelled',
  WmsNotified = 'wmsNotified',
  WmsArrival = 'wmsArrival',
  WmsInbound = 'wmsInbound',
  WmsDeflection = 'wmsDeflection',
  WmsReceived = 'wmsReceived',
  WMsCancelled = 'wmsCancelled',
}

@Entity()
export class PurchaseOrder extends BaseEntity {
  @Column()
  reference: string;

  @Column()
  supplierId: number;

  @Column({
    nullable: true,
    type: 'enum',
    enum: PurchaseOrderStatus, // Specify the enum type
    default: PurchaseOrderStatus.Draft, // Optional: Set a default value
  })
  status: PurchaseOrderStatus; // Use the enum type here

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @OneToMany(
    () => PurchaseOrderLineItem,
    (lineItem) => lineItem.purchaseOrder,
    { cascade: true },
  )
  lineItems: PurchaseOrderLineItem[];
}

export type PurchaseOrdersQueryParams = {
  id: number;
  pageNumber: number;
  pageSize: number;
};
