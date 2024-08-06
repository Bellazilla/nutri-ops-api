import { BaseEntity } from 'base-entity/base-entity';
import { Column, Entity } from 'typeorm';

export enum ErrorLogType {
  OngoingWMS = 'onGoingWms',
  Internal = 'internal',
  FileDownload = 'fileDownload',
  ProductSync = 'productSync',
  TrustpilotProductSync = 'trustpilotProductSync',
  TrustpilotReviewLinks = 'trustpilotReviewLinks',
  ProductOrderCountSync = 'productOrderCountSync',
  Unkown = 'unknown',
}

@Entity()
export class ErrorLog extends BaseEntity {
  @Column()
  type: ErrorLogType;

  @Column({ nullable: true })
  description: string;
}
