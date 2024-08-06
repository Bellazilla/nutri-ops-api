import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Orders } from './presta_order.ps-entity';
@Entity({ name: 'ps_order_history' })
export class PS_Order_History {
  @PrimaryGeneratedColumn()
  id_order_history: number;

  @Column()
  id_order: number;

  @Column()
  id_order_state: number;

  @Column()
  date_add: Date;

  @ManyToOne(() => PS_Orders, (order) => order.orderHistories)
  @JoinColumn({ name: 'id_order' })
  order: PS_Orders;
}
