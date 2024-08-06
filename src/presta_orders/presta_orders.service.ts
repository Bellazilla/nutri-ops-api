import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PS_Orders } from 'presta_entities/presta_order.ps-entity';

@Injectable()
export class PrestaOrdersService {
  constructor(
    @InjectRepository(PS_Orders, 'presta')
    private readonly prestaOrdersRepository: Repository<PS_Orders>,
  ) {}

  async getRecordsFromMonthAgo() {
    const dateFrom = new Date();
    const dateTo = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setDate(dateTo.getDate() - 35);
    dateTo.setHours(0, 0, 0, 0);

    const data = await this.prestaOrdersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('order.orderHistories', 'orderHistories')
      .where('orderHistories.id_order_state = :stateId', { stateId: 4 })
      .andWhere('orderHistories.date_add < :dateFrom', { dateFrom })
      .andWhere('orderHistories.date_add > :dateTo', { dateTo })
      .getMany();

    return {
      count: data.length,
      data,
    };
  }

  async getRecordsFromTenDaysAgo() {
    const dateFrom = new Date();
    const dateTo = new Date();
    dateFrom.setDate(dateFrom.getDate() - 10);
    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setDate(dateTo.getDate() - 14);
    dateTo.setHours(0, 0, 0, 0);

    const data = await this.prestaOrdersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('order.orderHistories', 'orderHistories')
      .where('orderHistories.id_order_state = :stateId', { stateId: 4 })
      .andWhere('orderHistories.date_add < :dateFrom', { dateFrom })
      .andWhere('orderHistories.date_add > :dateTo', { dateTo })
      .getMany();

    return {
      count: data.length,
      data,
    };
  }
}
