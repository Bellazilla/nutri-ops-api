import { Product } from 'products/products.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  address: string;

  @Column()
  email: string;

  @Column()
  logo: string;

  @Column({ nullable: true })
  is_active: boolean;

  @Column({ nullable: true })
  discountDeal: number;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
}
