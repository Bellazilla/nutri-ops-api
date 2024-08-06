import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ps_customer' })
export class PS_Customer {
  @PrimaryGeneratedColumn()
  id_customer: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;
}
