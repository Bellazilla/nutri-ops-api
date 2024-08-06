import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Customer } from './presta_customer.ps-entity';
import { PS_Order_Detail } from './presta-order-details.ps-entity';
import { PS_Order_History } from './presta_order-history.ps-entity';

@Entity({ name: 'ps_orders' })
export class PS_Orders {
  @PrimaryGeneratedColumn()
  id_order: number;

  @Column()
  reference: string;

  @Column()
  id_customer: number;

  @Column()
  date_add: Date;

  @Column()
  current_state: number;

  @ManyToOne(() => PS_Customer, (customer) => customer.id_customer)
  @JoinColumn({ name: 'id_customer' })
  customer: PS_Customer;

  @OneToMany(() => PS_Order_Detail, (orderDetail) => orderDetail.order)
  @JoinColumn({ name: 'id_order_detail' })
  orderDetails: PS_Order_Detail[];

  @OneToMany(() => PS_Order_History, (orderHistory) => orderHistory.order)
  @JoinColumn({ name: 'id_order_history' })
  orderHistories: PS_Order_History[];
}
