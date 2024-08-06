import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PS_Product_Attribute } from './presta_product-attribute.ps-entity';

@Entity({ name: 'ps_product_attribute_image' })
export class PS_Product_Attribute_Image {
  @PrimaryGeneratedColumn()
  id_image: number;

  @ManyToOne(() => PS_Product_Attribute, (pa) => pa.images)
  @JoinColumn({ name: 'id_product_attribute' })
  productAttribute: PS_Product_Attribute;
}
