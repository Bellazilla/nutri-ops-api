import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Stock_Available } from './presta-stock-available.ps-entity';
import { PS_Product } from './presta-product.ps-entity';
import { PS_Product_Attribute_Image } from './presta_product-attribute-image.ps-entity';

@Entity({ name: 'ps_product_attribute' })
export class PS_Product_Attribute {
  @PrimaryGeneratedColumn()
  id_product_attribute: number;

  @Column()
  ean13: string;

  @Column()
  id_product: number;

  @Column()
  price: number;

  @OneToMany(
    () => PS_Stock_Available,
    (stockAvailable) => stockAvailable.productAttribute,
  )
  @JoinColumn({ name: 'id_stock_available' })
  stockAvailable: PS_Stock_Available[];

  @ManyToOne(() => PS_Product, (product) => product.productAttributes)
  @JoinColumn({ name: 'id_product' })
  product: PS_Product;

  @OneToMany(
    () => PS_Product_Attribute_Image,
    (image) => image.productAttribute,
  )
  @JoinColumn({ name: 'id_product_attribute' })
  images: PS_Product_Attribute_Image[];
}
