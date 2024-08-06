import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PS_Product } from './presta-product.ps-entity';

@Entity({ name: 'ps_manufacturer' })
export class PS_Manufacturer {
  @PrimaryGeneratedColumn()
  id_manufacturer: number;

  @Column()
  name: string;

  @OneToMany(() => PS_Product, (product) => product.manufacturer)
  products: PS_Product[];
}
