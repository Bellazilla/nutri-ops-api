import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PS_Category_Lang } from './presta_category-lang.ps-entity';
import { PS_Product } from './presta-product.ps-entity';

@Entity({ name: 'ps_category' })
export class PS_Category {
  @PrimaryGeneratedColumn()
  id_category: number;

  @OneToMany(() => PS_Category_Lang, (categoryLang) => categoryLang.category)
  languages: PS_Category_Lang[];

  @OneToMany(() => PS_Product, (product) => product.category)
  products: PS_Category_Lang[];
}
