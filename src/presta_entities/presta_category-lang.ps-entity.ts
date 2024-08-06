import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PS_Category } from './presta_category.ps-entity';

@Entity({ name: 'ps_category_lang' })
export class PS_Category_Lang {
  @PrimaryGeneratedColumn()
  id_category: number;

  @Column()
  id_lang: number;

  @Column()
  name: string;

  @ManyToOne(() => PS_Category, (category) => category.languages)
  @JoinColumn({ name: 'id_category' })
  category: PS_Category;
}
