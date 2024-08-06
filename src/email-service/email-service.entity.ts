import { BaseEntity } from 'base-entity/base-entity';
import { Column, Entity } from 'typeorm';

export enum EmailType {
  Failure = 'failure',
  Info = 'info',
}

@Entity()
export class Email extends BaseEntity {
  @Column()
  type: EmailType;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  body: string;

  @Column({ nullable: true })
  recipient: string;
}
