import { BaseEntity } from 'base-entity/base-entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum ReviewType {
  Service = 'service',
  Product = 'product',
}
@Entity()
export class ReviewInvitation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referenceId: string;

  @Column()
  invitation_link: string;

  @Column({ nullable: true })
  review_type: ReviewType;
}
