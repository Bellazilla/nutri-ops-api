import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Image } from './presta_image.ps-entity';
import { PS_Product_Lang } from './presta_product_lang.ps-entity';
import { PS_Manufacturer } from './presta_manufacturer.ps-entity';
import { PS_Category } from './presta_category.ps-entity';
import { PS_Product_Attribute } from './presta_product-attribute.ps-entity';

@Entity({ name: 'ps_product' })
export class PS_Product {
  @PrimaryGeneratedColumn()
  id_product: number;

  @Column()
  quantity: number;

  @Column()
  ean13: string;

  @Column()
  product_type: string;

  @Column()
  price: number;

  @OneToMany(() => PS_Image, (image) => image.product)
  images: PS_Image[];

  @OneToMany(() => PS_Product_Lang, (lang) => lang.product)
  information: PS_Product_Lang[];

  @OneToMany(
    () => PS_Product_Attribute,
    (productAttribute) => productAttribute.product,
  )
  productAttributes: PS_Product_Attribute[];

  @ManyToOne(() => PS_Manufacturer, (manufacturer) => manufacturer.products)
  @JoinColumn({ name: 'id_manufacturer' })
  manufacturer: PS_Manufacturer;

  @ManyToOne(() => PS_Category, (category) => category.products)
  @JoinColumn({ name: 'id_category_default' })
  category: PS_Category;
}
