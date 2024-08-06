import { BaseEntity } from 'base-entity/base-entity';
import { Product } from 'products/products.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class ProductOrderCount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  count: number;

  @ManyToOne(() => Product, (product) => product.orderCounts)
  product: Product;
}
