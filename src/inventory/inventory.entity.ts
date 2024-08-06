import { BaseEntity } from 'base-entity/base-entity';
import { Column, Entity } from 'typeorm';

export enum InventorySyncStatus {
  Started = 'started',
  Finished = 'finished',
  Cancelled = 'cancelled',
  Failed = 'failed',
}

@Entity()
export class Inventory extends BaseEntity {
  @Column()
  status: InventorySyncStatus;

  @Column({ nullable: true })
  description: string;
}
