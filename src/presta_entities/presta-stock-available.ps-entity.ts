import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Product_Attribute } from './presta_product-attribute.ps-entity';

@Entity({ name: 'ps_stock_available' })
export class PS_Stock_Available {
  @PrimaryGeneratedColumn()
  id_stock_available: number;

  @Column()
  id_product: number;

  @Column()
  id_product_attribute: number;

  @Column({ nullable: true })
  quantity: number;

  @ManyToOne(
    () => PS_Product_Attribute,
    (productAttribute) => productAttribute.stockAvailable,
  )
  @JoinColumn({ name: 'id_product_attribute' })
  productAttribute: PS_Product_Attribute;
}
