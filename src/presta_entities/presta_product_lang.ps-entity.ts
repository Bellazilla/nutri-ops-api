import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PS_Product } from './presta-product.ps-entity';

@Entity({ name: 'ps_product_lang' })
export class PS_Product_Lang {
  @PrimaryColumn()
  id_lang: number;

  @Column()
  id_product: number;

  @Column()
  link_rewrite: string;

  @Column()
  name: string;

  @Column()
  meta_description: string;

  @Column()
  description: string;

  @ManyToOne(() => PS_Product, (product) => product.information)
  @JoinColumn({ name: 'id_product' })
  product: PS_Product;
}
