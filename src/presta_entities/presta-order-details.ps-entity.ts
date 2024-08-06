import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Orders } from './presta_order.ps-entity';

@Entity({ name: 'ps_order_detail' })
export class PS_Order_Detail {
  @PrimaryGeneratedColumn()
  id_order_detail: number;

  @Column()
  product_name: string;

  @Column()
  product_quantity: number;

  @Column()
  product_reference: string;

  @ManyToOne(() => PS_Orders, (order) => order.orderDetails)
  @JoinColumn({ name: 'id_order' })
  order: PS_Orders;
}
