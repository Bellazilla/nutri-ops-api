import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Product } from './presta-product.ps-entity';

@Entity({ name: 'ps_image' })
export class PS_Image {
  @PrimaryGeneratedColumn()
  id_image: number;

  @Column()
  id_product: number;

  @ManyToOne(() => PS_Product, (product) => product.images)
  @JoinColumn({ name: 'id_product' })
  product: PS_Product;
}
