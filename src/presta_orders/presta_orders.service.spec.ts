import { Test, TestingModule } from '@nestjs/testing';
import { PrestaOrdersService } from './presta_orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PS_Orders } from 'presta_entities/presta_order.ps-entity';
import { Repository } from 'typeorm';

describe('PrestaOrdersService', () => {
  let service: PrestaOrdersService;
  const mockOrder: PS_Orders = { reference: 'test-order' } as PS_Orders;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrestaOrdersService,
        {
          provide: getRepositoryToken(PS_Orders, 'presta'),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PrestaOrdersService>(PrestaOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get orders from a months ago', async () => {
    const mockOrders = [mockOrder];

    const createQueryBuilder: any = {
      select: () => createQueryBuilder,
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      andWhere: () => createQueryBuilder,
      getMany: () => mockOrders,
    };

    jest
      .spyOn(service['prestaOrdersRepository'], 'createQueryBuilder')
      .mockImplementation(() => createQueryBuilder);

    const result = { count: mockOrders.length, data: mockOrders };

    await expect(service.getRecordsFromMonthAgo()).resolves.toEqual(result);
  });

  it('should get orders from a 10 days ago', async () => {
    const mockOrders = [mockOrder];

    const createQueryBuilder: any = {
      select: () => createQueryBuilder,
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      andWhere: () => createQueryBuilder,
      getMany: () => mockOrders,
    };

    jest
      .spyOn(service['prestaOrdersRepository'], 'createQueryBuilder')
      .mockImplementation(() => createQueryBuilder);

    const result = { count: mockOrders.length, data: mockOrders };

    await expect(service.getRecordsFromTenDaysAgo()).resolves.toEqual(result);
  });
});
